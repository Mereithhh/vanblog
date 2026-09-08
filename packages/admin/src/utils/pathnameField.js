/**
 * Admin copy for per-article custom pathname (#487).
 *
 * VanBlog already publishes `/post/<pathname>` (fallback `/post/<id>`).
 * There is no site-wide Hugo permalink template. The gap is discoverability:
 * Hugo migrants looking for `post = "/post/:slug"` need to find this field.
 */

const PATHNAME_ADMIN_HINT =
  '新建文章、导入 Markdown、发布草稿，或文章「操作 → 修改信息」/ 编辑器「修改信息」';

const PATHNAME_FIELD = Object.freeze({
  name: 'pathname',
  label: '自定义路径名 / slug',
  placeholder: '例如 my-old-post；留空则用数字 id',
  tooltip:
    '发布后地址为 /post/[此项]，对应 Hugo 的 permalink：post = "/post/:slug"。从 Hugo 迁移时填旧文章的 slug，旧链接才能继续打开、不影响 SEO。留空则用数字 id。数字 ID 地址（/post/123）始终可用，没有站点级固定链接模板。',
});

/**
 * Map Hugo/Hexo-style Front Matter onto VanBlog pathname.
 * Accepts `pathname`, `slug`, or a single-segment /post/<slug> `url`.
 * Does not implement permalink patterns like /:year/:month/:title.
 */
function pathnameFromFrontMatter(attributes = {}) {
  for (const key of ['pathname', 'slug']) {
    const extracted = extractPostSlug(attributes[key]);
    if (extracted) {
      return extracted;
    }
  }
  return extractPostSlug(attributes.url);
}

function extractPostSlug(value) {
  if (typeof value !== 'string') {
    return '';
  }
  let raw = value.trim();
  if (!raw) {
    return '';
  }
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return '';
    }
  }
  const parts = raw.split('/').filter(Boolean);
  if (parts.length === 1) {
    return decodeURIComponent(parts[0]);
  }
  if (parts.length === 2 && parts[0] === 'post') {
    return decodeURIComponent(parts[1]);
  }
  return '';
}

module.exports = {
  PATHNAME_ADMIN_HINT,
  PATHNAME_FIELD,
  pathnameFromFrontMatter,
  extractPostSlug,
};
