import mermaidPlugin from '@bytemd/plugin-mermaid';
import type { BytemdPlugin } from 'bytemd';

/**
 * Mermaid 10's `render()` appends temporary measurement nodes (`#d{id}`) to
 * `document.body`. `@bytemd/plugin-mermaid` does not always remove them, so
 * they can sit over ByteMD/CodeMirror and swallow clicks and typing.
 *
 * The official plugin also `replaceWith`s the preview `<pre>` and fires
 * concurrent `render()` calls. ByteMD/Svelte then throws on the next
 * keystroke (`… is not iterable` / error overlay). Keep the source `<pre>`
 * in the tree, paint diagrams as siblings, and serialize renders.
 */
const LEFTOVER_ID_PREFIXES = ['dbytemd-mermaid', 'dmermaid', 'dvb-admin-mermaid'];

export type MermaidRenderer = {
  initialize?: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
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

export function hideMermaidSourceAndMountOverlay(pre: HTMLElement): HTMLElement {
  const container = document.createElement('div');
  container.className = 'bytemd-mermaid';
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
    const container = hideMermaidSourceAndMountOverlay(pre);
    try {
      const { svg } = await mermaid.render(`vb-admin-mermaid-${Date.now()}-${i}`, source);
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

function loadMermaid(config: Record<string, unknown> = {}): Promise<MermaidRenderer> {
  if (!mermaidLoader) {
    mermaidLoader = import('mermaid').then((mod) => {
      const mermaid = ((mod as { default?: MermaidRenderer }).default ??
        mod) as MermaidRenderer;
      mermaid.initialize?.({
        startOnLoad: false,
        suppressErrorRendering: true,
        ...config,
      });
      return mermaid;
    });
  }
  return mermaidLoader;
}

export function mermaidForEditor(
  options?: Parameters<typeof mermaidPlugin>[0],
): BytemdPlugin {
  const mermaidConfig = { ...(options || {}) } as Record<string, unknown>;
  delete mermaidConfig.locale;
  const official = mermaidPlugin(options);

  return {
    ...official,
    viewerEffect({ markdownBody }) {
      let cancelled = false;

      enqueuePaint(async () => {
        if (cancelled) {
          return;
        }
        let mermaid: MermaidRenderer;
        try {
          mermaid = await loadMermaid(mermaidConfig);
        } catch {
          return;
        }
        if (cancelled) {
          return;
        }
        await paintMermaidPreview(markdownBody, mermaid, () => cancelled);
      });

      return () => {
        cancelled = true;
        restoreMermaidPreview(markdownBody);
        cleanupMermaidArtifacts();
      };
    },
  };
}
