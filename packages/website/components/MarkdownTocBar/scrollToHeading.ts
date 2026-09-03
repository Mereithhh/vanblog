import { requestRemainingMarkdown } from "../../utils/lazyMarkdown";
import { scrollTo } from "../../utils/scroll";
import { getEl, NavItem } from "./tools";

export type HeadingLookup = (
  item: NavItem,
  all: NavItem[]
) => HTMLElement | undefined;

export function headingScrollTop(el: HTMLElement, headingOffset: number) {
  let to = el.offsetTop - headingOffset;
  if (to <= 100) {
    to = 0;
  }
  return to;
}

function observeMutations(cb: () => void): () => void {
  if (
    typeof MutationObserver === "undefined" ||
    typeof document === "undefined" ||
    !document.body
  ) {
    return () => {};
  }
  const obs = new MutationObserver(cb);
  obs.observe(document.body, { childList: true, subtree: true });
  return () => obs.disconnect();
}

function waitFrame() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 16);
    }
  });
}

export function waitForNavEl(
  item: NavItem,
  all: NavItem[],
  options?: {
    timeoutMs?: number;
    getElement?: HeadingLookup;
    observe?: (cb: () => void) => () => void;
    requestRemaining?: () => void;
  }
): Promise<HTMLElement | undefined> {
  const getElement = options?.getElement ?? getEl;
  const requestRemaining = options?.requestRemaining ?? requestRemainingMarkdown;
  const timeoutMs = options?.timeoutMs ?? 4000;

  const first = getElement(item, all);
  if (first) return Promise.resolve(first);

  return new Promise((resolve) => {
    const observe = options?.observe ?? observeMutations;
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stop = () => {};
    const finish = (el: HTMLElement | undefined) => {
      if (settled) return;
      settled = true;
      stop();
      if (timer) clearTimeout(timer);
      resolve(el);
    };
    stop = observe(() => {
      const el = getElement(item, all);
      if (el) finish(el);
    });
    requestRemaining();
    const afterRequest = getElement(item, all);
    if (afterRequest) {
      finish(afterRequest);
      return;
    }
    timer = setTimeout(() => finish(getElement(item, all)), timeoutMs);
  });
}

export async function scrollToNavHeading(
  item: NavItem,
  all: NavItem[],
  headingOffset: number,
  options?: {
    timeoutMs?: number;
    getElement?: HeadingLookup;
    observe?: (cb: () => void) => () => void;
    requestRemaining?: () => void;
    settleMs?: number;
  }
) {
  const el = await waitForNavEl(item, all, options);
  if (!el) return;

  const jump = (duration: number) =>
    scrollTo(window, {
      top: headingScrollTop(el, headingOffset),
      easing: duration ? "ease-in-out" : "linear",
      duration,
    });

  await jump(800);

  const settleMs = options?.settleMs ?? 1500;
  const start = Date.now();
  let lastTop = el.offsetTop;
  let stableTicks = 0;
  while (Date.now() - start < settleMs) {
    await waitFrame();
    const nextTop = el.offsetTop;
    const target = headingScrollTop(el, headingOffset);
    const current =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (Math.abs(nextTop - lastTop) < 2 && Math.abs(current - target) < 8) {
      stableTicks += 1;
      if (stableTicks >= 2) break;
    } else {
      stableTicks = 0;
      lastTop = nextTop;
      await jump(0);
    }
  }
}
