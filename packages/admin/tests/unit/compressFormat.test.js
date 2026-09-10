const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

describe('admin static compressFormat (#423)', () => {
  it('exposes AVIF next to the existing compress toggle', () => {
    const src = readFileSync(
      path.join(__dirname, '../../src/components/WaterMarkForm/index.tsx'),
      'utf8',
    );
    assert.match(src, /name="enableWebp"/);
    assert.match(src, /name="compressFormat"/);
    assert.match(src, /value: 'webp'/);
    assert.match(src, /value: 'avif'/);
    assert.match(src, /AVIF/);
  });
});
