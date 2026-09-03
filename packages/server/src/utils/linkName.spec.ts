import { decodeLinkName, linkNameFromRequestPath } from './linkName';

describe('linkName', () => {
  it('decodes an encodeURIComponent URL 伙伴名', () => {
    expect(decodeLinkName(encodeURIComponent('https://testbug'))).toBe('https://testbug');
  });

  it('leaves a plain name unchanged', () => {
    expect(decodeLinkName('normal-blog')).toBe('normal-blog');
  });

  it('does not throw on a name with a lone percent sign', () => {
    expect(decodeLinkName('100%')).toBe('100%');
  });

  it('extracts an unencoded URL name from the delete path (#252)', () => {
    expect(linkNameFromRequestPath('/api/admin/meta/link/https://testbug')).toBe('https://testbug');
  });

  it('extracts an encoded URL name from the delete path', () => {
    expect(
      linkNameFromRequestPath(`/api/admin/meta/link/${encodeURIComponent('https://testbug')}`),
    ).toBe('https://testbug');
  });

  it('strips the query string before decoding', () => {
    expect(linkNameFromRequestPath('/api/admin/meta/link/normal-blog?x=1')).toBe('normal-blog');
  });
});
