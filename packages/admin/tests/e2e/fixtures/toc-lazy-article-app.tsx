import { render } from 'react-dom';
import { Viewer } from '@bytemd/react';
import { Heading } from '../../../../website/components/Markdown/heading';
import LazyArticleContent from '../../../../website/components/Markdown/lazyArticle';
import MarkdownTocBar from '../../../../website/components/MarkdownTocBar';
import { getEl, parseNavStructure } from '../../../../website/components/MarkdownTocBar/tools';
import {
  LAZY_MARKDOWN_MIN_CHARS,
  splitLazyMarkdown,
} from '../../../../website/utils/lazyMarkdown';

const filler = `占位内容`.repeat(220);

function section(title: string, n: number) {
  const paragraphs = Array.from(
    { length: 8 },
    (_, i) => `段落${n}-${i}\n\n${filler}`,
  ).join('\n\n');
  return `## ${title}\n\n${paragraphs}\n`;
}

const content = [
  '# Intro\n\nCitrix PoC 手册导言，用于复现超长文章懒加载目录。\n',
  section('1. 概述', 1),
  section('2. 准备', 2),
  section('3. 安装', 3),
  '## 4. 配置DHCP引导选项\n\nDHCP 引导选项正文，点击目录应跳到这里。\n',
  '## My Title \n\n标题末尾有空格，目录仍应能跳转。\n',
  '## Clean Title\n\n无多余空格的标题。\n',
].join('\n');

if (content.length < LAZY_MARKDOWN_MIN_CHARS) {
  throw new Error(`lazy fixture is too short: ${content.length}`);
}

const split = splitLazyMarkdown(content);
if (!split.tail.includes('4. 配置DHCP引导选项')) {
  throw new Error('lazy fixture did not place the target heading in the unloaded tail');
}

const items = parseNavStructure(content);

const sanitize = (schema) => {
  schema.protocols.src.push('data');
  schema.tagNames.push('center');
  schema.tagNames.push('iframe');
  schema.tagNames.push('script');
  schema.attributes['*'].push('style');
  schema.attributes['*'].push('src');
  schema.attributes['*'].push('scrolling');
  schema.attributes['*'].push('border');
  schema.attributes['*'].push('frameborder');
  schema.attributes['*'].push('framespacing');
  schema.attributes['*'].push('allowfullscreen');
  schema.strip = [];
  return schema;
};

const App = () => (
  <div className="toc-e2e-layout">
    <article className="toc-e2e-article" data-post-content>
      <LazyArticleContent
        content={content}
        render={(markdown) => (
          <Viewer
            value={markdown}
            plugins={[Heading()]}
            remarkRehype={{ allowDangerousHtml: true }}
            sanitize={sanitize}
          />
        )}
      />
    </article>
    <aside className="toc-e2e-toc" data-toc>
      <MarkdownTocBar content={content} headingOffset={0} />
    </aside>
  </div>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);

const win = window as unknown as {
  __tocItems: typeof items;
  __getEl: typeof getEl;
  __lazySplit: typeof split;
};
win.__tocItems = items;
win.__getEl = getEl;
win.__lazySplit = split;
