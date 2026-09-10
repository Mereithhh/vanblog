import { render } from 'react-dom';
import CategoryList from '../../../../website/components/CategoryList';

const articles = {
  随笔: [
    {
      id: 1,
      title: '随笔一篇',
      createdAt: '2024-03-15T12:00:00.000Z',
      content: '',
      category: '随笔',
      tags: [],
      updatedAt: '2024-03-15T12:00:00.000Z',
      private: false,
    },
  ],
  教程: [
    {
      id: 2,
      title: '教程一篇',
      createdAt: '2024-04-01T12:00:00.000Z',
      content: '',
      category: '教程',
      tags: [],
      updatedAt: '2024-04-01T12:00:00.000Z',
      private: false,
    },
  ],
};

const params = new URLSearchParams(window.location.search);
const defaultExpandAll = params.get('expand') === 'true';

const App = () => (
  <div data-category-expand-case={defaultExpandAll ? 'expanded' : 'collapsed'}>
    <CategoryList
      sortedArticles={articles}
      defaultExpandAll={defaultExpandAll}
      openArticleLinksInNewWindow={false}
    />
  </div>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);
