import mermaidPluginModule from '@bytemd/plugin-mermaid';
import type { BytemdPlugin } from 'bytemd';
import {
  pickMermaidLocale,
  resolveCallable,
  resolveMermaidApi,
  svgFromRenderResult,
} from './mermaidInterop';
import {
  applyMermaidThemeClass,
  applyMermaidThemeToTree,
  detectPaintIsDark,
  mermaidInitConfig,
} from './mermaidTheme';

/**
 * Mermaid 10's `render()` appends temporary measurement nodes (`#d{id}`) to
 * `document.body`. `@bytemd/plugin-mermaid` does not always remove them, so
 * they can sit over ByteMD/CodeMirror and swallow clicks and typing.
 *
 * The official plugin also `replaceWith`s the preview `<pre>` and fires
 * concurrent `render()` calls. ByteMD/Svelte then throws on the next
 * keystroke (`… is not iterable` / error overlay). Keep the source `<pre>`
 * in the tree, paint diagrams as siblings, and serialize renders.
 *
 * Load the UMD bundle (`mermaid.min.js`) instead of `mermaid.core.mjs`.
 * The core entry re-exports `khroma` / `d3` / `lodash-es`; a default-vs-
 * namespace import there is the #391 crash (`Yh is not a function or its
 * return value is not iterable`) when a flowchart uses `style … fill:#…`.
 */
const LEFTOVER_ID_PREFIXES = ['dbytemd-mermaid', 'dmermaid', 'dvb-admin-mermaid'];

const mermaidPlugin = resolveCallable<typeof mermaidPluginModule>(mermaidPluginModule);

export type MermaidRenderer = {
  initialize?: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<unknown>;
};

export function isMermaidArtifact(node: Element): boolean {
  if (node.classList.contains('mermaidTooltip')) {
    return true;
  }
  const id = node.id || '';
  return LEFTOVER_ID_PREFIXES.some((prefix) => id === prefix || id.startsWith(`${prefix}-`));
}

export function cleanupMermaidArtifacts(root: ParentNode = document): number {
  let removed = 0;
  const candidates = root.querySelectorAll('[id], .mermaidTooltip');
  candidates.forEach((node) => {
    if (!(node instanceof Element) || !isMermaidArtifact(node)) {
      return;
    }
    // Keep the preview diagram itself; only drop measurement / tooltip leftovers.
    if (node.classList.contains('bytemd-mermaid') || node.closest('.bytemd-mermaid')) {
      return;
    }
    node.remove();
    removed += 1;
  });
  return removed;
}

export function hideMermaidSourceAndMountOverlay(
  pre: HTMLElement,
  isDark: boolean = detectPaintIsDark(pre),
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'bytemd-mermaid';
  applyMermaidThemeClass(container, isDark);
  container.style.lineHeight = 'initial';
  pre.setAttribute('data-vanblog-mermaid-source', 'true');
  pre.style.display = 'none';
  pre.after(container);
  return container;
}

export function restoreMermaidPreview(markdownBody: ParentNode): void {
  markdownBody.querySelectorAll('.bytemd-mermaid').forEach((node) => node.remove());
  markdownBody.querySelectorAll('pre[data-vanblog-mermaid-source]').forEach((pre) => {
    if (!(pre instanceof HTMLElement)) {
      return;
    }
    pre.style.display = '';
    pre.removeAttribute('data-vanblog-mermaid-source');
  });
}

export async function paintMermaidPreview(
  markdownBody: HTMLElement,
  mermaid: MermaidRenderer,
  isCancelled: () => boolean = () => false,
): Promise<void> {
  const blocks = markdownBody.querySelectorAll('pre > code.language-mermaid');
  for (let i = 0; i < blocks.length; i += 1) {
    if (isCancelled()) {
      return;
    }
    const code = blocks[i];
    const pre = code.parentElement;
    if (!pre) {
      continue;
    }
    const source = code.textContent || '';
    const container = hideMermaidSourceAndMountOverlay(pre, detectPaintIsDark(markdownBody));
    try {
      const rendered = await mermaid.render(`vb-admin-mermaid-${Date.now()}-${i}`, source);
      const svg = svgFromRenderResult(rendered);
      if (!svg) {
        throw new Error('mermaid.render returned no svg');
      }
      if (isCancelled() || !container.isConnected) {
        container.remove();
        continue;
      }
      container.innerHTML = svg;
    } catch {
      container.remove();
      pre.style.display = '';
      pre.removeAttribute('data-vanblog-mermaid-source');
    }
  }
  cleanupMermaidArtifacts();
}

let mermaidLoader: Promise<MermaidRenderer> | null = null;
let paintQueue: Promise<void> = Promise.resolve();

function enqueuePaint(work: () => Promise<void>): Promise<void> {
  const run = paintQueue.then(work, work);
  paintQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function globalMermaid(): MermaidRenderer | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return (window as unknown as { mermaid?: MermaidRenderer }).mermaid;
}

async function importMermaidModule(): Promise<unknown> {
  const loaders = [
    () => import('mermaid/dist/mermaid.min.js'),
    () => import('mermaid/dist/mermaid.js'),
    () => import('mermaid'),
  ];
  let lastError: unknown;
  for (let i = 0; i < loaders.length; i += 1) {
    try {
      return await loaders[i]();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('failed to import mermaid');
}

function loadMermaid(config: Record<string, unknown> = {}): Promise<MermaidRenderer> {
  if (!mermaidLoader) {
    mermaidLoader = importMermaidModule().then((mod) => {
      const mermaid = resolveMermaidApi<MermaidRenderer>(mod, globalMermaid());
      if (!mermaid) {
        throw new Error('mermaid.render is not a function');
      }
      mermaid.initialize?.({
        startOnLoad: false,
        suppressErrorRendering: true,
        ...mermaidInitConfig(detectPaintIsDark()),
        ...config,
      });
      return mermaid;
    });
  }
  return mermaidLoader;
}

export function mermaidForEditor(
  options?: Parameters<typeof mermaidPluginModule>[0],
): BytemdPlugin {
  const locale = pickMermaidLocale(
    (options as { locale?: Record<string, unknown> } | undefined)?.locale,
  );
  const mermaidConfig = { ...(options || {}) } as Record<string, unknown>;
  delete mermaidConfig.locale;
  const official = mermaidPlugin ? mermaidPlugin({ ...(options || {}), locale }) : {};

  return {
    ...official,
    viewerEffect({ markdownBody }) {
      let cancelled = false;

      enqueuePaint(async () => {
        if (cancelled) {
          return;
        }
        try {
          const mermaid = await loadMermaid(mermaidConfig);
          if (cancelled) {
            return;
          }
          const isDark = detectPaintIsDark(markdownBody);
          mermaid.initialize?.({
            startOnLoad: false,
            suppressErrorRendering: true,
            ...mermaidInitConfig(isDark),
            ...mermaidConfig,
          });
          await paintMermaidPreview(markdownBody, mermaid, () => cancelled);
          applyMermaidThemeToTree(markdownBody, isDark);
        } catch {
          // Keep the source fence. Never let mermaid interop brick the editor.
        }
      });

      return () => {
        cancelled = true;
        restoreMermaidPreview(markdownBody);
        cleanupMermaidArtifacts();
      };
    },
  };
}
