const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '../../../..');
const adminRoot = path.join(__dirname, '../..');

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/**
 * mermaid 10.6.1 mindmap (dist/mindmap-definition-617cf8dd.js) ESM-imports
 * cytoscape/dist/cytoscape.umd.js. cytoscape >= 3.33.0 exports that subpath
 * for require only, which webpack 5 rejects.
 */
function umdSubpathAllowsEsmImport(pkg) {
  const exportsField = pkg.exports;
  if (exportsField == null) {
    return true;
  }
  const entry = exportsField['./dist/cytoscape.umd.js'];
  if (typeof entry === 'string') {
    return true;
  }
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  return entry.import != null || entry.default != null;
}

describe('mermaid mindmap cytoscape pin', () => {
  it('pins cytoscape to 3.27.0 in the admin package and the workspace root', () => {
    const adminPkg = readJson(path.join(adminRoot, 'package.json'));
    const rootPkg = readJson(path.join(repoRoot, 'package.json'));
    assert.equal(adminPkg.pnpm?.overrides?.cytoscape, '3.27.0');
    assert.equal(rootPkg.pnpm?.overrides?.cytoscape, '3.27.0');
  });

  it('keeps the workspace lockfile on cytoscape 3.27.0', () => {
    const lockfile = readFileSync(path.join(repoRoot, 'pnpm-lock.yaml'), 'utf8');
    const versions = [...lockfile.matchAll(/^ {2}\/cytoscape@([^:]+):/gm)].map((match) => match[1]);
    assert.deepEqual(versions, ['3.27.0']);
  });

  it('resolves an install whose UMD subpath webpack can import', () => {
    const mermaidPkgPath = require.resolve('mermaid/package.json', { paths: [adminRoot] });
    const fromMermaid = createRequire(mermaidPkgPath);
    const cytoscapePkgPath = fromMermaid.resolve('cytoscape/package.json');
    const cytoscapePkg = readJson(cytoscapePkgPath);
    const umdPath = path.join(path.dirname(cytoscapePkgPath), 'dist/cytoscape.umd.js');

    assert.equal(cytoscapePkg.version, '3.27.0');
    assert.equal(existsSync(umdPath), true);
    assert.equal(umdSubpathAllowsEsmImport(cytoscapePkg), true);
  });
});
