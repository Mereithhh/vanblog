import { render } from 'react-dom';
import { ThemeContext } from '../../../../website/utils/themeContext';
import SocialCard from '../../../../website/components/SocialCard';

const socials = [
  {
    type: 'github',
    value: 'https://github.com/Mereithhh',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    type: 'email',
    value: 'hi@example.com',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    type: 'custom',
    id: 'custom-tg',
    label: 'Telegram',
    value: 'https://t.me/vanblog',
    icon: 'https://example.com/telegram.png',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    type: 'custom',
    id: 'custom-x',
    label: 'Twitter / X',
    value: 'https://x.com/vanblog',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const App = () => (
  <ThemeContext.Provider value={{ theme: 'light', setTheme: () => {} }}>
    <div data-author-card>
      <SocialCard socials={socials} />
    </div>
  </ThemeContext.Provider>
);

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app');
}

render(<App />, target);
