/**
 * @jest-environment jsdom
 */
import {
  cleanupMermaidArtifacts,
  hideMermaidSourceAndMountOverlay,
  isMermaidArtifact,
  paintMermaidPreview,
  restoreMermaidPreview,
} from './mermaidSafety';

describe('mermaidSafety', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('treats mermaid measurement nodes as artifacts', () => {
    const leftover = document.createElement('div');
    leftover.id = 'dbytemd-mermaid-1700000000000-0';
    expect(isMermaidArtifact(leftover)).toBe(true);
  });

  it('removes leftover mermaid nodes without dropping the preview diagram', () => {
    const editor = document.createElement('div');
    editor.className = 'bytemd-editor';
    editor.appendChild(document.createElement('textarea'));

    const leftover = document.createElement('div');
    leftover.id = 'dbytemd-mermaid-123-0';
    leftover.style.cssText = 'position:absolute;inset:0;z-index:9999';

    const preview = document.createElement('div');
    preview.className = 'bytemd-preview';
    const diagram = document.createElement('div');
    diagram.className = 'bytemd-mermaid';
    diagram.innerHTML = '<svg></svg>';
    preview.appendChild(diagram);

    document.body.append(editor, leftover, preview);

    const removed = cleanupMermaidArtifacts();

    expect(removed).toBe(1);
    expect(document.getElementById('dbytemd-mermaid-123-0')).toBeNull();
    expect(document.querySelector('.bytemd-mermaid svg')).not.toBeNull();
  });

  it('keeps the mermaid source pre in the tree instead of replaceWith', () => {
    const markdownBody = document.createElement('div');
    markdownBody.className = 'markdown-body';
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.textContent = 'graph TD\nA-->B';
    pre.appendChild(code);
    markdownBody.appendChild(pre);
    document.body.appendChild(markdownBody);

    const overlay = hideMermaidSourceAndMountOverlay(pre);

    expect(markdownBody.contains(pre)).toBe(true);
    expect(pre.style.display).toBe('none');
    expect(pre.getAttribute('data-vanblog-mermaid-source')).toBe('true');
    expect(pre.nextElementSibling).toBe(overlay);
    expect(overlay.className).toBe('bytemd-mermaid');

    restoreMermaidPreview(markdownBody);

    expect(markdownBody.contains(overlay)).toBe(false);
    expect(pre.style.display).toBe('');
    expect(pre.hasAttribute('data-vanblog-mermaid-source')).toBe(false);
  });

  it('paints mermaid sequentially and restores when cancelled', async () => {
    const markdownBody = document.createElement('div');
    const makeBlock = (text: string) => {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.className = 'language-mermaid';
      code.textContent = text;
      pre.appendChild(code);
      markdownBody.appendChild(pre);
      return pre;
    };
    const first = makeBlock('graph TD\nA-->B');
    makeBlock('graph LR\nC-->D');
    document.body.appendChild(markdownBody);

    const order: string[] = [];
    const mermaid = {
      render: jest.fn(async (id: string, text: string) => {
        order.push(text.split('\n')[0]);
        return { svg: `<svg data-source="${text.slice(0, 8)}"></svg>` };
      }),
    };

    await paintMermaidPreview(markdownBody, mermaid);

    expect(mermaid.render).toHaveBeenCalledTimes(2);
    expect(order).toEqual(['graph TD', 'graph LR']);
    expect(markdownBody.contains(first)).toBe(true);
    expect(markdownBody.querySelectorAll('.bytemd-mermaid svg')).toHaveLength(2);

    const leftover = document.createElement('div');
    leftover.id = 'dvb-admin-mermaid-1';
    document.body.appendChild(leftover);
    restoreMermaidPreview(markdownBody);
    cleanupMermaidArtifacts();

    expect(markdownBody.querySelector('.bytemd-mermaid')).toBeNull();
    expect(document.getElementById('dvb-admin-mermaid-1')).toBeNull();
    expect(first.style.display).toBe('');
  });

  it('leaves the source fence visible when mermaid.render throws', async () => {
    const markdownBody = document.createElement('div');
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.textContent = 'graph TD\nA-->B';
    pre.appendChild(code);
    markdownBody.appendChild(pre);
    document.body.appendChild(markdownBody);

    await paintMermaidPreview(markdownBody, {
      render: async () => {
        throw new Error('Parse error');
      },
    });

    expect(markdownBody.querySelector('.bytemd-mermaid')).toBeNull();
    expect(pre.style.display).toBe('');
    expect(markdownBody.contains(pre)).toBe(true);
  });
});
