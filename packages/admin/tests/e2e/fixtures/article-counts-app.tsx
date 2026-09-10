import { render } from 'react-dom';
import { SubTitle } from '../../../../website/components/PostCard/title';

declare global {
  interface Window {
    __fillCommentCounts?: (counts: Record<string, number> & { default?: number }) => void;
  }
}

const createdAt = new Date('2024-03-15T12:00:00.000Z');
const updatedAt = new Date('2024-03-16T12:00:00.000Z');

const App = () => (
  <div>
    <section data-count-case="article">
      <h1>Article page</h1>
      <SubTitle
        type="article"
        id={1}
        updatedAt={updatedAt}
        createdAt={createdAt}
        catelog="随笔"
        enableComment="true"
        openArticleLinksInNewWindow={false}
      />
    </section>
    <section data-count-case="overview">
      <h1>Article list card</h1>
      <SubTitle
        type="overview"
        id={2}
        updatedAt={updatedAt}
        createdAt={createdAt}
        catelog="教程"
        enableComment="true"
        openArticleLinksInNewWindow={false}
      />
    </section>
    <section data-count-case="zero">
      <h1>Loaded zero</h1>
      <SubTitle
        type="overview"
        id={3}
        updatedAt={updatedAt}
        createdAt={createdAt}
        catelog="随笔"
        enableComment="true"
        openArticleLinksInNewWindow={false}
      />
    </section>
  </div>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);

async function fillCommentCounts(counts: Record<string, number> & { default?: number }) {
  document.querySelectorAll('.waline-comment-count').forEach((el) => {
    const path = el.getAttribute('data-path') || '';
    const value = Object.prototype.hasOwnProperty.call(counts, path)
      ? counts[path]
      : counts.default ?? 0;
    el.textContent = String(value);
  });
}

window.__fillCommentCounts = fillCommentCounts;
