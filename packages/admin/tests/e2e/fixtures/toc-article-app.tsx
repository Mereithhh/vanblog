import { render } from 'react-dom';
import { Viewer } from '@bytemd/react';
import { Heading } from '../../../../website/components/Markdown/heading';
import MarkdownTocBar from '../../../../website/components/MarkdownTocBar';
import { getEl, parseNavStructure } from '../../../../website/components/MarkdownTocBar/tools';
import article from './toc-article.md';

const content = String(article);
const items = parseNavStructure(content);

// Same sanitize hook as the public article Viewer so heading id/data-id survive.
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
      <Viewer
        value={content}
        plugins={[Heading()]}
        remarkRehype={{ allowDangerousHtml: true }}
        sanitize={sanitize}
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
};
win.__tocItems = items;
win.__getEl = getEl;
