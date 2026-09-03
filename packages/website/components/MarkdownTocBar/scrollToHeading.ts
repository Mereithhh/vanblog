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

function waitFrame() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 16);
    }
  });
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

function currentScrollY() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }
  return (
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

export function imagesBeforeHeading(el: HTMLElement): HTMLImageElement[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll("img")).filter((img) => {
    const pos = img.compareDocumentPosition(el);
    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });
}

/** Start layout-critical images without turning off lazy-load for the rest of the page. */
export function startLoadingImages(images: HTMLImageElement[]) {
  for (const img of images) {
    if (img.loading === "lazy") {
      img.loading = "eager";
    }
  }
}

export function waitForImagesToSettle(
  images: HTMLImageElement[],
  timeoutMs = 4000
): Promise<void> {
  const pending = images.filter((img) => !img.complete);
  if (!pending.length) return Promise.resolve();
  return new Promise((resolve) => {
    let left = pending.length;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, timeoutMs);
    pending.forEach((img) => {
      const onDone = () => {
        left -= 1;
        if (left <= 0) finish();
      };
      img.addEventListener("load", onDone, { once: true });
      img.addEventListener("error", onDone, { once: true });
    });
  });
}

export async function scrollElUntilSettled(
  el: HTMLElement,
  headingOffset: number,
  options?: {
    initialDuration?: number;
    settleMs?: number;
    jump?: (top: number, duration: number) => Promise<unknown>;
    waitFrame?: () => Promise<void>;
    now?: () => number;
    getScrollY?: () => number;
  }
) {
  const jump =
    options?.jump ??
    ((top, duration) =>
      scrollTo(window, {
        top,
        easing: duration ? "ease-in-out" : "linear",
        duration,
      }));
  const wait = options?.waitFrame ?? waitFrame;
  const now = options?.now ?? Date.now;
  const getScrollY = options?.getScrollY ?? currentScrollY;
  const initialDuration = options?.initialDuration ?? 0;

  if (initialDuration > 0) {
    await jump(headingScrollTop(el, headingOffset), initialDuration);
  }

  const settleMs = options?.settleMs ?? 2500;
  const start = now();
  let lastTop = el.offsetTop;
  let stableTicks = 0;
  while (now() - start < settleMs) {
    await wait();
    const nextTop = el.offsetTop;
    const target = headingScrollTop(el, headingOffset);
    if (
      Math.abs(nextTop - lastTop) < 2 &&
      Math.abs(getScrollY() - target) < 8
    ) {
      stableTicks += 1;
      if (stableTicks >= 2) break;
    } else {
      stableTicks = 0;
      lastTop = nextTop;
      await jump(target, 0);
    }
  }
}

export function waitForNavEl(
  item: NavItem,
  all: NavItem[],
  options?: {
    timeoutMs?: number;
    getElement?: HeadingLookup;
    observe?: (cb: () => void) => () => void;
  }
): Promise<HTMLElement | undefined> {
  const getElement = options?.getElement ?? getEl;
  const timeoutMs = options?.timeoutMs ?? 2000;
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
    const afterObserve = getElement(item, all);
    if (afterObserve) {
      finish(afterObserve);
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
    settleMs?: number;
  }
) {
  const el = await waitForNavEl(item, all, options);
  if (!el) return;

  const images = imagesBeforeHeading(el);
  startLoadingImages(images);
  const waiting = waitForImagesToSettle(images, options?.timeoutMs ?? 4000);
  await scrollElUntilSettled(el, headingOffset, {
    initialDuration: 800,
    settleMs: 80,
  });
  await waiting;
  await scrollElUntilSettled(el, headingOffset, {
    initialDuration: 0,
    settleMs: options?.settleMs ?? 2500,
  });
}
