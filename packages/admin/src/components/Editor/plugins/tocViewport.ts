import type { BytemdPlugin } from 'bytemd';

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

export const EDITOR_CHROME_SELECTORS = [
  '.bytemd-body',
  '.bytemd-editor',
  '.bytemd-editor > .CodeMirror',
];

export function isEditorChromeScroller(node: Element): boolean {
  if (node.classList.contains('CodeMirror-scroll')) {
    return false;
  }
  if (node.classList.contains('bytemd-body')) {
    return true;
  }
  if (node.classList.contains('bytemd-editor')) {
    return true;
  }
  return node.classList.contains('CodeMirror') && Boolean(node.closest('.bytemd-editor'));
}

export function resetEditorChromeScroll(root: ParentNode = document): number {
  let reset = 0;
  EDITOR_CHROME_SELECTORS.forEach((selector) => {
    root.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement) || !isEditorChromeScroller(node)) {
        return;
      }
      if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
        node.scrollTop = 0;
        node.scrollLeft = 0;
        reset += 1;
      }
    });
  });
  return reset;
}

export function scrollPreviewHeadingIntoView(heading: Element): boolean {
  const preview = heading.closest('.bytemd-preview');
  if (!(preview instanceof HTMLElement) || !(heading instanceof HTMLElement)) {
    return false;
  }
  const previewRect = preview.getBoundingClientRect();
  const headingRect = heading.getBoundingClientRect();
  preview.scrollTop += headingRect.top - previewRect.top;
  return true;
}

export function guardHeadingScrollIntoView(markdownBody: ParentNode): () => void {
  const headings = markdownBody.querySelectorAll(HEADING_SELECTOR);
  const originals: Array<{ el: Element; fn: typeof Element.prototype.scrollIntoView }> = [];
  headings.forEach((heading) => {
    const original = heading.scrollIntoView;
    originals.push({
      el: heading,
      fn: typeof original === 'function' ? original.bind(heading) : () => undefined,
    });
    heading.scrollIntoView = function scrollPreviewOnly() {
      scrollPreviewHeadingIntoView(heading);
      const root = heading.closest('.bytemd') || document;
      resetEditorChromeScroll(root);
    };
  });
  return () => {
    originals.forEach(({ el, fn }) => {
      el.scrollIntoView = fn;
    });
  };
}

export function pinEditorChromeScroll(root: ParentNode): () => void {
  const pinned: Array<{ el: HTMLElement; onScroll: () => void }> = [];
  EDITOR_CHROME_SELECTORS.forEach((selector) => {
    root.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement) || !isEditorChromeScroller(node)) {
        return;
      }
      const onScroll = () => {
        if (node.scrollTop !== 0) {
          node.scrollTop = 0;
        }
        if (node.scrollLeft !== 0) {
          node.scrollLeft = 0;
        }
      };
      node.addEventListener('scroll', onScroll);
      pinned.push({ el: node, onScroll });
    });
  });
  return () => {
    pinned.forEach(({ el, onScroll }) => el.removeEventListener('scroll', onScroll));
  };
}

export function recoverEditorViewport(
  root: ParentNode,
  editor?: { refresh?: () => void; setSize?: (w: unknown, h: unknown) => void },
): void {
  resetEditorChromeScroll(root);
  editor?.setSize?.(null, null);
  editor?.refresh?.();
}

function shouldRecoverFromClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(
    target.closest('.bytemd-toc') ||
      target.closest('.bytemd-toolbar-right') ||
      target.closest(`.bytemd-preview ${HEADING_SELECTOR}`) ||
      target.closest('.bytemd-editor .cm-header'),
  );
}

export function tocViewportGuard(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      return guardHeadingScrollIntoView(markdownBody);
    },
    editorEffect({ editor, root }) {
      const unpin = pinEditorChromeScroll(root);
      const recover = () => recoverEditorViewport(root, editor);
      const onClick = (event: Event) => {
        if (!shouldRecoverFromClick(event.target)) {
          return;
        }
        requestAnimationFrame(recover);
        window.setTimeout(recover, 0);
      };
      root.addEventListener('click', onClick, true);
      return () => {
        unpin();
        root.removeEventListener('click', onClick, true);
      };
    },
  };
}
