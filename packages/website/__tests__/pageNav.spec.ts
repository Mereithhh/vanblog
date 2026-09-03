import { describe, expect, it } from "vitest";
import { calItemList, PageItem, PageNavProps } from "../components/PageNav/core";
import {
  pageNavCurrentCls,
  pageNavDefaultCls,
  pageNavNumberClass,
} from "../components/PageNav/classes";

const lightBgToken = (cls: string) => {
  const match = cls.match(/(?:^|\s)(bg-(?:white|black|transparent|current|gray-\d+))(?:\s|$)/);
  return match ? match[1] : null;
};

const lightTextToken = (cls: string) => {
  const match = cls.match(
    /(?:^|\s)(text-(?:white|black|transparent|current|gray-\d+))(?:\s|$)/
  );
  return match ? match[1] : null;
};

const itemsOf = (overrides: Partial<PageNavProps> & Pick<PageNavProps, "total" | "current">) =>
  calItemList({
    base: "/",
    more: "/page",
    ...overrides,
  });

const numbered = (items: PageItem[]) =>
  items.filter((item) => item.type === "link" || item.type === "link-cur");

describe("calItemList current page marker", () => {
  const cases: Array<{
    name: string;
    total: number;
    current: number;
    pageSize?: number;
    expectPages?: number[];
    expectPrev: PageItem["type"];
    expectNext: PageItem["type"];
    expectEllipsis?: PageItem["type"][];
  }> = [
    {
      name: "3 pages, current first",
      total: 15,
      current: 1,
      expectPages: [1, 2, 3],
      expectPrev: "pre-btn-disable",
      expectNext: "next-btn",
    },
    {
      name: "3 pages, current middle",
      total: 15,
      current: 2,
      expectPages: [1, 2, 3],
      expectPrev: "pre-btn",
      expectNext: "next-btn",
    },
    {
      name: "3 pages, current last",
      total: 15,
      current: 3,
      expectPages: [1, 2, 3],
      expectPrev: "pre-btn",
      expectNext: "next-btn-disable",
    },
    {
      name: "10 pages, current near start",
      total: 50,
      current: 2,
      expectPrev: "pre-btn",
      expectNext: "next-btn",
      expectEllipsis: ["next-more"],
    },
    {
      name: "10 pages, current at 4 (xxxx,... pattern)",
      total: 50,
      current: 4,
      expectPrev: "pre-btn",
      expectNext: "next-btn",
      expectEllipsis: ["next-more"],
    },
    {
      name: "10 pages, current in the middle",
      total: 50,
      current: 6,
      expectPrev: "pre-btn",
      expectNext: "next-btn",
      expectEllipsis: ["pre-more", "next-more"],
    },
    {
      name: "10 pages, current near end",
      total: 50,
      current: 9,
      expectPrev: "pre-btn",
      expectNext: "next-btn",
      expectEllipsis: ["pre-more"],
    },
    {
      name: "10 pages, current last",
      total: 50,
      current: 10,
      expectPrev: "pre-btn",
      expectNext: "next-btn-disable",
      expectEllipsis: ["pre-more"],
    },
  ];

  it.each(cases)(
    "marks exactly one link-cur ($name)",
    ({
      total,
      current,
      pageSize,
      expectPages,
      expectPrev,
      expectNext,
      expectEllipsis,
    }) => {
      const items = itemsOf({ total, current, pageSize });
      const currentItems = items.filter((item) => item.type === "link-cur");
      expect(currentItems).toHaveLength(1);
      expect(currentItems[0].page).toBe(current);

      const pages = numbered(items);
      expect(pages.filter((item) => item.type === "link-cur")).toHaveLength(1);
      expect(pages.filter((item) => item.type === "link").length).toBe(
        pages.length - 1
      );
      if (expectPages) {
        expect(pages.map((item) => item.page)).toEqual(expectPages);
      }

      expect(items[0].type).toBe(expectPrev);
      expect(items[items.length - 1].type).toBe(expectNext);

      const ellipsis = items
        .filter((item) => item.type === "pre-more" || item.type === "next-more")
        .map((item) => item.type);
      expect(ellipsis).toEqual(expectEllipsis ?? []);
    }
  );
});

describe("page nav light-mode classes used by render.tsx", () => {
  it("keeps current and default backgrounds from sharing bg-white", () => {
    expect(pageNavDefaultCls.split(/\s+/)).toContain("bg-white");
    expect(pageNavCurrentCls.split(/\s+/)).not.toContain("bg-white");
    expect(pageNavNumberClass(true)).not.toContain("bg-white");
    expect(pageNavNumberClass(false)).toContain("bg-white");
  });

  it("gives the current page a distinct light-mode background and stronger text", () => {
    const currentBg = lightBgToken(pageNavCurrentCls);
    const defaultBg = lightBgToken(pageNavDefaultCls);
    const currentText = lightTextToken(pageNavCurrentCls);
    const defaultText = lightTextToken(pageNavDefaultCls);

    expect(currentBg).toBe("bg-gray-700");
    expect(defaultBg).toBe("bg-white");
    expect(currentBg).not.toBe(defaultBg);

    expect(currentText).toBe("text-white");
    expect(defaultText).toBe("text-gray-600");
    expect(currentText).not.toBe(defaultText);
    expect(pageNavCurrentCls.split(/\s+/)).toContain("font-medium");
  });

  it("does not put conflicting light-mode fills on the same class string", () => {
    expect(pageNavCurrentCls).not.toMatch(/\bbg-white\b/);
    expect(pageNavDefaultCls).not.toMatch(/\bbg-gray-700\b/);
    expect(pageNavNumberClass(true)).not.toBe(pageNavNumberClass(false));
  });

  it("keeps distinct dark-mode fills so night theme stays readable", () => {
    expect(pageNavCurrentCls).toMatch(/\bdark:bg-dark-hover\b/);
    expect(pageNavDefaultCls).toMatch(/\bdark:bg-dark-1\b/);
    expect(pageNavCurrentCls).toMatch(/\bdark:pg-text-dark-hover\b/);
    expect(pageNavDefaultCls).toMatch(/\bdark:pg-text-dark\b/);
  });
});
