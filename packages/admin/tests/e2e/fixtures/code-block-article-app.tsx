import { render } from 'react-dom';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import { customCodeBlock } from '../../../../website/components/Markdown/codeBlock';
import { sanitizeMarkdownSchema } from '../../../../website/utils/markdownSanitize';
import article from './code-block-article.md';

const content = String(article);
const plugins = [gfm(), highlight(), customCodeBlock()];

const App = () => (
  <>
    <div className="light" data-theme="light">
      <article className="markdown-body" data-code-light>
        <Viewer
          value={content}
          plugins={plugins}
          remarkRehype={{ allowDangerousHtml: true }}
          sanitize={sanitizeMarkdownSchema}
        />
      </article>
    </div>
    <div className="dark" data-theme="dark">
      <article className="markdown-body" data-code-dark>
        <Viewer
          value={content}
          plugins={plugins}
          remarkRehype={{ allowDangerousHtml: true }}
          sanitize={sanitizeMarkdownSchema}
        />
      </article>
    </div>
  </>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);
