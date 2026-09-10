import { readFileSync } from "fs";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GA_SCRIPT_HOST,
  GA_SCRIPT_STRATEGY,
  GaLoadSchedulerEnv,
  buildGaInitSnippet,
  buildGaScriptSrc,
  describeGaInjection,
  isGaInjectionNonBlocking,
  normalizeGaAnalysisId,
  runPaintAndHydrateThenScheduleGa,
  scheduleGaScriptLoad,
  shouldInjectGa,
} from "../components/gaAnalysis/load";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const GA_ID = "G-TEST375ID";

type FakeIdleTask = { id: number; cb: () => void };
type FakeTimeout = { id: number; cb: () => void };

const createFakeLoadEnv = (
  readyState: DocumentReadyState = "loading"
): GaLoadSchedulerEnv & {
  fireLoad: () => void;
  flushIdle: () => void;
  flushTimeouts: () => void;
} => {
  const loadListeners: Array<() => void> = [];
  const idleTasks: FakeIdleTask[] = [];
  const timeouts: FakeTimeout[] = [];
  let nextId = 1;
  let currentReadyState = readyState;

  const env: GaLoadSchedulerEnv & {
    fireLoad: () => void;
    flushIdle: () => void;
    flushTimeouts: () => void;
  } = {
    get documentReadyState() {
      return currentReadyState;
    },
    addWindowListener: (_type, listener) => {
      loadListeners.push(listener);
    },
    removeWindowListener: (_type, listener) => {
      const index = loadListeners.indexOf(listener);
      if (index >= 0) {
        loadListeners.splice(index, 1);
      }
    },
    requestIdleCallback: (cb) => {
      const id = nextId++;
      idleTasks.push({ id, cb });
      return id;
    },
    cancelIdleCallback: (id) => {
      const index = idleTasks.findIndex((task) => task.id === id);
      if (index >= 0) {
        idleTasks.splice(index, 1);
      }
    },
    setTimeout: (cb) => {
      const id = nextId++;
      timeouts.push({ id, cb });
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout: (id) => {
      const index = timeouts.findIndex((task) => task.id === (id as number));
      if (index >= 0) {
        timeouts.splice(index, 1);
      }
    },
    fireLoad: () => {
      currentReadyState = "complete";
      [...loadListeners].forEach((listener) => listener());
    },
    flushIdle: () => {
      const pending = idleTasks.splice(0, idleTasks.length);
      pending.forEach((task) => task.cb());
    },
    flushTimeouts: () => {
      const pending = timeouts.splice(0, timeouts.length);
      pending.forEach((task) => task.cb());
    },
  };
  return env;
};

describe("normalizeGaAnalysisId / shouldInjectGa / describeGaInjection", () => {
  it("does not inject when Analysis ID is missing, empty, or whitespace", () => {
    expect(normalizeGaAnalysisId("")).toBe("");
    expect(normalizeGaAnalysisId("   ")).toBe("");
    expect(normalizeGaAnalysisId(undefined)).toBe("");
    expect(normalizeGaAnalysisId(null)).toBe("");
    expect(shouldInjectGa("")).toBe(false);
    expect(shouldInjectGa("   ")).toBe(false);
    expect(shouldInjectGa(undefined)).toBe(false);
    expect(shouldInjectGa(null)).toBe(false);
    expect(describeGaInjection("")).toBeNull();
    expect(describeGaInjection(" \t\n ")).toBeNull();
    expect(describeGaInjection(undefined)).toBeNull();
    expect(isGaInjectionNonBlocking(null)).toBe(true);
  });

  it("accepts GA4 G- measurement IDs and legacy UA- tracking IDs", () => {
    expect(normalizeGaAnalysisId("G-XXXXXXXXX")).toBe("G-XXXXXXXXX");
    expect(normalizeGaAnalysisId("G-ABC12DEF34")).toBe("G-ABC12DEF34");
    expect(normalizeGaAnalysisId("UA-123456-1")).toBe("UA-123456-1");
    expect(shouldInjectGa("G-XXXXXXXXX")).toBe(true);
    expect(shouldInjectGa("UA-123456-1")).toBe(true);
    expect(describeGaInjection("G-XXXXXXXXX")!.src).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"
    );
    expect(describeGaInjection("UA-123456-1")!.initSnippet).toContain(
      `gtag('config', ${JSON.stringify("UA-123456-1")})`
    );
  });

  it("trims pasted IDs and extracts G-/UA- from a gtag URL or snippet", () => {
    expect(normalizeGaAnalysisId("  G-TEST375ID  ")).toBe("G-TEST375ID");
    expect(
      normalizeGaAnalysisId(
        "https://www.googletagmanager.com/gtag/js?id=G-TEST375ID"
      )
    ).toBe("G-TEST375ID");
    expect(
      normalizeGaAnalysisId(
        `<!-- Global site tag -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST375ID"></script>`
      )
    ).toBe("G-TEST375ID");
    const injection = describeGaInjection("  G-TEST375ID  ");
    expect(injection!.src).toBe(buildGaScriptSrc("G-TEST375ID"));
    expect(injection!.initSnippet).toContain(
      `gtag('config', ${JSON.stringify("G-TEST375ID")})`
    );
  });

  it("describes an async, lazyOnload gtag script when Analysis ID is set", () => {
    const injection = describeGaInjection(GA_ID);
    expect(injection).not.toBeNull();
    expect(injection!.src).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    );
    expect(injection!.src).toBe(buildGaScriptSrc(GA_ID));
    expect(injection!.src.startsWith(GA_SCRIPT_HOST)).toBe(true);
    expect(injection!.strategy).toBe("lazyOnload");
    expect(injection!.strategy).toBe(GA_SCRIPT_STRATEGY);
    expect(injection!.async).toBe(true);
    expect(injection!.blocking).toBe(false);
    expect(isGaInjectionNonBlocking(injection)).toBe(true);
    expect(injection!.initSnippet).toContain(`gtag('config', ${JSON.stringify(GA_ID)})`);
    expect(injection!.initSnippet).toBe(buildGaInitSnippet(GA_ID));
  });

  it("treats a parser-blocking / afterInteractive gtag tag as render-blocking", () => {
    expect(
      isGaInjectionNonBlocking({
        strategy: "afterInteractive",
        async: true,
        blocking: false,
      })
    ).toBe(false);
    expect(
      isGaInjectionNonBlocking({
        strategy: "beforeInteractive",
        async: false,
        blocking: true,
      })
    ).toBe(false);
    expect(
      isGaInjectionNonBlocking({
        strategy: "lazyOnload",
        async: false,
        blocking: false,
      })
    ).toBe(false);
  });
});

