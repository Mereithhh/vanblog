import { authorizeCommentPost, isForceLoginCommentEnabled, resolveWalineLoginMode } from './walineLogin';

describe('walineLogin', () => {
  it('treats boolean true and string "true" as enabled', () => {
    expect(isForceLoginCommentEnabled(true)).toBe(true);
    expect(isForceLoginCommentEnabled('true')).toBe(true);
    expect(isForceLoginCommentEnabled(1)).toBe(true);
    expect(isForceLoginCommentEnabled('1')).toBe(true);
  });

  it('treats false-like values as disabled', () => {
    expect(isForceLoginCommentEnabled(false)).toBe(false);
    expect(isForceLoginCommentEnabled('false')).toBe(false);
    expect(isForceLoginCommentEnabled(undefined)).toBe(false);
    expect(isForceLoginCommentEnabled(null)).toBe(false);
    expect(isForceLoginCommentEnabled('')).toBe(false);
  });

  it('maps the setting to Waline LOGIN env', () => {
    expect(resolveWalineLoginMode(true)).toBe('force');
    expect(resolveWalineLoginMode('true')).toBe('force');
    expect(resolveWalineLoginMode(false)).toBe('enable');
  });

  it('rejects anonymous posts when force login is on (#446)', () => {
    expect(authorizeCommentPost({ forceLoginComment: true })).toEqual({
      ok: false,
      status: 401,
    });
    expect(authorizeCommentPost({ forceLoginComment: 'true', userInfo: null })).toEqual({
      ok: false,
      status: 401,
    });
  });

  it('allows logged-in users when force login is on', () => {
    expect(
      authorizeCommentPost({
        forceLoginComment: true,
        userInfo: { objectId: 'user-1' },
      }),
    ).toEqual({ ok: true });
  });

  it('allows anonymous posts when force login is off', () => {
    expect(authorizeCommentPost({ forceLoginComment: false })).toEqual({ ok: true });
    expect(authorizeCommentPost({ forceLoginComment: 'false' })).toEqual({ ok: true });
  });
});
