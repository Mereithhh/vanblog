import { render } from 'react-dom';
import PageNav from '../../../../website/components/PageNav';

const shared = { total: 15, base: '/', more: '/page' };
/** 500 articles / default 5 per page → 100 pages, for far jump (#229). */
const far = { total: 500, base: '/', more: '/page' };

const App = () => (
  <div>
    <section data-page-nav-case="first">
      <h1>First page</h1>
      <PageNav {...shared} current={1} />
    </section>
    <section data-page-nav-case="middle">
      <h1>Middle page</h1>
      <PageNav {...shared} current={2} />
    </section>
    <section data-page-nav-case="last">
      <h1>Last page</h1>
      <PageNav {...shared} current={3} />
    </section>
    <section data-page-nav-case="far">
      <h1>Far page jump</h1>
      <PageNav {...far} current={1} />
    </section>
  </div>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);
