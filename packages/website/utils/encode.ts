export const encodeQuerystring = (s: string) => {
  return s.replace(/#/g, "%23").replace(/\//g, "%2F");
};
