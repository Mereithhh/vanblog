import { describe, expect, it } from "vitest";
import { formatTimeAgo as adminFormatTimeAgo } from "../../admin/src/services/van-blog/relativeTime.js";
import {
  daysAgo,
  formatTimeAgo,
  parseInstantMs,
  secondsAgo,
} from "../utils/relativeTime";

const NOW = Date.parse("2024-06-15T10:00:45.000Z");
const PAST_ISO = "2024-06-15T10:00:00.000Z";

function legacyMomentStyleAgo(timestr: string, nowMs: number): string {
  const then = new Date(timestr).getTime();
  const c = Math.floor((nowMs - then) / 1000);
  if (c <= 60) {
    return c + "秒前";
  }
  if (c <= 60 * 60) {
    return Math.floor(c / 60) + "分钟前";
  }
  return Math.floor(c / 60 / 60) + "小时前";
}

describe("formatTimeAgo (#369)", () => {
  it("formats a past UTC instant as seconds ago", () => {
    expect(formatTimeAgo(PAST_ISO, NOW)).toBe("45秒前");
    expect(adminFormatTimeAgo(PAST_ISO, NOW)).toBe("45秒前");
  });

  it("a past timestamp viewed as if in a TZ ahead of the stored time does not yield a negative ago string", () => {
    const storedMs = Date.parse(PAST_ISO);
    const aheadOffsetMs = 14 * 60 * 60 * 1000;
    const aheadWallClock = new Date(storedMs + aheadOffsetMs)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    expect(aheadWallClock).toBe("2024-06-16 00:00:00");

    const fromIso = formatTimeAgo(PAST_ISO, NOW);
    expect(fromIso).toBe("45秒前");
    expect(fromIso).not.toMatch(/^-/);
    expect(adminFormatTimeAgo(PAST_ISO, NOW)).not.toMatch(/^-/);

    const mixed = formatTimeAgo(aheadWallClock, NOW);
    expect(mixed).not.toMatch(/-/);
    expect(mixed).toBe("刚刚");
    expect(adminFormatTimeAgo(aheadWallClock, NOW)).toBe("刚刚");
  });

  it("does not render the dashboard -113秒前 case for a just-recorded visit", () => {
    const visitedAt = "2024-06-15T10:02:38.000Z";
    const ownerNow = Date.parse("2024-06-15T10:00:45.000Z");
    expect(legacyMomentStyleAgo(visitedAt, ownerNow)).toBe("-113秒前");
    expect(formatTimeAgo(visitedAt, ownerNow)).toBe("刚刚");
    expect(adminFormatTimeAgo(visitedAt, ownerNow)).toBe("刚刚");
  });

  it("keeps owner and visitor offsets on sensible relative strings", () => {
    expect(formatTimeAgo(PAST_ISO, NOW)).toBe("45秒前");
    expect(formatTimeAgo("2024-06-15T09:00:45.000Z", NOW)).toBe("1小时前");
    expect(formatTimeAgo("2024-06-14T10:00:45.000Z", NOW)).toBe("1天前");
    expect(formatTimeAgo("2024-06-15T17:50:45.000+08:00", NOW)).toBe("10分钟前");
  });

  it("treats naive datetimes as UTC instants instead of the visitor local zone", () => {
    expect(parseInstantMs("2024-06-15 10:00:00")).toBe(
      Date.parse("2024-06-15T10:00:00.000Z"),
    );
    expect(formatTimeAgo("2024-06-15T10:00:00", NOW)).toBe("45秒前");
    expect(formatTimeAgo("2024-06-15 09:59:45", NOW)).toBe("1分钟前");
  });

  it("returns placeholders for missing values", () => {
    expect(formatTimeAgo("", NOW)).toBe("-");
    expect(formatTimeAgo(null, NOW)).toBe("-");
    expect(formatTimeAgo("not-a-date", NOW)).toBe("-");
  });
});

describe("daysAgo (#369)", () => {
  it("does not go negative when createdAt appears later in a TZ ahead of the stored instant", () => {
    const created = "2024-05-01T00:00:00.000Z";
    const now = Date.parse("2024-05-01T00:00:10.000Z");
    expect(daysAgo(created, now)).toBe(0);
    expect(daysAgo("2024-05-01 14:00:00", now)).toBe(0);
  });

  it("counts whole UTC days for a clearly past article", () => {
    expect(daysAgo("2024-05-01T10:00:45.000Z", NOW)).toBe(45);
  });
});

describe("secondsAgo", () => {
  it("clamps a future instant to zero", () => {
    expect(secondsAgo("2024-06-15T12:00:00.000Z", NOW)).toBe(0);
  });
});
