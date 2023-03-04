export const isMac = (): boolean =>
  typeof navigator !== "undefined" &&
  Boolean(navigator.userAgent?.toLowerCase().includes("mac"));
