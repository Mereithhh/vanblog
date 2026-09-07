const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  applyCustomContainers,
  useDirectivePlugin,
} = require('../../src/components/Editor/plugins/customContainerRemark');
const {
  isMoreCommentNode,
  replaceMoreComments,
} = require('../../src/components/Editor/plugins/moreMarker');
const { withSafeViewerEffect, withSafeViewerEffects } = require('../../src/components/Editor/plugins/previewSafety');
const { findFencedCodeNode } = require('../../src/components/Editor/plugins/codeBlockLines');

const adminRoot = path.join(__dirname, '../..');
const ISSUE_429_MARKDOWN = `## VanBlog 文章测试

:::tip{title="现在支持高亮块啦"}
\`\`\`js
console.log("欢迎体验")
\`\`\`
:::

<!-- more -->
----
# 这是一级标题
## 这是二级标题
`;

function issue429Tree() {
  return {
    type: 'root',
    children: [
      {
        type: 'containerDirective',
        name: 'tip',
        attributes: { title: '现在支持高亮块啦' },
        children: [
          {
            type: 'code',
            lang: 'js',
            value: 'console.log("欢迎体验")',
          },
        ],
      },
      { type: 'html', value: '<!-- more -->' },
      { type: 'thematicBreak' },
      { type: 'heading', depth: 1, children: [{ type: 'text', value: '这是一级标题' }] },
    ],
  };
}

describe('admin editor tip / more preview safety (#429)', () => {
  it('turns tip containers into preview divs without requiring children', () => {
    const tree = issue429Tree();
    applyCustomContainers(tree);
    const tip = tree.children[0];
    assert.equal(tip.data.hName, 'div');
    assert.equal(tip.data.hProperties.class, 'custom-container tip');
    assert.equal(tip.data.hProperties.type, '现在支持高亮块啦');
    assert.equal(tip.children[0].data.hProperties.class, 'custom-container-title tip');
    assert.equal(tip.children[0].children[0].value, '现在支持高亮块啦');
    assert.equal(tip.children[1].type, 'code');
  });

  it('does not throw when a container has no children and skips a second title', () => {
    const broken = {
      type: 'root',
      children: [{ type: 'containerDirective', name: 'tip' }],
    };
    assert.doesNotThrow(() => applyCustomContainers(broken));
    assert.equal(broken.children[0].children.length, 1);
    applyCustomContainers(broken);
    assert.equal(broken.children[0].children.length, 1);
  });

  it('unwraps default/namespace remark-directive so processor.use stays callable', () => {
    const used = [];
    const plugin = () => undefined;
    const processor = {
      use(next) {
        used.push(next);
        return processor;
      },
    };
    assert.equal(useDirectivePlugin(processor, { default: { default: plugin } }), processor);
    assert.deepEqual(used, [plugin]);
    assert.equal(useDirectivePlugin(processor, { default: { notAFunction: true } }), processor);
    assert.deepEqual(used, [plugin]);
  });

  it('replaces <!-- more --> raw/comment nodes so ByteMD {@html} is not left with author comments', () => {
    const hast = {
      type: 'root',
      children: [
        { type: 'raw', value: '<!-- more -->' },
        { type: 'element', tagName: 'hr', children: [] },
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'comment', value: ' more ' }],
        },
      ],
    };
    assert.equal(isMoreCommentNode(hast.children[0]), true);
    replaceMoreComments(hast);
    assert.equal(hast.children[0].tagName, 'div');
    assert.equal(hast.children[0].properties.class, 'vanblog-more-marker');
    assert.equal(hast.children[2].children[0].properties.dataMore, 'true');
    assert.equal(hast.children[1].tagName, 'hr');
  });

  it('keeps viewerEffect throws from escaping ByteMD afterUpdate', () => {
    const plugin = withSafeViewerEffect({
      viewerEffect() {
        throw new TypeError('C of Yh is not a function');
      },
    });
    assert.equal(plugin.viewerEffect({ markdownBody: {} }), undefined);

    let cleaned = 0;
    const wrapped = withSafeViewerEffect({
      viewerEffect() {
        return () => {
          cleaned += 1;
          throw new Error('cleanup boom');
        };
      },
    });
    const cleanup = wrapped.viewerEffect({});
    assert.doesNotThrow(() => cleanup());
    assert.equal(cleaned, 1);
    assert.deepEqual(withSafeViewerEffects(null), []);
  });

  it('does not throw when decorating a pre that has no code child', () => {
    assert.equal(findFencedCodeNode([{ type: 'text', value: 'x' }]), undefined);
    assert.equal(findFencedCodeNode(undefined), undefined);
  });

  it('wires the helpers into the admin editor plugins', () => {
    const editorSrc = readFileSync(path.join(adminRoot, 'src/components/Editor/index.tsx'), 'utf8');
    const containerSrc = readFileSync(
      path.join(adminRoot, 'src/components/Editor/plugins/customContainer.tsx'),
      'utf8',
    );
    const moreSrc = readFileSync(path.join(adminRoot, 'src/components/Editor/insertMore.tsx'), 'utf8');
    const codeSrc = readFileSync(
      path.join(adminRoot, 'src/components/Editor/plugins/codeBlock.tsx'),
      'utf8',
    );
    assert.match(editorSrc, /withSafeViewerEffects/);
    assert.match(containerSrc, /applyCustomContainers/);
    assert.match(containerSrc, /useDirectivePlugin/);
    assert.match(moreSrc, /moreMarkerRehype/);
    assert.match(codeSrc, /findFencedCodeNode/);
    assert.match(codeSrc, /if \(!copyBtn\)/);
    assert.match(ISSUE_429_MARKDOWN, /:::tip/);
    assert.match(ISSUE_429_MARKDOWN, /<!-- more -->/);
  });
});
