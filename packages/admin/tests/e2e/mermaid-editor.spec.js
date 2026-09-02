const { test, expect } = require('@playwright/test');

test('article with mermaid stays editable in the admin editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('.CodeMirror').first();
  await expect(editor).toBeVisible();

  await page.waitForTimeout(1500);

  const hit = await page.evaluate(() => {
    const el = document.querySelector('.bytemd-editor .CodeMirror');
    if (!el) {
      return { inEditor: false };
    }
    const rect = el.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + 36, rect.top + 36);
    return {
      inEditor: Boolean(top && top.closest('.bytemd-editor')),
      leftover: Boolean(document.querySelector('body > [id^="dbytemd-mermaid"], body > [id^="dmermaid"]')),
    };
  });

  expect(hit.inEditor).toBe(true);
  expect(hit.leftover).toBe(false);

  await editor.click();
  await page.keyboard.press('Control+Home');
  await page.keyboard.type('E2E_MERMAID_EDITOR_OK ');

  await expect.poll(async () => page.evaluate(() => window.__editorValue || '')).toContain(
    'E2E_MERMAID_EDITOR_OK',
  );

  const previewHasMermaid = await page.locator('.bytemd-preview .bytemd-mermaid, .bytemd-preview code.language-mermaid').count();
  expect(previewHasMermaid).toBeGreaterThan(0);
});
