export const isMac = () => {
  try {
    return navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
  } catch(err) {
    return false;
  }
}
