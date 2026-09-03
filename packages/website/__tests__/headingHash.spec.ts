import { describe, it, expect } from "vitest";
import {
  decodeHeadingHash,
  encodeHeadingHash,
  findNavItemByHash,
  headingHashHref,
  headingHashMatches,
} from "../utils/headingHash";

const COMMENT_SYSTEM = "评论系统";
const COMMENT_SYSTEM_ENCODED = "%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F";

describe("encodeHeadingHash / decodeHeadingHash", () => {
  it("encodes Chinese heading text to the reporter fragment", () => {
    expect(encodeHeadingHash(COMMENT_SYSTEM)).toBe(COMMENT_SYSTEM_ENCODED);
    expect(headingHashHref(COMMENT_SYSTEM)).toBe(`#${COMMENT_SYSTEM_ENCODED}`);
  });

  it("round-trips Chinese heading text", () => {
    expect(decodeHeadingHash(encodeHeadingHash(COMMENT_SYSTEM))).toBe(
      COMMENT_SYSTEM
    );
    expect(decodeHeadingHash(`#${COMMENT_SYSTEM_ENCODED}`)).toBe(COMMENT_SYSTEM);
    expect(decodeHeadingHash(COMMENT_SYSTEM_ENCODED)).toBe(COMMENT_SYSTEM);
  });

  it("encodes spaces in My Title", () => {
    expect(encodeHeadingHash("My Title")).toBe("My%20Title");
    expect(decodeHeadingHash("My%20Title")).toBe("My Title");
    expect(decodeHeadingHash(encodeHeadingHash("My Title"))).toBe("My Title");
    expect(headingHashHref("My Title")).toBe("#My%20Title");
  });

  it("trims heading text before encoding", () => {
    expect(encodeHeadingHash("My Title ")).toBe("My%20Title");
    expect(decodeHeadingHash("My%20Title")).toBe("My Title");
  });

  it("keeps a raw decoded hash usable when percent-decoding fails", () => {
    expect(decodeHeadingHash("%E0%A4%A")).toBe("%E0%A4%A");
  });

  it("still matches a double-encoded Chinese fragment", () => {
    const doubleEncoded = encodeURIComponent(COMMENT_SYSTEM_ENCODED);
    expect(decodeHeadingHash(doubleEncoded)).toBe(COMMENT_SYSTEM);
    expect(headingHashMatches(COMMENT_SYSTEM, doubleEncoded)).toBe(true);
  });
});

describe("headingHashMatches", () => {
  it("matches NavItem.text against encoded, decoded, and raw hashes", () => {
    expect(headingHashMatches(COMMENT_SYSTEM, COMMENT_SYSTEM_ENCODED)).toBe(
      true
    );
    expect(headingHashMatches(COMMENT_SYSTEM, `#${COMMENT_SYSTEM_ENCODED}`)).toBe(
      true
    );
    expect(headingHashMatches(COMMENT_SYSTEM, COMMENT_SYSTEM)).toBe(true);
    expect(headingHashMatches("My Title", "My%20Title")).toBe(true);
    expect(headingHashMatches("My Title", "My Title")).toBe(true);
    expect(headingHashMatches("My Title", "Other")).toBe(false);
  });

  it("finds a nav item by encoded or raw hash", () => {
    const items = [
      { index: 0, text: "Intro" },
      { index: 1, text: COMMENT_SYSTEM },
      { index: 2, text: "My Title" },
    ];
    expect(findNavItemByHash(items, COMMENT_SYSTEM_ENCODED)?.text).toBe(
      COMMENT_SYSTEM
    );
    expect(findNavItemByHash(items, "My%20Title")?.text).toBe("My Title");
    expect(findNavItemByHash(items, "My Title")?.text).toBe("My Title");
  });
});
