/**
 * Resolve a custom article pathname from Markdown Front Matter.
 *
 * Create-article already accepts an optional `pathname` string with no extra
 * sanitizing (empty → `/post/<id>`). Import reuses that: only string/number
 * values are kept, whitespace is trimmed, and nothing else is rewritten.
 *
 * Preference:
 * 1. `pathname` — VanBlog's own field (re-import / explicit override)
 * 2. `abbrlink` — hexo-abbrlink / hexo-addlink, so archives/cb933e30.html
 *    can map to /post/cb933e30 (#383)
 *
 * Other hexo keys such as `permalink` are not recognized here; they are not
 * used by the existing importer.
 */

function asPathname(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const text = value.trim();
  return text || undefined;
}

/**
 * @param {unknown} attributes Front Matter object from `front-matter`
 * @returns {string|undefined}
 */
function pathnameFromFrontMatter(attributes) {
  if (!attributes || typeof attributes !== 'object') {
    return undefined;
  }
  return asPathname(attributes.pathname) || asPathname(attributes.abbrlink);
}

module.exports = {
  pathnameFromFrontMatter,
};
