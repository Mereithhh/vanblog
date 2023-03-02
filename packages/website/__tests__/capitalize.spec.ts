import { describe, it, expect } from "vitest";
import { capitalize } from "../utils/capitalize";

describe("capitalize", () => {
  it("Should capitalize content", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("Should not throw", () => {
    expect(capitalize("")).toBe("");
  });
});
