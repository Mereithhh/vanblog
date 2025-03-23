/**
 * Theme utility functions for managing theme state
 */

export type ThemeType = 'light' | 'dark' | 'auto';

const THEME_KEY = 'vanblog-theme';

/**
 * Read theme setting from localStorage
 */
export const readTheme = (): ThemeType | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const theme = localStorage.getItem(THEME_KEY);
  if (theme && ['light', 'dark', 'auto'].includes(theme)) {
    return theme as ThemeType;
  }
  
  return null;
};

/**
 * Write theme setting to localStorage
 */
export const writeTheme = (theme: ThemeType): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(THEME_KEY, theme);
}; 