export const GA_SCRIPT_HOST = "https://www.googletagmanager.com/gtag/js";

/** Next.js Script strategy: after window load + idle, never during SSR / first paint. */
export const GA_SCRIPT_STRATEGY = "lazyOnload" as const;

/** GA4 measurement ID (`G-…`) or legacy Universal Analytics (`UA-…`). */
export const GA_MEASUREMENT_ID_RE = /\b((?:G|UA)-[A-Z0-9-]+)\b/i;

export type GaScriptStrategy = typeof GA_SCRIPT_STRATEGY;

export type GaScriptInjection = {
  src: string;
  strategy: GaScriptStrategy;
  async: true;
  blocking: false;
  initSnippet: string;
};

/**
 * Trim a site-setting Analysis ID and, if the user pasted a gtag URL or
 * snippet, pull out the `G-` / `UA-` measurement ID. Whitespace-only is empty.
 */
export function normalizeGaAnalysisId(id?: string | null): string {
  if (typeof id !== "string") {
    return "";
  }
  const trimmed = id.trim();
  if (!trimmed) {
    return "";
  }
  const fromQuery = trimmed.match(/[?&]id=((?:G|UA)-[A-Z0-9-]+)/i);
  if (fromQuery) {
    return fromQuery[1];
  }
  const fromText = trimmed.match(GA_MEASUREMENT_ID_RE);
  if (fromText) {
    return fromText[1];
  }
  return trimmed;
}

export function shouldInjectGa(id?: string | null): boolean {
  return normalizeGaAnalysisId(id) !== "";
}

export function buildGaScriptSrc(id: string): string {
  return `${GA_SCRIPT_HOST}?id=${normalizeGaAnalysisId(id) || id}`;
}

export function buildGaInitSnippet(id: string): string {
  const jsonId = JSON.stringify(normalizeGaAnalysisId(id) || id);
  return `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${jsonId});
        `;
}

export function describeGaInjection(
  id?: string | null
): GaScriptInjection | null {
  const normalized = normalizeGaAnalysisId(id);
  if (!normalized) {
    return null;
  }
  return {
    src: buildGaScriptSrc(normalized),
    strategy: GA_SCRIPT_STRATEGY,
    async: true,
    blocking: false,
    initSnippet: buildGaInitSnippet(normalized),
  };
}

export function isGaInjectionNonBlocking(
  injection: { strategy?: string; async?: boolean; blocking?: boolean } | null
): boolean {
  if (!injection) {
    return true;
  }
  return (
    injection.blocking === false &&
    injection.async === true &&
    injection.strategy === GA_SCRIPT_STRATEGY
  );
}

export type GaLoadSchedulerEnv = {
  documentReadyState: DocumentReadyState;
  addWindowListener: (type: "load", listener: () => void) => void;
  removeWindowListener?: (type: "load", listener: () => void) => void;
  requestIdleCallback?: (
    cb: () => void,
    opts?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (id: number) => void;
  setTimeout: (cb: () => void, ms?: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
};

/**
 * Start the gtag network request only after the document has loaded and the
 * browser is idle. Matches next/script `lazyOnload`. Never called during SSR.
 */
export function scheduleGaScriptLoad(
  load: () => void,
  env: GaLoadSchedulerEnv
): () => void {
  let cancelled = false;
  let idleHandle: number | undefined;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  let loadListener: (() => void) | undefined;

  const runWhenIdle = () => {
    if (cancelled) {
      return;
    }
    if (typeof env.requestIdleCallback === "function") {
      idleHandle = env.requestIdleCallback(
        () => {
          if (!cancelled) {
            load();
          }
        },
        { timeout: 4000 }
      );
    } else {
      timeoutHandle = env.setTimeout(() => {
        if (!cancelled) {
          load();
        }
      }, 1);
    }
  };

  if (env.documentReadyState === "complete") {
    runWhenIdle();
  } else {
    loadListener = runWhenIdle;
    env.addWindowListener("load", loadListener);
  }

  return () => {
    cancelled = true;
    if (loadListener && env.removeWindowListener) {
      env.removeWindowListener("load", loadListener);
    }
    if (idleHandle != null && env.cancelIdleCallback) {
      env.cancelIdleCallback(idleHandle);
    }
    if (timeoutHandle != null) {
      env.clearTimeout(timeoutHandle);
    }
  };
}

/**
 * Critical render (first paint + hydration) always runs to completion without
 * awaiting the gtag fetch. The fetch is scheduled with {@link scheduleGaScriptLoad}.
 */
export function runPaintAndHydrateThenScheduleGa(options: {
  injection: GaScriptInjection | null;
  paint: () => void;
  hydrate: () => void;
  loadGa: () => void | Promise<void>;
  env: GaLoadSchedulerEnv;
}): () => void {
  options.paint();
  options.hydrate();
  if (!options.injection || !isGaInjectionNonBlocking(options.injection)) {
    return () => {};
  }
  return scheduleGaScriptLoad(() => {
    try {
      const result = options.loadGa();
      if (result && typeof (result as Promise<void>).catch === "function") {
        (result as Promise<void>).catch(() => {});
      }
    } catch {
      // A timed-out or unreachable GTM host must not throw into render.
    }
  }, options.env);
}
