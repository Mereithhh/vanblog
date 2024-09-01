export const isMac = (): boolean =>
  typeof navigator !== 'undefined' && Boolean(navigator.userAgent?.toLowerCase().includes('mac'));
export const isMobileByScreenSize = (): boolean =>
  typeof matchMedia !== 'undefined' && !matchMedia(`(min-width: 768px)`)?.matches;
