export type WalineCommentSetting = {
  forceLoginComment?: boolean;
  imageUploader?: unknown;
  wordLimit?: unknown;
  pageSize?: unknown;
  meta?: unknown;
  requiredMeta?: unknown;
  emoji?: unknown;
  lang?: unknown;
  locale?: unknown;
  dark?: unknown;
  search?: unknown;
  reaction?: unknown;
  copyright?: unknown;
  recaptchaV3Key?: unknown;
  turnstileKey?: unknown;
};

export type WalineInitExtra = {
  login: "enable" | "force";
  imageUploader?: false;
  wordLimit?: unknown;
  pageSize?: unknown;
  meta?: unknown;
  requiredMeta?: unknown;
  emoji?: unknown;
  lang?: unknown;
  locale?: unknown;
  dark?: unknown;
  search?: unknown;
  reaction?: unknown;
  copyright?: unknown;
  recaptchaV3Key?: unknown;
  turnstileKey?: unknown;
};

const CLIENT_EXTRA_KEYS = [
  "wordLimit",
  "pageSize",
  "meta",
  "requiredMeta",
  "emoji",
  "lang",
  "locale",
  "dark",
  "search",
  "reaction",
  "copyright",
  "recaptchaV3Key",
  "turnstileKey",
] as const;

function coerceFalse(value: unknown): boolean {
  return value === false || value === "false";
}

/**
 * Maps /api/public/comment-setting into @waline/client init() props.
 * `login` always comes from the admin force-login toggle, not otherConfig.
 */
export function buildWalineInitOptions(
  setting?: WalineCommentSetting | null,
): WalineInitExtra {
  const extra: WalineInitExtra = {
    login: setting?.forceLoginComment === true ? "force" : "enable",
  };
  if (coerceFalse(setting?.imageUploader)) {
    extra.imageUploader = false;
  }
  for (const key of CLIENT_EXTRA_KEYS) {
    const value = setting?.[key];
    if (value !== undefined) {
      extra[key] = value;
    }
  }
  return extra;
}
