const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const adminRoot = path.join(__dirname, '../..');

describe('admin editor transfer remote images (#434)', () => {
  it('exposes an explicit toolbar action that calls the transfer API', () => {
    const plugin = readFileSync(
      path.join(adminRoot, 'src/components/Editor/transferRemote.tsx'),
      'utf8',
    );
    const editor = readFileSync(path.join(adminRoot, 'src/components/Editor/index.tsx'), 'utf8');
    const api = readFileSync(path.join(adminRoot, 'src/services/van-blog/api.js'), 'utf8');

    assert.match(plugin, /外链图片转存/);
    assert.match(plugin, /transferRemoteImages/);
    assert.match(plugin, /siteHost/);
    assert.match(editor, /transferRemotePlugin/);
    assert.match(api, /\/api\/admin\/img\/transfer-remote/);
  });
});
