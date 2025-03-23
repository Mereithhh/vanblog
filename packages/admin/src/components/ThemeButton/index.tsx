import { useRef, useEffect } from 'react';
import { useModel } from '@/utils/umiCompat';
import { readTheme, writeTheme } from '@/utils/theme';
import VanBlog from '@/types/initialState';
import './index.less';

interface ThemeButtonProps {
  showText: boolean;
  className?: string;
}

export default function ThemeButton({ showText, className = '' }: ThemeButtonProps) {
  const { current } = useRef<any>({ hasInit: false });
  const { current: currentTimer } = useRef<any>({ timer: null });
  const { initialState, setInitialState } = useModel();

  // Apply theme change to DOM
  const applyThemeToDOM = (newTheme: string) => {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    
    if (newTheme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.add('dark-theme-body'); // Additional class for custom styles
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme-body');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Also update Ant Design's theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    
    // Special handling for ByteMD
    const applyBytemdDarkMode = (isDark: boolean) => {
      try {
        const bytemdElements = document.querySelectorAll('.bytemd');
        if (bytemdElements && bytemdElements.length > 0) {
          bytemdElements.forEach(editor => {
            if (isDark) {
              (editor as HTMLElement).style.setProperty('--bg-color', '#141414');
              (editor as HTMLElement).style.setProperty('--border-color', '#303030');
              (editor as HTMLElement).style.setProperty('--color', 'rgba(255, 255, 255, 0.65)');
            } else {
              (editor as HTMLElement).style.removeProperty('--bg-color');
              (editor as HTMLElement).style.removeProperty('--border-color');
              (editor as HTMLElement).style.removeProperty('--color');
            }
          });
        }
      } catch (e) {
        console.warn('Failed to apply ByteMD theme:', e);
      }
    };
    
    // Apply ByteMD theme changes
    applyBytemdDarkMode(newTheme === 'dark');
  };

  const setTheme = (newTheme: 'auto' | 'light' | 'dark') => {
    const curInitialState: VanBlog.InitialState = { ...initialState };
    if (curInitialState.settings) {
      curInitialState.settings.theme = newTheme;
      curInitialState.settings.navTheme = newTheme === 'dark' ? 'realDark' : 'light';
      setInitialState(curInitialState);
      writeTheme(newTheme);
      
      // Apply the theme to DOM immediately
      if (newTheme === 'auto') {
        // For auto, detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyThemeToDOM(prefersDark ? 'dark' : 'light');
      } else {
        applyThemeToDOM(newTheme);
      }
      
      console.log('[Theme] Changed to:', newTheme);
    }
  };

  // Add effect to listen for system theme changes when in auto mode
  useEffect(() => {
    const theme = initialState?.settings?.theme || readTheme() || 'auto';
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        applyThemeToDOM(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [initialState?.settings?.theme]);

  const setTimer = (callback: Function, delay: number) => {
    currentTimer.timer = setTimeout(() => {
      callback();
    }, delay);
  };

  const clearTimer = () => {
    if (currentTimer.timer) {
      clearTimeout(currentTimer.timer);
      currentTimer.timer = null;
    }
  };

  const theme =
    initialState?.settings?.theme || readTheme() || 'auto';

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = readTheme() || 'auto';
    
    if (savedTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyThemeToDOM(prefersDark ? 'dark' : 'light');
    } else {
      applyThemeToDOM(savedTheme);
    }
    
    // Sync theme with initialState if needed
    if (initialState?.settings && initialState.settings.theme !== savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSwitch = () => {
    if (!initialState || !initialState.settings) return;
    // light -> dark -> auto -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const iconSize = 16;
  
  // Create an icon component matching the structure of other menu items
  const ThemeIcon = () => {
    if (theme === 'light') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '14px', fontSize: '14px' }}>
          <svg
            viewBox="0 0 24 24"
            width={iconSize}
            height={iconSize}
            fill="currentColor"
            style={{ marginRight: 0 }}
          >
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18Z" />
          </svg>
        </span>
      );
    } else if (theme === 'dark') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '14px', fontSize: '14px' }}>
          <svg
            viewBox="0 0 24 24"
            width={iconSize}
            height={iconSize}
            fill="currentColor"
            style={{ marginRight: 0 }}
          >
            <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 22 11.8995C21.3608 16.3743 17.3659 19.7499 12.5 19.7499C6.97715 19.7499 2.5 15.2728 2.5 9.74994C2.5 6.07277 4.60504 2.88202 7.70435 1.5C7.25167 3.15141 7 4.92169 7 6.75C7 11.5941 10.4059 15 15.25 15C16.3954 15 17.4908 14.7958 18.4904 14.4241C15.2137 16.3482 10.6886 15.0249 10 7Z" />
          </svg>
        </span>
      );
    } else {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '14px', fontSize: '14px' }}>
          <svg
            viewBox="0 0 24 24"
            width={iconSize}
            height={iconSize}
            fill="currentColor"
            style={{ marginRight: 0 }}
          >
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69346 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          </svg>
        </span>
      );
    }
  };

  // Use the same structure as other menu links
  return (
    <a className={`theme-link ${className}`} onClick={handleSwitch} style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
      <ThemeIcon />
      {showText && (
        <span style={{ marginLeft: '10px', transition: 'opacity 0.3s' }}>
          {theme === 'light' && '日间'}
          {theme === 'dark' && '夜间'}
          {theme === 'auto' && '自动'}
        </span>
      )}
    </a>
  );
}
