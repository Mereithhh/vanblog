import { render } from 'react-dom';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import { Heading } from '../../../../website/components/Markdown/heading';
import { LinkTarget } from '../../../../website/components/Markdown/linkTarget';
import { sanitizeMarkdownSchema } from '../../../../website/utils/markdownSanitize';
import article from './footnote-article.md';

const content = String(article);

const App = () => (
  <div className="light">
    <article className="markdown-body footnote-e2e-article" data-post-content>
      <Viewer
        value={content}
        plugins={[gfm(), LinkTarget(), Heading()]}
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
