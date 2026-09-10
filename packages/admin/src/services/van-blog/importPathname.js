/**
 * Resolve a custom article pathname from Markdown Front Matter.
 *
 * Create-article already accepts an optional `pathname` string with no extra
 * sanitizing (empty → `/post/<id>`). Import reuses that: only string/number
 * values are kept, whitespace is trimmed, and nothing else is rewritten.
 *
 * Preference:
 * 1. `pathname` — VanBlog's own field (re-import / explicit override)
 * 2. `slug` — Hugo `permalinks.post = "/post/:slug"` (#487)
 * 3. `url` — only a single segment or `/post/<slug>` (absolute `/post/<slug>`
 *    URLs included). Not `:year/:month/:title` templates.
 * 4. `abbrlink` — hexo-abbrlink / hexo-addlink, so archives/cb933e30.html
 *    can map to /post/cb933e30 (#383)
 *
 * Other hexo keys such as `permalink` are not recognized here; they are not
 * used by the existing importer.
 */

const PATHNAME_FIELD = Object.freeze({
  name: 'pathname',
  label: '自定义路径名 / slug',
  placeholder: '例如 Hugo 的 slug；留空则用数字 id',
  tooltip:
    '发布后地址为 /post/[自定义路径名]，对应 Hugo 的 permalinks.post = "/post/:slug"。从 Hugo 迁移时把旧 slug 填到这里，可保持旧 URL、不影响 SEO。留空则用数字 id。数字 ID 地址始终可用；没有站点级固定链接模板。',
});

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
 * Accept a bare slug, `/post/<slug>`, or `https://host/post/<slug>`.
 * Nested templates such as `/post/:year/:month/:title` are ignored.
 *
 * @param {unknown} value
 * @returns {string|undefined}
 */
function extractPostSlug(value) {
  const text = asPathname(value);
  if (!text) {
    return undefined;
  }

  let raw = text;
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return undefined;
    }
  }

  raw = raw.split('?')[0].split('#')[0];
  const parts = raw.split('/').filter(Boolean);
  if (parts.length === 1) {
    return decodeSlugPart(parts[0]);
  }
  if (parts.length === 2 && parts[0] === 'post') {
    return decodeSlugPart(parts[1]);
  }
  return undefined;
}

function decodeSlugPart(part) {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

/**
 * @param {unknown} attributes Front Matter object from `front-matter`
 * @returns {string|undefined}
 */
function pathnameFromFrontMatter(attributes) {
  if (!attributes || typeof attributes !== 'object') {
    return undefined;
  }
  return (
    extractPostSlug(attributes.pathname) ||
    extractPostSlug(attributes.slug) ||
    extractPostSlug(attributes.url) ||
    extractPostSlug(attributes.abbrlink)
  );
}

module.exports = {
  PATHNAME_FIELD,
  extractPostSlug,
  pathnameFromFrontMatter,
};
