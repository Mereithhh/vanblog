/** Markers shared with the public website fenced-code line numbers. */
const CODE_LINE_CLASS = 'code-line';
const CODE_LINE_NUMBER_CLASS = 'code-line-number';
const CODE_LINE_CONTENT_CLASS = 'code-line-content';
const CODE_BLOCK_LINE_NUMBERS_CLASS = 'line-numbers';

function cloneWithChildren(node, children) {
  return {
    ...node,
    properties: node.properties ? { ...node.properties } : undefined,
    children,
  };
}

function splitHastNodeByLines(node) {
  if (node.type === 'text') {
    return String(node.value ?? '')
      .split('\n')
      .map((part) => (part === '' ? [] : [{ type: 'text', value: part }]));
  }
  if (node.type !== 'element' || !Array.isArray(node.children)) {
    return [[node]];
  }
  const lines = [[]];
  for (const child of node.children) {
    const chunks = splitHastNodeByLines(child);
    chunks.forEach((chunk, index) => {
      if (index > 0) lines.push([]);
      if (chunk.length === 0) return;
      lines[lines.length - 1].push(cloneWithChildren(node, chunk));
    });
  }
  return lines;
}

function splitHastChildrenByLines(children) {
  const lines = [[]];
  for (const child of children || []) {
    const chunks = splitHastNodeByLines(child);
    chunks.forEach((chunk, index) => {
      if (index > 0) lines.push([]);
      lines[lines.length - 1].push(...chunk);
    });
  }
  if (lines.length > 1 && lines[lines.length - 1].length === 0) {
    lines.pop();
  }
  return lines;
}

function wrapCodeChildrenWithLineNumbers(children) {
  return splitHastChildrenByLines(children).map((lineChildren, index) => {
    const n = index + 1;
    return {
      type: 'element',
      tagName: 'span',
      properties: {
        class: CODE_LINE_CLASS,
        className: [CODE_LINE_CLASS],
        dataLine: String(n),
      },
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: {
            class: CODE_LINE_NUMBER_CLASS,
            className: [CODE_LINE_NUMBER_CLASS],
            ariaHidden: 'true',
          },
          children: [{ type: 'text', value: String(n) }],
        },
        {
          type: 'element',
          tagName: 'span',
          properties: {
            class: CODE_LINE_CONTENT_CLASS,
            className: [CODE_LINE_CONTENT_CLASS],
          },
          children: lineChildren.length ? lineChildren : [{ type: 'text', value: '' }],
        },
      ],
    };
  });
}

function applyLineNumbersToCodeNode(codeNode) {
  if (!codeNode || codeNode.tagName !== 'code') return;
  codeNode.children = wrapCodeChildrenWithLineNumbers(codeNode.children || []);
}

function readFencedCodeText(code) {
  if (!code) return '';
  const lines = typeof code.querySelectorAll === 'function' ? code.querySelectorAll(`.${CODE_LINE_CONTENT_CLASS}`) : null;
  if (lines && lines.length) {
    return Array.from(lines)
      .map((el) => el.textContent ?? el.innerText ?? '')
      .join('\n');
  }
  return code.innerText ?? code.textContent ?? '';
}

module.exports = {
  CODE_LINE_CLASS,
  CODE_LINE_NUMBER_CLASS,
  CODE_LINE_CONTENT_CLASS,
  CODE_BLOCK_LINE_NUMBERS_CLASS,
  splitHastNodeByLines,
  splitHastChildrenByLines,
  wrapCodeChildrenWithLineNumbers,
  applyLineNumbersToCodeNode,
  readFencedCodeText,
};
