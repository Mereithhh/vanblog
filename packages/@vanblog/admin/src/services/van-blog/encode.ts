export const encodeQuerystring = (s: string) => {
  if (!s) {
    return '';
  }
  return s.replace(/#/g, '%23').replace(/\//g, '%2F');
};
