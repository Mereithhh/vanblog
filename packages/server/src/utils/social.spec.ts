import {
  CUSTOM_SOCIAL_TYPE,
  generateSocialId,
  isBuiltinSocialType,
  isCustomSocialType,
  sameSocialItem,
  shouldDeleteSocial,
  socialItemKey,
} from './social';

describe('social helpers (#394)', () => {
  it('recognizes builtin types and custom ids', () => {
    expect(isBuiltinSocialType('github')).toBe(true);
    expect(isBuiltinSocialType('wechat-dark')).toBe(true);
    expect(isBuiltinSocialType('custom')).toBe(false);
    expect(isCustomSocialType('custom')).toBe(true);
    expect(isCustomSocialType('custom-abc')).toBe(true);
    expect(isCustomSocialType('github')).toBe(false);
  });

  it('keys custom items by id and builtins by type', () => {
    expect(socialItemKey({ type: 'github' })).toBe('github');
    expect(socialItemKey({ type: 'custom', id: 'custom-1' })).toBe('custom-1');
    expect(generateSocialId()).toMatch(/^custom-/);
    expect(CUSTOM_SOCIAL_TYPE).toBe('custom');
  });

  it('matches custom items by id so two customs do not collide', () => {
    expect(sameSocialItem({ type: 'github' }, { type: 'github' })).toBe(true);
    expect(sameSocialItem({ type: 'github' }, { type: 'email' })).toBe(false);
    expect(
      sameSocialItem({ type: 'custom', id: 'a' }, { type: 'custom', id: 'a' }),
    ).toBe(true);
    expect(
      sameSocialItem({ type: 'custom', id: 'a' }, { type: 'custom', id: 'b' }),
    ).toBe(false);
    expect(sameSocialItem({ type: 'custom' }, { type: 'custom' })).toBe(false);
  });

  it('deletes builtins by type and customs by id without wiping all customs', () => {
    expect(shouldDeleteSocial({ type: 'github' }, 'github')).toBe(true);
    expect(shouldDeleteSocial({ type: 'custom', id: 'custom-1' }, 'custom')).toBe(false);
    expect(shouldDeleteSocial({ type: 'custom', id: 'custom-1' }, 'custom-1')).toBe(true);
    expect(shouldDeleteSocial({ type: 'custom', id: 'custom-2' }, 'custom-1')).toBe(false);
  });
});
