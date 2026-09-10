import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  NAV_BAR_ROW_CLASS,
  NAV_DESKTOP_MIN_WIDTH_PX,
  NAV_SITE_NAME_ATTR,
  NAV_SITE_NAME_CENTER_TOLERANCE_PX,
  NAV_SITE_NAME_DESKTOP,
  NAV_SITE_NAME_DESKTOP_CLASS,
  NAV_SITE_NAME_MOBILE,
  NAV_SITE_NAME_MOBILE_CLASS,
  boxCenterX,
  isCenteredOnViewport,
  leftoverColumnCenterX,
  viewportCenterX,
} from "../components/NavBar/layout";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

describe("mobile site name center helper (#262)", () => {
  it("treats the title as centered when it sits on the viewport midline", () => {
    expect(viewportCenterX(390)).toBe(195);
    expect(boxCenterX({ x: 175, width: 40 })).toBe(195);
    expect(isCenteredOnViewport(195, 390)).toBe(true);
    expect(
      isCenteredOnViewport(195 + NAV_SITE_NAME_CENTER_TOLERANCE_PX, 390)
    ).toBe(true);
    expect(
      isCenteredOnViewport(195 + NAV_SITE_NAME_CENTER_TOLERANCE_PX + 1, 390)
    ).toBe(false);
  });

  it("is not the leftover column beside an asymmetric hamburger / actions pair", () => {
    const leftover = leftoverColumnCenterX({
      leadingWidth: 56,
      viewportWidth: 390,
      trailingWidth: 100,
    });
    expect(leftover).toBe(56 + (390 - 56 - 100) / 2);
    expect(leftover).not.toBe(viewportCenterX(390));
    expect(isCenteredOnViewport(leftover, 390)).toBe(false);
  });
});

describe("mobile site name markup and CSS (#262)", () => {
  const nav = readSrc("components/NavBar/index.tsx");
  const globals = readSrc("styles/globals.css");
  const layoutCss = readSrc("components/NavBar/siteNameLayout.css");

  it("centers the mobile title on the full header row, not the leftover column", () => {
    expect(NAV_BAR_ROW_CLASS).toBe("nav-bar-row");
    expect(NAV_SITE_NAME_MOBILE_CLASS).toBe("nav-site-name-mobile");
    expect(NAV_SITE_NAME_DESKTOP_CLASS).toBe("nav-site-name-desktop");
    expect(NAV_SITE_NAME_MOBILE).toBe("mobile");
    expect(NAV_SITE_NAME_DESKTOP).toBe("desktop");
    expect(nav).toMatch(/NAV_BAR_ROW_CLASS/);
    expect(nav).toMatch(/NAV_SITE_NAME_MOBILE_CLASS/);
    expect(nav).toMatch(/NAV_SITE_NAME_DESKTOP_CLASS/);
    expect(nav).toMatch(
      new RegExp(`${NAV_SITE_NAME_ATTR}=\\{NAV_SITE_NAME_MOBILE\\}`)
    );
    expect(nav).toMatch(
      new RegExp(`${NAV_SITE_NAME_ATTR}=\\{NAV_SITE_NAME_DESKTOP\\}`)
    );
    expect(nav).toMatch(/nav-action ml-auto/);
    expect(nav).not.toMatch(/translateX\(30px\)/);
    expect(nav).not.toMatch(
      /md:hidden\s+flex-grow text-center\s+flex items-center justify-center/
    );
  });

  it("ships absolute-center CSS from the shared sheet imported by globals", () => {
    expect(globals).toMatch(
      /@import\s+["']\.\.\/components\/NavBar\/siteNameLayout\.css["']/
    );
    expect(layoutCss).toMatch(/\.nav-site-name-mobile\s*\{/);
    expect(layoutCss).toMatch(/left:\s*50%/);
    expect(layoutCss).toMatch(/translateX\(-50%\)/);
    expect(layoutCss).toMatch(/position:\s*absolute/);
    expect(layoutCss).toMatch(/\.nav-bar-row\s*\{/);
    expect(layoutCss).toMatch(/position:\s*relative/);
    expect(layoutCss).toMatch(
      new RegExp(`@media \\(min-width:\\s*${NAV_DESKTOP_MIN_WIDTH_PX}px\\)`)
    );
    expect(layoutCss).toMatch(
      /\.nav-site-name-mobile\s*\{[\s\S]*display:\s*none/
    );
  });
});
