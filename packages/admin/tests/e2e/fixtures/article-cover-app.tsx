import { render } from 'react-dom';
import ArticleCover from '../../../../website/components/ArticleCover';
import { articleShareImageMeta } from '../../../../website/utils/articleCover';

const COVER = '/cover.png';
const SITE = 'https://blog.example.com';

function ShareMeta({ cover, siteUrl }: { cover?: string; siteUrl?: string }) {
  return (
    <>
      {articleShareImageMeta(cover, siteUrl).map((tag, index) =>
        'property' in tag ? (
          <meta key={`og-${index}`} property={tag.property} content={tag.content} />
        ) : (
          <meta key={`tw-${index}`} name={tag.name} content={tag.content} />
        ),
      )}
    </>
  );
}

const App = () => (
  <div>
    <div data-article-cover-case="set">
      <ShareMeta cover={COVER} siteUrl={SITE} />
      <article className="post-card bg-white py-4 px-1">
        <ArticleCover src={COVER} alt="有题头图" />
        <h1>有题头图的文章</h1>
        <p>正文</p>
      </article>
    </div>
    <div data-article-cover-case="unset">
      <article className="post-card bg-white py-4 px-1">
        <ArticleCover src="" alt="无题头图" />
        <h1>没有题头图的文章</h1>
        <p>正文</p>
      </article>
    </div>
  </div>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);
