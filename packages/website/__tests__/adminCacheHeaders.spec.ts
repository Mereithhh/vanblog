import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const websiteRoot = path.join(__dirname, "..");

describe("admin no-store headers (#140)", () => {
  it("Next.js sets no-store for /admin and not for all public pages", async () => {
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const nextConfig = require("../next.config.js");
    const rules = await nextConfig.headers();
    const sources = rules.map((rule: { source: string }) => rule.source);
    expect(sources).toContain("/admin");
    expect(sources).toContain("/admin/:path*");
    expect(sources).not.toContain("/");
    expect(sources).not.toContain("/:path*");
    expect(sources).not.toContain("/_next/static/:path*");
    for (const rule of rules) {
      const keys = Object.fromEntries(
        rule.headers.map((header: { key: string; value: string }) => [
          header.key,
          header.value,
        ])
      );
      expect(keys["Cache-Control"]).toMatch(/private/);
      expect(keys["Cache-Control"]).toMatch(/no-store/);
      expect(keys["CDN-Cache-Control"]).toBe("no-store");
      expect(keys["Cloudflare-CDN-Cache-Control"]).toBe("no-store");
    }
  });

  it("does not rewrite public article HTML caching in next.config", () => {
    const src = readFileSync(path.join(websiteRoot, "next.config.js"), "utf8");
    expect(src).toMatch(/source: "\/admin"/);
    expect(src).not.toMatch(/source: "\/:path\*"/);
  });
});
