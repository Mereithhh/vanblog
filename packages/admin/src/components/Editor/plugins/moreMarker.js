'use strict';

const MORE_COMMENT = /<!--\s*more\s*-->/i;
const MORE_COMMENT_BODY = /^\s*more\s*$/i;

function isMoreCommentNode(node) {
  if (!node || typeof node !== 'object') {
    return false;
  }
  const value = String(node.value || '');
  if (node.type === 'comment' && MORE_COMMENT_BODY.test(value)) {
    return true;
  }
  if ((node.type === 'raw' || node.type === 'html') && MORE_COMMENT.test(value)) {
    return true;
  }
  return false;
}

function moreMarkerElement() {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      class: 'vanblog-more-marker',
      className: ['vanblog-more-marker'],
      dataMore: 'true',
    },
    children: [],
  };
}

/**
 * ByteMD preview uses Svelte `{@html}`. An HTML comment (`<!-- more -->`)
 * next to `----` / headings can throw on the next keystroke (Enter) and
 * white-screen the admin editor (#429). Replace the comment with a real
 * element so preview updates stay in the element tree.
 */
function replaceMoreComments(tree) {
  if (!tree || typeof tree !== 'object') {
    return tree;
  }
  if (!Array.isArray(tree.children)) {
    return tree;
  }
  tree.children = tree.children.map((child) => {
    if (isMoreCommentNode(child)) {
      return moreMarkerElement();
    }
    replaceMoreComments(child);
    return child;
  });
  return tree;
}

function moreMarkerRehype() {
  return replaceMoreComments;
}

module.exports = {
  MORE_COMMENT,
  isMoreCommentNode,
  moreMarkerElement,
  moreMarkerRehype,
  replaceMoreComments,
};
