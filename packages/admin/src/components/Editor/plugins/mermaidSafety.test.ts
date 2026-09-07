/**
 * @jest-environment jsdom
 */
import {
  pickMermaidLocale,
  resolveCallable,
  resolveMermaidApi,
  svgFromRenderResult,
} from './mermaidInterop';
import {
  cleanupMermaidArtifacts,
  hideMermaidSourceAndMountOverlay,
  isMermaidArtifact,
  paintMermaidPreview,
  restoreMermaidPreview,
} from './mermaidSafety';

const ISSUE_391_SOURCE = `graph TD;
style A fill:#9fe1e7,stroke:#333,stroke-width:2px;
style B fill:#ffcc99,stroke:#333,stroke-width:2px;
A[努力学习] -->|促进| B[协商脑力];`;

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
    expect(overlay.classList.contains('bytemd-mermaid')).toBe(true);
    expect(overlay.getAttribute('data-mermaid-theme')).toMatch(/^(dark|default)$/);

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

  it('unwraps default/namespace mermaid and plugin imports', () => {
    const render = async () => ({ svg: '<svg></svg>' });
    const api = { render, initialize: () => undefined };
    expect(resolveMermaidApi({ default: { default: api } })).toBe(api);
    expect(resolveMermaidApi({ default: {} }, api)).toBe(api);
    expect(resolveMermaidApi({})).toBeUndefined();

    const factory = () => ({ actions: [] });
    expect(resolveCallable({ default: { default: factory } })).toBe(factory);
    expect(resolveCallable({ default: { notAFunction: true } })).toBeUndefined();
  });

  it('reads svg from object or string mermaid.render results', () => {
    expect(svgFromRenderResult({ svg: '<svg data-ok="1"></svg>' })).toBe('<svg data-ok="1"></svg>');
    expect(svgFromRenderResult('<svg data-raw="1"></svg>')).toBe('<svg data-raw="1"></svg>');
    expect(svgFromRenderResult(undefined)).toBeUndefined();
    expect(svgFromRenderResult({ svg: 1 })).toBeUndefined();
  });

  it('only forwards mermaid locale keys so official dropdown actions stay iterable', () => {
    expect(
      pickMermaidLocale({
        mermaid: 'Mermaid图表',
        flowchart: '流程图',
        actions: 'not-iterable-if-spread',
        bold: '粗体',
      }),
    ).toEqual({ mermaid: 'Mermaid图表', flowchart: '流程图' });
  });

  it('paints a styled flowchart with Chinese labels without dropping the source pre', async () => {
    const markdownBody = document.createElement('div');
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.textContent = ISSUE_391_SOURCE;
    pre.appendChild(code);
    markdownBody.appendChild(pre);
    document.body.appendChild(markdownBody);

    await paintMermaidPreview(markdownBody, {
      render: async (_id: string, text: string) => {
        expect(text).toContain('fill:#9fe1e7');
        expect(text).toContain('努力学习');
        return { svg: '<svg data-issue="391"></svg>' };
      },
    });

    expect(markdownBody.contains(pre)).toBe(true);
    expect(markdownBody.querySelector('.bytemd-mermaid svg')?.getAttribute('data-issue')).toBe(
      '391',
    );
  });

  it('leaves the source fence visible when mermaid.render returns a non-svg value', async () => {
    const markdownBody = document.createElement('div');
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.textContent = ISSUE_391_SOURCE;
    pre.appendChild(code);
    markdownBody.appendChild(pre);
    document.body.appendChild(markdownBody);

    await paintMermaidPreview(markdownBody, {
      render: async () => undefined,
    });

    expect(markdownBody.querySelector('.bytemd-mermaid')).toBeNull();
    expect(pre.style.display).toBe('');
    expect(markdownBody.contains(pre)).toBe(true);
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
