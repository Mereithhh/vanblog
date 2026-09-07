export const BUILTIN_SOCIAL_TYPES = [
  'bilibili',
  'email',
  'github',
  'gitee',
  'wechat',
  'wechat-dark',
] as const;

export const CUSTOM_SOCIAL_TYPE = 'custom';

export type BuiltinSocialType = (typeof BUILTIN_SOCIAL_TYPES)[number];

export function isBuiltinSocialType(type?: string): type is BuiltinSocialType {
  return Boolean(type && (BUILTIN_SOCIAL_TYPES as readonly string[]).includes(type));
}

export function isCustomSocialType(type?: string): boolean {
  if (!type) {
    return false;
  }
  return type === CUSTOM_SOCIAL_TYPE || type.startsWith(`${CUSTOM_SOCIAL_TYPE}-`);
}

export function generateSocialId(): string {
  return `${CUSTOM_SOCIAL_TYPE}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function socialItemKey(item: { type?: string; id?: string }): string {
  if (isCustomSocialType(item.type) && item.id) {
    return item.id;
  }
  return item.type || '';
}

export function sameSocialItem(
  existing: { type?: string; id?: string },
  incoming: { type?: string; id?: string },
): boolean {
  if (incoming.id && existing.id) {
    return existing.id === incoming.id;
  }
  if (isCustomSocialType(incoming.type) || isCustomSocialType(existing.type)) {
    return Boolean(incoming.id && existing.id && incoming.id === existing.id);
  }
  return Boolean(incoming.type && existing.type === incoming.type);
}

export function shouldDeleteSocial(
  item: { type?: string; id?: string },
  key: string,
): boolean {
  if (isBuiltinSocialType(key)) {
    return item.type === key;
  }
  if (key === CUSTOM_SOCIAL_TYPE) {
    return item.type === CUSTOM_SOCIAL_TYPE && !item.id;
  }
  return item.id === key || item.type === key;
}
