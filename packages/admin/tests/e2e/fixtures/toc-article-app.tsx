import React from 'react';
import { render } from 'react-dom';
import { Viewer } from '@bytemd/react';
import { Heading } from '../../../../website/components/Markdown/heading';
import MarkdownTocBar from '../../../../website/components/MarkdownTocBar';
import { getEl, parseNavStructure } from '../../../../website/components/MarkdownTocBar/tools';
import article from './toc-article.md';

const content = String(article);
const items = parseNavStructure(content);

const App = () => (
  <div className="toc-e2e-layout">
    <article className="toc-e2e-article" data-post-content>
      <Viewer value={content} plugins={[Heading()]} />
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
