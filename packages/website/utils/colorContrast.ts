/** WCAG 2 relative-luminance / contrast helpers for CSS color values. */

export type Rgb = [number, number, number];

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  grey: "#808080",
  gray: "#808080",
  gold: "#ffd700",
};

const hexChannel = (hex: string, i: number): number =>
  parseInt(hex.length === 3 ? hex[i] + hex[i] : hex.slice(i * 2, i * 2 + 2), 16);

/** Parse `#rgb` / `#rrggbb` / `rgb()` / `rgb(r g b)` / a CSS named color. */
export function parseCssColor(value: string): Rgb | null {
  const raw = String(value ?? "")
    .trim()
    .replace(/!important/gi, "")
    .trim()
    .toLowerCase();
  if (!raw || raw === "inherit" || raw === "transparent" || raw === "currentcolor") {
    return null;
  }

  const named = NAMED_COLORS[raw];
  if (named) return parseCssColor(named);

  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    return [hexChannel(h, 0), hexChannel(h, 1), hexChannel(h, 2)];
  }

  const rgb = raw.match(
    /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+)?\s*\)$/
  );
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  return null;
}

/** WCAG 2.1 relative luminance (sRGB). */
export function relativeLuminance(rgb: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

/** WCAG contrast ratio of two CSS colors. Throws if either color cannot be parsed. */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseCssColor(foreground);
  const bg = parseCssColor(background);
  if (!fg || !bg) {
    throw new Error(`Cannot compute contrast for "${foreground}" on "${background}"`);
  }
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}
