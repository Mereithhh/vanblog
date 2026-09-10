/** Full-width header row that the mobile site name is centered against. */
export const NAV_BAR_ROW_CLASS = "nav-bar-row";

/** Mobile site name overlay; CSS centers it on the row, not the leftover column. */
export const NAV_SITE_NAME_MOBILE_CLASS = "nav-site-name-mobile";

/** Desktop site name (left cluster). Hidden below the `md` breakpoint. */
export const NAV_SITE_NAME_DESKTOP_CLASS = "nav-site-name-desktop";

export const NAV_SITE_NAME_ATTR = "data-nav-site-name";
export const NAV_SITE_NAME_MOBILE = "mobile";
export const NAV_SITE_NAME_DESKTOP = "desktop";

/** Same as Tailwind `md`. */
export const NAV_DESKTOP_MIN_WIDTH_PX = 768;

/** Visual center vs viewport; short names make a few px of error obvious. */
export const NAV_SITE_NAME_CENTER_TOLERANCE_PX = 8;

export function viewportCenterX(viewportWidth: number): number {
  return viewportWidth / 2;
}

export function boxCenterX(box: { x: number; width: number }): number {
  return box.x + box.width / 2;
}

/** Center of the leftover header column beside a leading (menu) cluster. */
export function leftoverColumnCenterX(input: {
  leadingWidth: number;
  viewportWidth: number;
  trailingWidth: number;
}): number {
  const leftover =
    input.viewportWidth - input.leadingWidth - input.trailingWidth;
  return input.leadingWidth + leftover / 2;
}

export function isCenteredOnViewport(
  titleCenterX: number,
  viewportWidth: number,
  tolerancePx = NAV_SITE_NAME_CENTER_TOLERANCE_PX
): boolean {
  return (
    Math.abs(titleCenterX - viewportCenterX(viewportWidth)) <= tolerancePx
  );
}