describe("scheduleGaScriptLoad", () => {
  it("does not start gtag until after window load and idle", () => {
    const env = createFakeLoadEnv("loading");
    let started = 0;
    const cancel = scheduleGaScriptLoad(() => {
      started += 1;
    }, env);

    expect(started).toBe(0);
    env.flushIdle();
    expect(started).toBe(0);

    env.fireLoad();
    expect(started).toBe(0);

    env.flushIdle();
    expect(started).toBe(1);
    cancel();
  });

  it("falls back to setTimeout when requestIdleCallback is missing", () => {
    const env = createFakeLoadEnv("complete");
    delete (env as { requestIdleCallback?: unknown }).requestIdleCallback;
    let started = 0;
    scheduleGaScriptLoad(() => {
      started += 1;
    }, env);

    expect(started).toBe(0);
    env.flushTimeouts();
    expect(started).toBe(1);
  });

  it("cancel prevents a later idle callback from injecting gtag", () => {
    const env = createFakeLoadEnv("loading");
    let started = 0;
    const cancel = scheduleGaScriptLoad(() => {
      started += 1;
    }, env);
    cancel();
    env.fireLoad();
    env.flushIdle();
    expect(started).toBe(0);
  });
});

describe("failed or slow GA must not block critical render", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not schedule gtag when Analysis ID is empty", () => {
    const order: string[] = [];
    const env = createFakeLoadEnv("loading");
    runPaintAndHydrateThenScheduleGa({
      injection: describeGaInjection(""),
      paint: () => {
        order.push("paint");
      },
      hydrate: () => {
        order.push("hydrate");
      },
      loadGa: () => {
        order.push("ga");
      },
      env,
    });
    env.fireLoad();
    env.flushIdle();
    expect(order).toEqual(["paint", "hydrate"]);
  });

  it("first paint and hydration finish while a hung gtag.js fetch is still pending", () => {
    const order: string[] = [];
    const env = createFakeLoadEnv("loading");
    const injection = describeGaInjection(GA_ID);

    const hungGa = () =>
      new Promise<void>(() => {
        order.push("ga-start");
      });

    const cancel = runPaintAndHydrateThenScheduleGa({
      injection,
      paint: () => {
        order.push("paint");
      },
      hydrate: () => {
        order.push("hydrate");
      },
      loadGa: hungGa,
      env,
    });

    expect(order).toEqual(["paint", "hydrate"]);
    expect(order).not.toContain("ga-start");

    env.fireLoad();
    expect(order).toEqual(["paint", "hydrate"]);

    env.flushIdle();
    expect(order).toEqual(["paint", "hydrate", "ga-start"]);
    cancel();
  });

  it("a timed-out gtag load rejects without undoing paint or hydration", async () => {
    vi.useFakeTimers();
    const order: string[] = [];
    const env = createFakeLoadEnv("complete");

    const slowGa = () =>
      new Promise<void>((_resolve, reject) => {
        order.push("ga-start");
        setTimeout(() => {
          order.push("ga-timeout");
          reject(new Error("net::ERR_CONNECTION_TIMED_OUT"));
        }, 30);
      });

    runPaintAndHydrateThenScheduleGa({
      injection: describeGaInjection(GA_ID),
      paint: () => {
        order.push("paint");
      },
      hydrate: () => {
        order.push("hydrate");
      },
      loadGa: slowGa,
      env,
    });

    expect(order).toEqual(["paint", "hydrate"]);
    env.flushIdle();
    expect(order).toEqual(["paint", "hydrate", "ga-start"]);

    vi.advanceTimersByTime(30);
    await Promise.resolve();
    expect(order).toEqual(["paint", "hydrate", "ga-start", "ga-timeout"]);
    expect(order[0]).toBe("paint");
    expect(order[1]).toBe("hydrate");
  });

  it("control: awaiting gtag before paint is the blocking path we do not use", async () => {
    const order: string[] = [];
    await new Promise<void>((resolve) => {
      const ga = new Promise<void>((done) => {
        order.push("ga");
        done();
      });
      ga.then(() => {
        order.push("paint");
        resolve();
      });
    });
    expect(order).toEqual(["ga", "paint"]);
    expect(isGaInjectionNonBlocking(describeGaInjection(GA_ID))).toBe(true);
  });
});

