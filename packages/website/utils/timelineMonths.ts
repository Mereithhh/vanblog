import { Article } from "../types/article";

export type TimelineArticleLike = Pick<Article, "title" | "id" | "createdAt"> &
  Partial<Article>;

export interface TimelineMonthGroup<T extends TimelineArticleLike = Article> {
  year: number;
  month: number;
  label: string;
  key: string;
  articles: T[];
}

export interface TimelineYearGroup<T extends TimelineArticleLike = Article> {
  year: number;
  label: string;
  articles: T[];
  months: TimelineMonthGroup<T>[];
}

export interface TimelineArchiveMonthOutline {
  month: number;
  label: string;
  key: string;
  count: number;
  titles: string[];
}

export interface TimelineArchiveYearOutline {
  year: number;
  label: string;
  count: number;
  fallbackYearOnly: boolean;
  months: TimelineArchiveMonthOutline[];
}

export interface TimelineArchiveOutline {
  years: TimelineArchiveYearOutline[];
}

const MONTH_LABEL_SUFFIX = "月";

export function padTimelineMonth(month: number): string {
  return String(month).padStart(2, "0");
}

export function formatTimelineMonthLabel(month: number): string {
  return `${month}${MONTH_LABEL_SUFFIX}`;
}

export function timelineMonthKey(year: number, month: number): string {
  return `${year}-${padTimelineMonth(month)}`;
}

export function parseTimelineDate(
  createdAt: unknown
): { year: number; month: number } | null {
  if (createdAt == null || createdAt === "") {
    return null;
  }
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (!Number.isFinite(year) || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

function sortByCreatedAtDesc<T extends TimelineArticleLike>(articles: T[]): T[] {
  return [...articles].sort((prev, next) => {
    const prevTime = new Date(prev.createdAt).getTime();
    const nextTime = new Date(next.createdAt).getTime();
    const safePrev = Number.isNaN(prevTime) ? 0 : prevTime;
    const safeNext = Number.isNaN(nextTime) ? 0 : nextTime;
    return safeNext - safePrev;
  });
}

function yearKeysFromSortedArticles(
  sortedArticles: Record<string, TimelineArticleLike[]> | null | undefined
): number[] {
  if (!sortedArticles) {
    return [];
  }
  return Object.keys(sortedArticles)
    .map((key) => parseInt(key, 10))
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);
}

/**
 * Group year-bucketed timeline articles into months that actually contain posts.
 * Empty months are omitted. Years with articles but no valid dates stay year-only.
 */
export function groupTimelineByYearAndMonth<T extends TimelineArticleLike>(
  sortedArticles: Record<string, T[]> | null | undefined
): TimelineYearGroup<T>[] {
  return yearKeysFromSortedArticles(sortedArticles)
    .map((year) => {
      const articles = sortByCreatedAtDesc(sortedArticles?.[String(year)] || []);
      const monthMap = new Map<number, T[]>();
      for (const article of articles) {
        const parts = parseTimelineDate(article.createdAt);
        if (!parts) {
          continue;
        }
        const list = monthMap.get(parts.month) || [];
        list.push(article);
        monthMap.set(parts.month, list);
      }
      const months = Array.from(monthMap.entries())
        .sort(([a], [b]) => b - a)
        .map(([month, monthArticles]) => ({
          year,
          month,
          label: formatTimelineMonthLabel(month),
          key: timelineMonthKey(year, month),
          articles: sortByCreatedAtDesc(monthArticles),
        }));
      return {
        year,
        label: String(year),
        articles,
        months,
      };
    })
    .filter((group) => group.articles.length > 0);
}

export function describeTimelineArchives(
  sortedArticles: Record<string, TimelineArticleLike[]> | null | undefined
): TimelineArchiveOutline {
  const groups = groupTimelineByYearAndMonth(sortedArticles);
  return {
    years: groups.map((yearGroup) => ({
      year: yearGroup.year,
      label: yearGroup.label,
      count: yearGroup.articles.length,
      fallbackYearOnly: yearGroup.months.length === 0,
      months: yearGroup.months.map((monthGroup) => ({
        month: monthGroup.month,
        label: monthGroup.label,
        key: monthGroup.key,
        count: monthGroup.articles.length,
        titles: monthGroup.articles.map((article) => article.title),
      })),
    })),
  };
}
