'use strict';

const { resolveCallable } = require('./mermaidInterop');

const CUSTOM_CONTAINER_TITLE = {
  note: '注',
  info: '相关信息',
  warning: '注意',
  danger: '警告',
  tip: '提示',
};

function walk(node, visit) {
  if (!node || typeof node !== 'object') {
    return;
  }
  visit(node);
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i += 1) {
      walk(node.children[i], visit);
    }
  }
}

function classOf(node) {
  const props = node && node.data && node.data.hProperties;
  if (!props) {
    return '';
  }
  const cls = props.class ?? props.className;
  if (Array.isArray(cls)) {
    return cls.join(' ');
  }
  return String(cls || '');
}

function hasContainerTitle(children) {
  return Boolean(children[0] && classOf(children[0]).includes('custom-container-title'));
}

function titleParagraph(title, tagName) {
  return {
    type: 'paragraph',
    data: {
      hProperties: {
        class: `custom-container-title ${tagName}`,
      },
    },
    children: [{ type: 'text', value: String(title) }],
  };
}

/**
 * Turn remark-directive containers into preview `<div>`s.
 * Never throw on missing children / attributes — a bad node must not
 * unmount the ByteMD editor (#429).
 */
function applyCustomContainers(tree) {
  if (!tree) {
    return tree;
  }
  walk(tree, (node) => {
    if (node.type !== 'containerDirective') {
      return;
    }
    const tagName = node.name || 'info';
    const attributes = node.attributes && typeof node.attributes === 'object' ? node.attributes : {};
    const data = node.data && typeof node.data === 'object' ? node.data : {};
    node.data = data;
    const title = attributes.title || CUSTOM_CONTAINER_TITLE[tagName] || tagName;
    data.hName = 'div';
    data.hProperties = {
      class: `custom-container ${tagName}`,
      type: title,
    };
    const children = Array.isArray(node.children) ? node.children : [];
    if (hasContainerTitle(children)) {
      node.children = children;
      return;
    }
    node.children = [titleParagraph(title, tagName), ...children];
  });
  return tree;
}

function useDirectivePlugin(processor, remarkDirectiveMod) {
  const plugin = resolveCallable(remarkDirectiveMod);
  if (typeof plugin !== 'function' || !processor || typeof processor.use !== 'function') {
    return processor;
  }
  return processor.use(plugin);
}

module.exports = {
  CUSTOM_CONTAINER_TITLE,
  applyCustomContainers,
  hasContainerTitle,
  useDirectivePlugin,
};
