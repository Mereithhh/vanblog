export function hasToc(content: string) {
  const r = /#+\s+/;
  return r.test(content);
}
