export const sortArticle = (data: any[], sortKey: string, sortDesc: 'asc' | 'desc') => {
  const t: any[] = [];

  for (const each of data) {
    const articleMeta = each?._doc || each;
    t.push(articleMeta);
  }
  return t.sort((a, b) => {
    const keyA = a[sortKey];
    const keyB = b[sortKey];
    if (sortDesc == 'asc') {
      return keyA <= keyB ? -1 : 1;
    } else {
      return keyB <= keyA ? -1 : 1;
    }
  });
};
