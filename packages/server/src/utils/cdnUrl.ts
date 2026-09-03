import fs from 'node:fs';
import path from 'node:path';

export type ApplyCdnPrefixResult = {
  assetPrefix: string;
  patchedConfig: boolean;
  rewrittenHtml: number;
};

/**
 * Next.js `assetPrefix` must not have a trailing slash.
 * Empty / whitespace means "no CDN".
 */
export function normalizeCdnUrl(url?: string | null): string {
  if (url == null) {
    return '';
  }
  const trimmed = String(url).trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.replace(/\/+$/, '');
}

/**
 * Prefix relative `/_next/` asset URLs in prerendered HTML.
 * Already-absolute CDN URLs are left alone so the rewrite is idempotent.
 * Article images and `/static` uploads are not rewritten.
 */
export function applyAssetPrefixToHtml(html: string, cdnUrl: string): string {
  const prefix = normalizeCdnUrl(cdnUrl);
  if (!prefix) {
    return html;
  }
  const escaped = JSON.stringify(prefix).slice(1, -1);
  let out = html.replace(/(["'`])\/_next\//g, `$1${prefix}/_next/`);
  out = out.replace(/"assetPrefix":"[^"]*"/g, `"assetPrefix":"${escaped}"`);
  return out;
}

export function getWebsiteRoot(cwd = process.cwd()): string {
  return path.join(path.resolve(cwd, '..'), 'website');
}

export function findStandaloneWebsiteDirs(websiteRoot: string): string[] {
  const candidates = [path.join(websiteRoot, 'packages', 'website'), websiteRoot];
  return candidates.filter((dir) => {
    return (
      fs.existsSync(path.join(dir, '.next', 'required-server-files.json')) ||
      fs.existsSync(path.join(dir, '.next', 'server'))
    );
  });
}

/**
 * Docker images bake Next.js `assetPrefix` as empty. Apply VAN_BLOG_CDN_URL
 * to the standalone snapshot and prerendered HTML so runtime env takes effect.
 */
export function applyRuntimeCdnPrefix(
  websiteRoot: string,
  cdnUrl?: string | null,
): ApplyCdnPrefixResult {
  const assetPrefix = normalizeCdnUrl(cdnUrl);
  let patchedConfig = false;
  let rewrittenHtml = 0;

  for (const dir of findStandaloneWebsiteDirs(websiteRoot)) {
    const configPath = path.join(dir, '.next', 'required-server-files.json');
    if (fs.existsSync(configPath)) {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!raw.config || typeof raw.config !== 'object') {
        raw.config = {};
      }
      raw.config.assetPrefix = assetPrefix;
      fs.writeFileSync(configPath, JSON.stringify(raw));
      patchedConfig = true;
    }

    if (assetPrefix) {
      const serverDir = path.join(dir, '.next', 'server');
      if (fs.existsSync(serverDir)) {
        rewrittenHtml += rewriteHtmlTree(serverDir, assetPrefix);
      }
    }
  }

  return { assetPrefix, patchedConfig, rewrittenHtml };
}

function rewriteHtmlTree(dir: string, cdnUrl: string): number {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += rewriteHtmlTree(full, cdnUrl);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) {
      continue;
    }
    const before = fs.readFileSync(full, 'utf8');
    const after = applyAssetPrefixToHtml(before, cdnUrl);
    if (after !== before) {
      fs.writeFileSync(full, after);
      count += 1;
    }
  }
  return count;
}
