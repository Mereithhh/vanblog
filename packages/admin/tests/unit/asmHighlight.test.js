const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { getProcessor } = require('bytemd');
const gfm = require('@bytemd/plugin-gfm');
const { highlightSsr } = require('../../src/components/Editor/highlightSsr');

const adminRoot = path.join(__dirname, '../..');
const editorSrc = readFileSync(path.join(adminRoot, 'src/components/Editor/index.tsx'), 'utf8');

const FENCED_ASM = `\`\`\`asm
section .text
global _start
_start:
    mov eax, 1      ; sys_exit
    xor ebx, ebx
    int 0x80
\`\`\`
`;

function renderAdminPreview(markdown) {
  return getProcessor({
    plugins: [gfm(), highlightSsr()],
  })
    .processSync(markdown)
    .toString();
}

describe('admin preview assembly highlighting (#294)', () => {
  it('wires highlightSsr into the editor plugin list', () => {
    assert.match(editorSrc, /highlightSsr/);
    assert.match(editorSrc, /highlightSsr\(\)/);
    assert.doesNotMatch(editorSrc, /from '@bytemd\/plugin-highlight-ssr'/);
  });

  it('tokenizes ```asm fences with keyword / register / comment classes', () => {
    const html = renderAdminPreview(FENCED_ASM);
    assert.match(html, /language-asm/);
    assert.match(html, /<span[^>]*class="[^"]*hljs-keyword[^"]*"[^>]*>mov<\/span>/);
    assert.match(html, /<span[^>]*class="[^"]*hljs-built_in[^"]*"[^>]*>eax<\/span>/);
    assert.match(html, /hljs-comment/);
    assert.match(html, /sys_exit/);
  });

  it('accepts nasm fence tag as an x86asm alias', () => {
    const html = renderAdminPreview(FENCED_ASM.replace('```asm', '```nasm'));
    assert.match(html, /language-nasm/);
    assert.match(html, /<span[^>]*class="[^"]*hljs-keyword[^"]*"[^>]*>mov<\/span>/);
  });
});