describe("GaAnalysis component wiring", () => {
  const source = readSrc("components/gaAnalysis/index.tsx");
  const layout = readSrc("components/Layout/index.tsx");

  it("injects next/script from describeGaInjection with async and lazyOnload", () => {
    expect(source).toMatch(/from ["']\.\/load["']/);
    expect(source).toMatch(/describeGaInjection\(props\.id\)/);
    expect(source).toMatch(/strategy=\{injection\.strategy\}/);
    expect(source).toMatch(/src=\{injection\.src\}/);
    expect(source).toMatch(/async=\{injection\.async\}/);
    expect(source).not.toMatch(/strategy=["']afterInteractive["']/);
    expect(source).not.toMatch(/strategy=["']beforeInteractive["']/);
    expect(source).not.toMatch(/<script\s+src=\{?[`'"]https:\/\/www\.googletagmanager\.com/);
  });

  it("keeps Layout on the existing Analysis ID config path", () => {
    expect(layout).toMatch(/import GaAnalysis from ["']\.\.\/gaAnalysis["']/);
    expect(layout).toMatch(/props\.option\.gaAnalysisID != ""/);
    expect(layout).toMatch(
      /<GaAnalysis id=\{props\.option\.gaAnalysisID\}/
    );
  });

  it("normalizes the site-setting Analysis ID before Layout sees it", () => {
    const propsSrc = readSrc("utils/getLayoutProps.ts");
    expect(propsSrc).toMatch(/normalizeGaAnalysisId/);
    expect(propsSrc).toMatch(
      /gaAnalysisID:\s*normalizeGaAnalysisId\(siteInfo\.gaAnalysisId\)/
    );
  });
});
