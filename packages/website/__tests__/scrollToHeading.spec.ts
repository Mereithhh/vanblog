import { describe, it, expect } from "vitest";
import { waitForNavEl } from "../components/MarkdownTocBar/scrollToHeading";
import { NavItem } from "../components/MarkdownTocBar/tools";

const item: NavItem = {
  index: 3,
  level: 2,
  listNo: "4",
  text: "4. 配置DHCP引导选项",
};

describe("waitForNavEl", () => {
  it("returns immediately when the heading is already in the DOM", async () => {
    const el = { id: "present" } as HTMLElement;
    const remaining: string[] = [];
    const result = await waitForNavEl(item, [item], {
      getElement: () => el,
      requestRemaining: () => remaining.push("load"),
      observe: () => () => {},
    });
    expect(remaining).toEqual([]);
    expect(result).toBe(el);
  });

  it("loads remaining content and resolves when a missing heading appears", async () => {
    let el: HTMLElement | undefined;
    const fakeEl = { id: "lazy" } as HTMLElement;
    const observers: Array<() => void> = [];
    const pending = waitForNavEl(item, [item], {
      getElement: () => el,
      observe: (cb) => {
        observers.push(cb);
        return () => {};
      },
      requestRemaining: () => {
        queueMicrotask(() => {
          el = fakeEl;
          observers.forEach((cb) => cb());
        });
      },
      timeoutMs: 1000,
    });
    await expect(pending).resolves.toBe(fakeEl);
  });

  it("resolves undefined when the heading never appears", async () => {
    const result = await waitForNavEl(item, [item], {
      getElement: () => undefined,
      observe: () => () => {},
      requestRemaining: () => {},
      timeoutMs: 20,
    });
    expect(result).toBeUndefined();
  });
});
