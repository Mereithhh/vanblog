import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import UnLockCard from "../components/UnLockCard";
import { LOCKED_ARTICLE_PROMPT } from "../components/UnLockCard/copy";

// UnLockCard uses classic JSX (no React import). SSR needs the global.
(globalThis as { React?: typeof React }).React = React;

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
    const html = renderToStaticMarkup(
      createElement(UnLockCard, {
        id: 1,
        setLock: () => {},
        setContent: () => {},
      })
    );
    expect(html).toContain(LOCKED_ARTICLE_PROMPT);
    expect(html).toContain("文章已加密，请输入密码后查看：");
    expect(html).not.toContain("文章已解锁，请输入密码后查看：");
    expect(html).toContain('type="password"');
    expect(html).toContain("请输入密码");

    const src = readSrc("components/UnLockCard/index.tsx");
    expect(src).toMatch(/LOCKED_ARTICLE_PROMPT/);
    expect(src).not.toMatch(/文章已解锁，请输入密码后查看：/);
    expect(src).toMatch(/解锁成功！/);
  });
});
