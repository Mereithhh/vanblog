export const getInitTheme = () => {
  let theme = 'auto';
  if (!('theme' in localStorage) || localStorage.theme == 'auto') {
    return 'auto';
  } else {
    if (localStorage.theme === 'dark') {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  }
  return theme;
};

export const decodeAutoTheme = () => {
  // Use system preference for auto theme
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'realDark';
  } else {
    return 'light';
  }
};

export const mapTheme = (theme) => {
  // 把自己定义的主题变成系统的
  if (theme == 'auto') {
    return decodeAutoTheme();
  } else {
    if (theme == 'light') {
      return 'light';
    } else {
      return 'realDark';
    }
  }
};

export const beforeSwitchTheme = (to) => {
  // Save to localStorage
  localStorage.theme = to;
  
  // Apply theme to document
  applyThemeToDOM(to);
  
  return mapTheme(to);
};

export const applyThemeToDOM = (theme) => {
  // Get actual theme (accounting for auto)
  const effectiveTheme = theme === 'auto' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
    
  // Update body classes
  document.body.classList.remove('light-theme', 'dark-theme');
  document.body.classList.add(`${effectiveTheme}-theme`);
  
  // Update data-theme attribute
  document.documentElement.setAttribute('data-theme', effectiveTheme);
  
  // Update Ant Design theme
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
  
  console.log('[Theme] Applied:', effectiveTheme);
};

export const writeTheme = (theme) => {
  localStorage.theme = theme;
  applyThemeToDOM(theme);
  return theme;
};
