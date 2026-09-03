import { render } from 'react-dom';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import { Heading } from '../../../../website/components/Markdown/heading';
import { LinkTarget } from '../../../../website/components/Markdown/linkTarget';
import { sanitizeMarkdownSchema } from '../../../../website/utils/markdownSanitize';
import { articleOverviewMarkdown } from '../../../../website/utils/articleExcerpt';
import article from './markdown-link-article.md';

const content = String(article);
const overview = articleOverviewMarkdown(content);
const full = content.replace('<!-- more -->', '');

const plugins = [gfm(), LinkTarget(), Heading()];

const App = () => (
  <div className="light">
    <article className="markdown-body markdown-link-e2e-card" data-overview>
      <Viewer
        value={overview}
        plugins={plugins}
        remarkRehype={{ allowDangerousHtml: true }}
        sanitize={sanitizeMarkdownSchema}
      />
    </article>
    <article className="markdown-body markdown-link-e2e-article" data-article>
      <Viewer
        value={full}
        plugins={plugins}
        remarkRehype={{ allowDangerousHtml: true }}
        sanitize={sanitizeMarkdownSchema}
      />
    </article>
  </div>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);
