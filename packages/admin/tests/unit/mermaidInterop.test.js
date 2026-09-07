const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  pickMermaidLocale,
  resolveCallable,
  resolveMermaidApi,
  svgFromRenderResult,
} = require('../../src/components/Editor/plugins/mermaidInterop');

describe('mermaidInterop', () => {
  it('unwraps default/namespace mermaid modules so render is callable', () => {
    const render = async () => ({ svg: '<svg></svg>' });
    const api = { render };
    assert.equal(resolveMermaidApi({ default: { default: api } }), api);
    assert.equal(resolveMermaidApi({ default: {} }, api), api);
    assert.equal(resolveMermaidApi({}), undefined);
  });

  it('unwraps default/namespace plugin factories', () => {
    const factory = () => ({ actions: [] });
    assert.equal(resolveCallable({ default: { default: factory } }), factory);
    assert.equal(resolveCallable({ default: { notAFunction: true } }), undefined);
  });

  it('reads svg from mermaid.render object or string results', () => {
    assert.equal(svgFromRenderResult({ svg: '<svg></svg>' }), '<svg></svg>');
    assert.equal(svgFromRenderResult('<svg></svg>'), '<svg></svg>');
    assert.equal(svgFromRenderResult(undefined), undefined);
    assert.equal(svgFromRenderResult({}), undefined);
  });

  it('strips non-mermaid locale keys so dropdown actions stay an array', () => {
    const picked = pickMermaidLocale({
      mermaid: 'Mermaid图表',
      flowchart: '流程图',
      sequence: '时序图',
      actions: 'would-break-for-of',
      bold: '粗体',
    });
    assert.deepEqual(picked, {
      mermaid: 'Mermaid图表',
      flowchart: '流程图',
      sequence: '时序图',
    });
  });
});
