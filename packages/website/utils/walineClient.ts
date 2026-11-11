import type { WalineInitOptions } from "@waline/client";

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

type ExtraKey = (typeof CLIENT_EXTRA_KEYS)[number];

export type WalineInitExtra = {
  login: "enable" | "force";
  imageUploader?: false;
} & Partial<Pick<WalineInitOptions, ExtraKey>>;

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
    applyWalineExtra(extra, key, setting?.[key]);
  }
  return extra;
}

function applyWalineExtra(extra: WalineInitExtra, key: ExtraKey, value: unknown) {
  if (value === undefined) {
    return;
  }
  switch (key) {
    case "wordLimit":
      if (typeof value === "number") {
        extra.wordLimit = value;
      } else if (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "number" &&
        typeof value[1] === "number"
      ) {
        extra.wordLimit = [value[0], value[1]];
      }
      return;
    case "pageSize":
      if (typeof value === "number") extra.pageSize = value;
      return;
    case "lang":
      if (typeof value === "string") extra.lang = value;
      return;
    case "recaptchaV3Key":
      if (typeof value === "string") extra.recaptchaV3Key = value;
      return;
    case "turnstileKey":
      if (typeof value === "string") extra.turnstileKey = value;
      return;
    case "dark":
      if (typeof value === "string" || typeof value === "boolean") extra.dark = value;
      return;
    case "copyright":
      if (typeof value === "boolean") extra.copyright = value;
      return;
    case "reaction":
      if (typeof value === "boolean") {
        extra.reaction = value;
      } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
        extra.reaction = value;
      }
      return;
    case "emoji":
      if (typeof value === "boolean" || Array.isArray(value)) extra.emoji = value;
      return;
    case "search":
      if (typeof value === "boolean" || (value !== null && typeof value === "object")) {
        extra.search = value as WalineInitOptions["search"];
      }
      return;
    case "meta":
      if (Array.isArray(value)) extra.meta = value as WalineInitOptions["meta"];
      return;
    case "requiredMeta":
      if (Array.isArray(value)) extra.requiredMeta = value as WalineInitOptions["requiredMeta"];
      return;
    case "locale":
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        extra.locale = value as WalineInitOptions["locale"];
      }
      return;
    default:
      return;
  }
}
