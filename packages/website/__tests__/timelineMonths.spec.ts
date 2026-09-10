import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  describeTimelineArchives,
  formatTimelineMonthLabel,
  groupTimelineByYearAndMonth,
  parseTimelineDate,
  timelineMonthKey,
} from "../utils/timelineMonths";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const articleOf = (
  id: number,
  title: string,
  year: number,
  month: number,
  day = 15
) => ({
  id,
  title,
  createdAt: new Date(year, month - 1, day, 12, 0, 0),
});

const multiMonthArticles = {
  "2024": [
    articleOf(4, "十二月下旬", 2024, 12, 20),
    articleOf(3, "十二月上旬", 2024, 12, 3),
    articleOf(2, "三月", 2024, 3, 15),
  ],
  "2023": [articleOf(1, "八月", 2023, 8, 15)],
};

describe("parseTimelineDate / month labels", () => {
  it("reads year and 1-based month from ISO dates", () => {
    expect(parseTimelineDate(new Date(2024, 11, 20, 12))).toMatchObject({
      year: 2024,
      month: 12,
    });
    expect(parseTimelineDate(new Date(2024, 2, 15, 12))).toMatchObject({
      year: 2024,
      month: 3,
    });
    expect(formatTimelineMonthLabel(12)).toBe("12月");
    expect(formatTimelineMonthLabel(3)).toBe("3月");
    expect(timelineMonthKey(2024, 3)).toBe("2024-03");
  });

  it("rejects empty or invalid dates instead of inventing a month", () => {
    expect(parseTimelineDate("")).toBeNull();
    expect(parseTimelineDate(null)).toBeNull();
    expect(parseTimelineDate(undefined)).toBeNull();
    expect(parseTimelineDate("not-a-date")).toBeNull();
  });
});

describe("groupTimelineByYearAndMonth (#302)", () => {
  it("groups articles by year and month when they span multiple months", () => {
    const groups = groupTimelineByYearAndMonth(multiMonthArticles);
    expect(groups.map((year) => year.year)).toEqual([2024, 2023]);
    expect(groups[0].months.map((month) => month.month)).toEqual([12, 3]);
    expect(groups[0].months.map((month) => month.label)).toEqual([
      "12月",
      "3月",
    ]);
    expect(groups[0].months[0].articles.map((item) => item.title)).toEqual([
      "十二月下旬",
      "十二月上旬",
    ]);
    expect(groups[0].months[1].articles.map((item) => item.title)).toEqual([
      "三月",
    ]);
    expect(groups[1].months).toHaveLength(1);
    expect(groups[1].months[0]).toMatchObject({
      month: 8,
      label: "8月",
      key: "2023-08",
    });
  });

  it("does not invent phantom month groups for empty months", () => {
    const groups = groupTimelineByYearAndMonth(multiMonthArticles);
    const months2024 = groups[0].months.map((month) => month.month);
    expect(months2024).toEqual([12, 3]);
    expect(months2024).not.toContain(1);
    expect(months2024).not.toContain(2);
    expect(months2024).not.toContain(4);
    expect(months2024).not.toContain(11);
    expect(
      groups.flatMap((year) => year.months).every((month) => month.articles.length > 0)
    ).toBe(true);
  });

  it("keeps a year-only fallback when dates are missing instead of NaN months", () => {
    const groups = groupTimelineByYearAndMonth({
      "2022": [{ id: 9, title: "无日期", createdAt: "" } as any],
    });
    expect(groups).toHaveLength(1);
    expect(groups[0].year).toBe(2022);
    expect(groups[0].months).toEqual([]);
    expect(groups[0].articles.map((item) => item.title)).toEqual(["无日期"]);
  });

  it("returns no groups for empty or ungrouped input", () => {
    expect(groupTimelineByYearAndMonth({})).toEqual([]);
    expect(groupTimelineByYearAndMonth(undefined)).toEqual([]);
    expect(groupTimelineByYearAndMonth(null)).toEqual([]);
  });
});

describe("describeTimelineArchives outline used by the page", () => {
  it("exposes month sections and titles for multi-month years", () => {
    const outline = describeTimelineArchives(multiMonthArticles);
    expect(outline.years[0]).toMatchObject({
      year: 2024,
      label: "2024",
      count: 3,
      fallbackYearOnly: false,
    });
    expect(outline.years[0].months).toEqual([
      {
        month: 12,
        label: "12月",
        key: "2024-12",
        count: 2,
        titles: ["十二月下旬", "十二月上旬"],
      },
      {
        month: 3,
        label: "3月",
        key: "2024-03",
        count: 1,
        titles: ["三月"],
      },
    ]);
    expect(outline.years[1].months.map((month) => month.key)).toEqual([
      "2023-08",
    ]);
    const allMonthKeys = outline.years.flatMap((year) =>
      year.months.map((month) => month.key)
    );
    expect(allMonthKeys).not.toContain("2024-01");
    expect(allMonthKeys).not.toContain("2024-02");
    expect(allMonthKeys).not.toContain("2023-01");
  });
});

describe("timeline page wires year and month sections", () => {
  const page = readSrc("pages/timeline.tsx");
  const archives = readSrc("components/TimelineArchives/index.tsx");
  const pageProps = readSrc("utils/getPageProps.ts");
  const category = readSrc("pages/category.tsx");
  const tag = readSrc("pages/tag/[tag].tsx");

  it("builds yearGroups in page props and renders TimelineArchives", () => {
    expect(pageProps).toMatch(/groupTimelineByYearAndMonth\(sortedArticles\)/);
    expect(pageProps).toMatch(/yearGroups/);
    expect(page).toMatch(/TimelineArchives/);
    expect(page).toMatch(/yearGroups=\{props\.yearGroups\}/);
    expect(page).not.toMatch(/timeline-dateitem-/);
  });

  it("renders month sections from yearGroups and skips empty months", () => {
    expect(archives).toMatch(/data-timeline-year/);
    expect(archives).toMatch(/data-timeline-month=\{monthGroup\.key\}/);
    expect(archives).toMatch(/yearGroup\.months\.map/);
    expect(archives).toMatch(/monthGroup\.label/);
    expect(archives).toMatch(/compact=\{true\}/);
    expect(archives).toMatch(/yearGroup\.months\.length === 0/);
  });

  it("does not change category or tag year-only grouping", () => {
    expect(category).not.toMatch(/groupTimelineByYearAndMonth/);
    expect(category).not.toMatch(/TimelineArchives/);
    expect(tag).not.toMatch(/groupTimelineByYearAndMonth/);
    expect(tag).not.toMatch(/TimelineArchives/);
    expect(category).toMatch(/Object\.keys\(props\.sortedArticles\)/);
    expect(tag).toMatch(/Object\.keys\(props\.sortedArticles\)/);
  });
});
