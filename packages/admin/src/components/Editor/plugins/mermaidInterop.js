'use strict';

/**
 * `@bytemd/plugin-mermaid` and `import('mermaid')` resolve mermaid 10's
 * unbundled `mermaid.core.mjs`. That file re-exports ESM deps (`khroma`,
 * `d3`, `lodash-es`). Under Umi/webpack a default-vs-namespace mismatch
 * becomes the minified crash:
 * `Yh is not a function or its return value is not iterable`
 * (flowchart `style A fill:#9fe1e7` is the usual trigger via khroma).
 */

const MERMAID_LOCALE_KEYS = [
  'mermaid',
  'flowchart',
  'sequence',
  'class',
  'state',
  'er',
  'uj',
  'gantt',
  'pie',
  'mindmap',
  'timeline',
];

function resolveCallable(mod) {
  let current = mod;
  const seen = [];
  for (let i = 0; i < 4 && current != null && !seen.includes(current); i += 1) {
    seen.push(current);
    if (typeof current === 'function') {
      return current;
    }
    current = current.default;
  }
  return undefined;
}

function resolveMermaidApi(mod, globalMermaid) {
  const seen = [];
  let current = mod;
  for (let i = 0; i < 4 && current != null && !seen.includes(current); i += 1) {
    seen.push(current);
    if (typeof current.render === 'function') {
      return current;
    }
    current = current.default;
  }
  if (globalMermaid && typeof globalMermaid.render === 'function') {
    return globalMermaid;
  }
  return undefined;
}

function svgFromRenderResult(result) {
  if (typeof result === 'string' && result) {
    return result;
  }
  if (result && typeof result === 'object' && typeof result.svg === 'string') {
    return result.svg;
  }
  return undefined;
}

function pickMermaidLocale(locale) {
  if (!locale || typeof locale !== 'object') {
    return undefined;
  }
  const picked = {};
  MERMAID_LOCALE_KEYS.forEach((key) => {
    if (typeof locale[key] === 'string') {
      picked[key] = locale[key];
    }
  });
  return Object.keys(picked).length ? picked : undefined;
}

module.exports = {
  MERMAID_LOCALE_KEYS,
  pickMermaidLocale,
  resolveCallable,
  resolveMermaidApi,
  svgFromRenderResult,
};
