import { SocialItem, SocialType } from "../api/getAllData";

export const BUILTIN_SOCIAL_TYPES = [
  "bilibili",
  "email",
  "github",
  "gitee",
  "wechat",
  "wechat-dark",
] as const;

export const CUSTOM_SOCIAL_TYPE = "custom";

export type BuiltinSocialType = (typeof BUILTIN_SOCIAL_TYPES)[number];

export function isBuiltinSocialType(type?: string): type is BuiltinSocialType {
  return Boolean(
    type && (BUILTIN_SOCIAL_TYPES as readonly string[]).includes(type)
  );
}

export function isCustomSocialType(type?: string): boolean {
  if (!type) {
    return false;
  }
  return (
    type === CUSTOM_SOCIAL_TYPE ||
    type.startsWith(`${CUSTOM_SOCIAL_TYPE}-`) ||
    !isBuiltinSocialType(type)
  );
}

export function getSocialLabel(item: Pick<SocialItem, "type" | "label">): string {
  if (item.label && item.label.trim()) {
    return item.label.trim();
  }
  if (item.type === "email") {
    return "Email";
  }
  if (isCustomSocialType(item.type)) {
    return "Link";
  }
  if (!item.type) {
    return "Link";
  }
  return item.type.substring(0, 1).toLocaleUpperCase() + item.type.substring(1);
}

export function getSocialHref(item: Pick<SocialItem, "type" | "value">): string {
  if (item.type === "email") {
    return `mailto:${item.value}`;
  }
  return item.value;
}

export function isQrSocialType(type?: SocialType): boolean {
  return type === "wechat";
}

export function visibleSocials(socials: SocialItem[] | undefined): SocialItem[] {
  if (!socials || !socials.length) {
    return [];
  }
  const darkWechat = socials.find((each) => each.type == "wechat-dark");
  return socials
    .filter((each) => each.type != "wechat-dark")
    .map((temp) => {
      if (temp.type == "wechat" && darkWechat) {
        return { ...temp, dark: darkWechat.value };
      }
      return { ...temp };
    });
}

export function pairSocialRows(items: SocialItem[]): SocialItem[][] {
  const rows: SocialItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}
