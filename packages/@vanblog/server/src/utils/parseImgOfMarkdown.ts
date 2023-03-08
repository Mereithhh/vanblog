export const parseImgLinksOfMarkdown = (content: string) => {
  const regexp = /!\[(.*?)\]\((.*?)\)/gm;

  const res = [];
  let matcher;
  while ((matcher = regexp.exec(content)) !== null) {
    for (const e of matcher) {
      if (!e.includes('![') && e.includes('http')) {
        if (!res.includes(e)) {
          res.push(e);
        }
      }
    }
  }

  return res;
};
