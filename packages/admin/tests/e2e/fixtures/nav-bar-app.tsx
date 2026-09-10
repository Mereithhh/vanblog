import { render } from 'react-dom';
import NavBar from '../../../../website/components/NavBar';
import { ThemeContext } from '../../../../website/utils/themeContext';

const params = new URLSearchParams(window.location.search);
const siteName = params.get('name') || 'Van';

const App = () => (
  <ThemeContext.Provider
    value={{
      theme: 'auto-light',
      setTheme: () => {},
    }}
  >
    <NavBar
      logo=""
      logoDark=""
      categories={[]}
      setOpen={() => {}}
      isOpen={false}
      siteName={siteName}
      menus={[{ id: 1, name: '首页', value: '/', level: 0 }]}
      showSubMenu="false"
      showAdminButton="false"
      showFriends="false"
      showRSS="false"
      headerLeftContent="siteName"
      defaultTheme="light"
      subMenuOffset={0}
      openArticleLinksInNewWindow={false}
    />
  </ThemeContext.Provider>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);
