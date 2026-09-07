import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { SocialItem } from "../api/getAllData";
import { getIcon } from "../utils/getIcon";
import {
  getSocialHref,
  getSocialLabel,
  isCustomSocialType,
  isQrSocialType,
  pairSocialRows,
  visibleSocials,
} from "../utils/social";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const item = (partial: Partial<SocialItem> & Pick<SocialItem, "type" | "value">): SocialItem =>
  ({
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...partial,
  } as SocialItem);

describe("custom social display helpers (#394)", () => {
  it("uses the display label for custom contacts and Email for email", () => {
    expect(
      getSocialLabel(item({ type: "custom", value: "https://t.me/x", label: "Telegram" }))
    ).toBe("Telegram");
    expect(getSocialLabel(item({ type: "email", value: "a@b.com" }))).toBe("Email");
    expect(getSocialLabel(item({ type: "github", value: "https://github.com/x" }))).toBe(
      "Github"
    );
    expect(getSocialLabel(item({ type: "custom", value: "https://x.com/y" }))).toBe("Link");
    expect(isCustomSocialType("custom")).toBe(true);
    expect(isCustomSocialType("github")).toBe(false);
  });

  it("builds mailto for email and passes through custom / builtin urls", () => {
    expect(getSocialHref(item({ type: "email", value: "hi@example.com" }))).toBe(
      "mailto:hi@example.com"
    );
    expect(
      getSocialHref(item({ type: "custom", value: "https://t.me/vanblog", label: "Telegram" }))
    ).toBe("https://t.me/vanblog");
    expect(getSocialHref(item({ type: "github", value: "https://github.com/Mereithhh" }))).toBe(
      "https://github.com/Mereithhh"
    );
    expect(isQrSocialType("wechat")).toBe(true);
    expect(isQrSocialType("custom")).toBe(false);
  });

  it("keeps wechat-dark off the card and pairs remaining items in twos", () => {
    const rows = pairSocialRows(
      visibleSocials([
        item({ type: "github", value: "https://github.com/x" }),
        item({ type: "wechat", value: "/wechat-light.png" }),
        item({ type: "wechat-dark", value: "/wechat-dark.png" }),
        item({ type: "custom", value: "https://t.me/x", label: "Telegram" }),
      ])
    );
    expect(rows).toHaveLength(2);
    expect(rows[0][0].type).toBe("github");
    expect(rows[0][1].type).toBe("wechat");
    expect(rows[0][1].dark).toBe("/wechat-dark.png");
    expect(rows[1][0]).toEqual(
      expect.objectContaining({ type: "custom", label: "Telegram" })
    );
    expect(visibleSocials([]).length).toBe(0);
  });
});

describe("getIcon custom + builtin (#394)", () => {
  it("still returns the builtin github svg", () => {
    const el = getIcon("github", 20) as any;
    expect(el.type).toBe("svg");
    expect(el.props.width).toBe(20);
  });

  it("renders an optional custom icon url as an img", () => {
    const el = getIcon("custom", 20, "https://example.com/tg.png") as any;
    expect(el.type).toBe("img");
    expect(el.props.src).toBe("https://example.com/tg.png");
    expect(el.props.width).toBe(20);
  });

  it("falls back to a generic link svg when custom has no icon", () => {
    const el = getIcon("custom", 20) as any;
    expect(el.type).toBe("svg");
    expect(el.props.viewBox).toBe("0 0 24 24");
  });
});

describe("AuthorCard / SocialCard / SocialIcon wire custom fields (#394)", () => {
  it("passes socials through AuthorCard into SocialCard", () => {
    const src = readSrc("components/AuthorCard/index.tsx");
    expect(src).toMatch(/SocialCard socials=\{props\.option\.socials\}/);
  });

  it("SocialCard groups with visibleSocials and still renders SocialIcon", () => {
    const src = readSrc("components/SocialCard/index.tsx");
    expect(src).toMatch(/pairSocialRows\(visibleSocials\(props\.socials\)\)/);
    expect(src).toMatch(/<SocialIcon item=\{item\}/);
  });

  it("SocialIcon uses getSocialHref / getSocialLabel and forwards icon urls", () => {
    const src = readSrc("components/SocialIcon/index.tsx");
    expect(src).toMatch(/getSocialHref\(props\.item\)/);
    expect(src).toMatch(/getSocialLabel\(props\.item\)/);
    expect(src).toMatch(/getIcon\(props\.item\.type, iconSize, props\.item\.icon\)/);
  });
});
