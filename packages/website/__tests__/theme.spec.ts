import { readFileSync } from "fs";
import path from "path";
import vm from "vm";
import { describe, expect, it } from "vitest";
import {
  THEME_INIT_SCRIPT,
  applyThemeClass,
  getAutoTheme,
  readStoredTheme,
  resolvePaintTheme,
} from "../utils/theme";

const runThemeInitScript = (options: {
  storedTheme?: string | null;
  prefers?: "dark" | "light" | "no-preference";
  hour?: number;
  initialClasses?: string[];
}) => {
  const classes = new Set(options.initialClasses ?? []);
  const storage: Record<string, string> = {};
  if (options.storedTheme != null) {
    storage.theme = options.storedTheme;
  }
  const prefers = options.prefers ?? "no-preference";
  const context = {
    localStorage: {
      getItem: (key: string) => (key in storage ? storage[key] : null),
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
    },
    document: {
      documentElement: {
        classList: {
          add: (value: string) => {
            classes.add(value);
          },
          remove: (value: string) => {
            classes.delete(value);
          },
        },
      },
    },
    window: {
      matchMedia: (query: string) => ({
        matches:
          (prefers === "dark" &&
            query.includes("prefers-color-scheme: dark")) ||
          (prefers === "light" &&
            query.includes("prefers-color-scheme: light")),
      }),
    },
    Date: class {
      getHours() {
        return options.hour ?? 12;
      }
    },
  };
  vm.runInNewContext(THEME_INIT_SCRIPT, context);
  return { classes, storage };
};

describe("readStoredTheme", () => {
  it("returns auto when storage is missing or unset", () => {
    expect(readStoredTheme(undefined)).toBe("auto");
    expect(readStoredTheme({ getItem: () => null })).toBe("auto");
  });

  it("returns an explicit light or dark choice", () => {
    expect(readStoredTheme({ getItem: () => "light" })).toBe("light");
    expect(readStoredTheme({ getItem: () => "dark" })).toBe("dark");
  });
});

describe("getAutoTheme", () => {
  it("follows a light OS scheme even at night", () => {
    expect(getAutoTheme("light", 22)).toBe("auto-light");
    expect(getAutoTheme("light", 3)).toBe("auto-light");
  });

  it("follows a dark OS scheme during the day", () => {
    expect(getAutoTheme("dark", 10)).toBe("auto-dark");
  });

  it("falls back to the clock only when the OS has no preference", () => {
    expect(getAutoTheme("no-preference", 10)).toBe("auto-light");
    expect(getAutoTheme("no-preference", 22)).toBe("auto-dark");
  });
});

describe("resolvePaintTheme / applyThemeClass", () => {
  it("keeps an explicit light choice off the dark class", () => {
    const classes = new Set(["dark"]);
    applyThemeClass(
      resolvePaintTheme("light", "dark", 22),
      {
        classList: {
          add: (value) => classes.add(value),
          remove: (value) => {
            classes.delete(value);
          },
        },
      }
    );
    expect(classes.has("dark")).toBe(false);
    expect(classes.has("light")).toBe(true);
  });
});

describe("first-paint theme script", () => {
  it("uses the same script shipped as /initTheme.js", () => {
    const shipped = readFileSync(
      path.join(__dirname, "../public/initTheme.js"),
      "utf8"
    ).trim();
    expect(shipped).toBe(THEME_INIT_SCRIPT.trim());
  });

  it("inlines the script in _document instead of guessing a server theme", () => {
    const source = readFileSync(
      path.join(__dirname, "../pages/_document.tsx"),
      "utf8"
    );
    expect(source).toContain("THEME_INIT_SCRIPT");
    expect(source).toContain("dangerouslySetInnerHTML");
    expect(source).not.toMatch(/getTheme\s*\(\s*initTheme/);
    expect(source).not.toMatch(/src=["']\/initTheme\.js["']/);
  });

  it("stored light preference → first paint is light (no dark class)", () => {
    const { classes, storage } = runThemeInitScript({
      storedTheme: "light",
      prefers: "dark",
      hour: 22,
      initialClasses: ["dark"],
    });
    expect(classes.has("dark")).toBe(false);
    expect(classes.has("light")).toBe(true);
    expect(storage.theme).toBe("light");
  });

  it("auto + light OS → light, even at night", () => {
    const { classes } = runThemeInitScript({
      storedTheme: "auto",
      prefers: "light",
      hour: 22,
      initialClasses: ["dark"],
    });
    expect(classes.has("dark")).toBe(false);
    expect(classes.has("light")).toBe(true);
  });

  it("auto + dark OS → dark, even during the day", () => {
    const { classes } = runThemeInitScript({
      storedTheme: "auto",
      prefers: "dark",
      hour: 10,
    });
    expect(classes.has("dark")).toBe(true);
    expect(classes.has("light")).toBe(false);
  });

  it("missing stored theme still applies auto from the OS and does not write localStorage", () => {
    const { classes, storage } = runThemeInitScript({
      prefers: "light",
      hour: 22,
    });
    expect(classes.has("light")).toBe(true);
    expect(classes.has("dark")).toBe(false);
    expect(storage.theme).toBeUndefined();
  });

  it("stored dark preference still paints dark", () => {
    const { classes } = runThemeInitScript({
      storedTheme: "dark",
      prefers: "light",
      hour: 10,
    });
    expect(classes.has("dark")).toBe(true);
    expect(classes.has("light")).toBe(false);
  });
});
