import { load } from 'cheerio';
export const parseHtmlToHeadTagArr = (html) => {
  const h = load(`<div>${html}</div>`);
  const tags = h('div').first().children();
  const result = [];
  for (const t of tags) {
    //@ts-ignore
    let content = t?.next?.data || undefined;
    if (content) {
      content = content.trim();
      content = content.replace(/\n/g, '');
      if (content == '') content = undefined;
    }

    const item = {
      name: t.name,
      props: t.attribs,
      content: content,
    };
    result.push(item);
  }
  return result;
};
