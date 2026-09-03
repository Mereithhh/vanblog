import mermaidPlugin from '@bytemd/plugin-mermaid';
import type { BytemdPlugin } from 'bytemd';

/**
 * Mermaid 10's `render()` appends temporary measurement nodes (`#d{id}`) to
 * `document.body`. `@bytemd/plugin-mermaid` does not always remove them, so
 * they can sit over ByteMD/CodeMirror and swallow clicks and typing.
 */
const LEFTOVER_ID_PREFIXES = ['dbytemd-mermaid', 'dmermaid', 'dvb-admin-mermaid'];

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

function sweepMermaidArtifacts() {
  cleanupMermaidArtifacts();
}

export function mermaidForEditor(
  options?: Parameters<typeof mermaidPlugin>[0],
): BytemdPlugin {
  const official = mermaidPlugin({
    startOnLoad: false,
    suppressErrorRendering: true,
    ...options,
  });

  return {
    ...official,
    viewerEffect(ctx) {
      official.viewerEffect?.(ctx);
      sweepMermaidArtifacts();

      const observer = new MutationObserver(sweepMermaidArtifacts);
      observer.observe(document.body, { childList: true });

      const timers = [0, 300, 1200].map((ms) => window.setTimeout(sweepMermaidArtifacts, ms));

      return () => {
        observer.disconnect();
        timers.forEach((timer) => window.clearTimeout(timer));
        sweepMermaidArtifacts();
      };
    },
  };
}
