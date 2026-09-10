import { render } from 'react-dom';
import { PostBottom } from '../../../../website/components/PostCard/bottom';

const App = () => (
  <div>
    <section data-tag-case="article">
      <h1>Article page tags</h1>
      <PostBottom
        type="article"
        lock={false}
        tags={['js', '随笔']}
        openArticleLinksInNewWindow={false}
        pre={{ id: 2, title: '上一篇' }}
        next={{ id: 3, title: '下一篇' }}
      />
    </section>
    <section data-tag-case="locked">
      <h1>Locked article</h1>
      <PostBottom
        type="article"
        lock={true}
        tags={['js', '随笔']}
        openArticleLinksInNewWindow={false}
      />
    </section>
    <section data-tag-case="overview">
      <h1>List card</h1>
      <PostBottom
        type="overview"
        lock={false}
        tags={['js']}
        openArticleLinksInNewWindow={false}
      />
    </section>
    <section data-tag-case="empty">
      <h1>No tags</h1>
      <PostBottom
        type="article"
        lock={false}
        tags={[]}
        openArticleLinksInNewWindow={false}
      />
    </section>
    <section data-tag-case="dark" className="dark text-gray-300">
      <h1>Dark mode tags</h1>
      <PostBottom
        type="article"
        lock={false}
        tags={['dark-tag']}
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
