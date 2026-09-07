const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const adminRoot = path.join(__dirname, '..', '..');

describe('admin origin no-store headers (#140)', () => {
  it('umi devServer sends private no-store on the admin shell', () => {
    const src = readFileSync(path.join(adminRoot, 'config/config.js'), 'utf8');
    assert.match(src, /Cache-Control['"]?:\s*['"]private, no-store/);
    assert.match(src, /CDN-Cache-Control['"]?:\s*['"]no-store['"]/);
    assert.match(src, /Cloudflare-CDN-Cache-Control['"]?:\s*['"]no-store['"]/);
    assert.doesNotMatch(src, /publicPath:.*no-store/);
  });

  it('nginx admin location sends no-store with always', () => {
    const src = readFileSync(path.join(adminRoot, 'default.conf'), 'utf8');
    assert.match(src, /location \^~ \/admin/);
    assert.match(src, /add_header Cache-Control "private, no-store, no-cache, must-revalidate" always;/);
    assert.match(src, /add_header CDN-Cache-Control "no-store" always;/);
    assert.match(src, /add_header Cloudflare-CDN-Cache-Control "no-store" always;/);
  });
});
