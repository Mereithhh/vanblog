import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { LOCKED_ARTICLE_PROMPT } from "../components/UnLockCard/copy";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

describe("UnLockCard locked prompt (#414)", () => {
  it("tells the visitor the article is still encrypted and asks for a password", () => {
    expect(LOCKED_ARTICLE_PROMPT).toBe("文章已加密，请输入密码后查看：");
    expect(LOCKED_ARTICLE_PROMPT).toContain("已加密");
    expect(LOCKED_ARTICLE_PROMPT).toContain("请输入密码后查看");
    expect(LOCKED_ARTICLE_PROMPT).not.toContain("已解锁");
  });

  it("renders that locked prompt on the password card, not unlock-success wording", () => {
    const src = readSrc("components/UnLockCard/index.tsx");
    expect(src).toMatch(/LOCKED_ARTICLE_PROMPT/);
    expect(src).not.toMatch(/文章已解锁，请输入密码后查看：/);
    expect(src).toMatch(/解锁成功！/);
  });
});
