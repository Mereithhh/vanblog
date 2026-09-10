const { test, expect } = require('@playwright/test');

async function lineSnapshot(page, root, wrapperSelector = '.code-block-wrapper.line-numbers') {
  return page.evaluate(({ sel, wrapperSel }) => {
    const scope = document.querySelector(sel);
    if (!scope) return null;
    const wrapper = scope.querySelector(wrapperSel);
    const lines = wrapper ? [...wrapper.querySelectorAll('.code-line')] : [];
    const mermaid = scope.querySelector('code.language-mermaid, .bytemd-mermaid');
    return {
      wrapper: Boolean(wrapper),
      count: lines.length,
      dataLines: lines.map((el) => el.getAttribute('data-line')),
      numbers: lines.map((el) => {
        const gutter = el.querySelector('.code-line-number');
        const style = gutter ? getComputedStyle(gutter) : null;
        return {
          text: gutter?.textContent ?? '',
          ariaHidden: gutter?.getAttribute('aria-hidden'),
          display: style?.display,
          color: style?.color,
          visible: Boolean(gutter && style && style.display !== 'none' && style.visibility !== 'hidden'),
        };
      }),
      contents: lines.map((el) => el.querySelector('.code-line-content')?.textContent ?? ''),
      mermaidHasLine: Boolean(
        mermaid && mermaid.querySelector('.code-line, .code-line-number'),
      ),
    };
  }, { sel: root, wrapperSel: wrapperSelector });
}

async function asmTokenSnapshot(page, root) {
  return page.evaluate((sel) => {
    const scope = document.querySelector(sel);
    if (!scope) return null;
    const code = scope.querySelector('code.language-asm, code.hljs.language-asm');
    if (!code) return { found: false };
    const tokens = [...code.querySelectorAll('[class*="hljs-"]')].map((el) => ({
      text: el.textContent,
      cls: el.getAttribute('class') || '',
      color: getComputedStyle(el).color,
    }));
    return {
      found: true,
      classes: code.getAttribute('class') || '',
      keywords: tokens.filter((t) => t.cls.includes('hljs-keyword')).map((t) => t.text),
      builtIns: tokens.filter((t) => t.cls.includes('hljs-built_in')).map((t) => t.text),
      comments: tokens.filter((t) => t.cls.includes('hljs-comment')).map((t) => t.text),
      colors: [...new Set(tokens.map((t) => t.color).filter(Boolean))],
    };
  }, root);
}

test.describe('public renderer code-block line numbers (#404)', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/code-block-article.html');
    await expect(page.locator('[data-code-light] .code-line').first()).toBeVisible();
    await expect(page.locator('[data-code-dark] .code-line').first()).toBeVisible();
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('light and dark public code blocks expose visible numbered lines', async ({ page }) => {
    const light = await lineSnapshot(page, '[data-code-light]');
    const dark = await lineSnapshot(page, '[data-code-dark]');
    for (const snap of [light, dark]) {
      expect(snap).toBeTruthy();
      expect(snap.wrapper).toBe(true);
      expect(snap.count).toBe(2);
      expect(snap.dataLines).toEqual(['1', '2']);
      expect(snap.numbers.map((n) => n.text)).toEqual(['1', '2']);
      expect(snap.numbers.every((n) => n.ariaHidden === 'true')).toBe(true);
      expect(snap.numbers.every((n) => n.visible)).toBe(true);
      expect(snap.contents.join('\n')).toContain('const answer = 42;');
      expect(snap.contents.join('\n')).toContain('const again = 7;');
      expect(snap.mermaidHasLine).toBe(false);
    }
  });

  test('public ```asm fences expose highlight.js token classes', async ({ page }) => {
    const light = await asmTokenSnapshot(page, '[data-code-light]');
    const dark = await asmTokenSnapshot(page, '[data-code-dark]');
    for (const snap of [light, dark]) {
      expect(snap.found).toBe(true);
      expect(snap.classes).toMatch(/hljs/);
      expect(snap.classes).toMatch(/language-asm/);
      expect(snap.keywords).toEqual(expect.arrayContaining(['mov', 'xor', 'int']));
      expect(snap.builtIns).toEqual(expect.arrayContaining(['eax', 'ebx']));
      expect(snap.comments.some((c) => c.includes('sys_exit'))).toBe(true);
      expect(snap.colors.length).toBeGreaterThan(1);
    }
  });
});
