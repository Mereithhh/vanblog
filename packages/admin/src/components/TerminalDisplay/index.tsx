import convert from 'ansi-to-html';
const ansiToHtml = new convert();
export default function ({ content }: { content: string }) {
  return (
    <code
      dangerouslySetInnerHTML={{
        __html: content
          .split('\n')
          .map((s) => ansiToHtml.toHtml(s))
          .join('<br/>'),
      }}
    />
  );
}
