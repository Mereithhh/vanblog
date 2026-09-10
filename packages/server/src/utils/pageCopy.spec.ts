import {
  DEFAULT_ABOUT_TITLE,
  DEFAULT_FRIEND_LINK_APPLY_CONTENT,
  DEFAULT_FRIEND_LINK_INTRO,
  resolvePageCopy,
  sanitizePageCopy,
} from './pageCopy';

describe('pageCopy (#373)', () => {
  it('keeps the previous hardcoded friend-link and about defaults', () => {
    expect(DEFAULT_FRIEND_LINK_INTRO).toBe('以下是本站的友情链接，排名不分先后：');
    expect(DEFAULT_ABOUT_TITLE).toBe('关于我');
    expect(DEFAULT_FRIEND_LINK_APPLY_CONTENT).toContain('**[申领要求]**');
    expect(DEFAULT_FRIEND_LINK_APPLY_CONTENT).toContain('请先添加本站为友链后再申请友链');
    expect(DEFAULT_FRIEND_LINK_APPLY_CONTENT).toContain('{{siteName}}');
    expect(DEFAULT_FRIEND_LINK_APPLY_CONTENT).toContain('{{description}}');
    expect(DEFAULT_FRIEND_LINK_APPLY_CONTENT).toContain('{{url}}');
    expect(DEFAULT_FRIEND_LINK_APPLY_CONTENT).toContain('{{logo}}');
  });

  it('falls back when the setting is empty or unset', () => {
    expect(resolvePageCopy(undefined, DEFAULT_FRIEND_LINK_INTRO)).toBe(DEFAULT_FRIEND_LINK_INTRO);
    expect(resolvePageCopy(null, DEFAULT_FRIEND_LINK_INTRO)).toBe(DEFAULT_FRIEND_LINK_INTRO);
    expect(resolvePageCopy('', DEFAULT_ABOUT_TITLE)).toBe(DEFAULT_ABOUT_TITLE);
    expect(resolvePageCopy('   ', DEFAULT_ABOUT_TITLE)).toBe(DEFAULT_ABOUT_TITLE);
  });

  it('keeps a custom string', () => {
    expect(resolvePageCopy('欢迎交换友链', DEFAULT_FRIEND_LINK_INTRO)).toBe('欢迎交换友链');
    expect(resolvePageCopy('About', DEFAULT_ABOUT_TITLE)).toBe('About');
  });

  it('persists strings and ignores non-strings so a bad payload cannot wipe copy', () => {
    expect(sanitizePageCopy('自定义底部', '旧文案')).toBe('自定义底部');
    expect(sanitizePageCopy('', '旧文案')).toBe('');
    expect(sanitizePageCopy(undefined, '旧文案')).toBe('旧文案');
    expect(sanitizePageCopy(null, '旧文案')).toBe('');
    expect(sanitizePageCopy(12, '旧文案')).toBe('旧文案');
    expect(sanitizePageCopy({ text: 'x' }, '旧文案')).toBe('旧文案');
  });
});
