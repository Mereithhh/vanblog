const { test, expect } = require('@playwright/test');
const {
  collectUncaughtErrors,
  expectNoEditorCrash,
  expectPreviewVisibleAndIdle,
} = require('./page-errors');

test('article with mermaid stays editable in the admin editor', async ({ page }) => {
  const errors = collectUncaughtErrors(page);
  await page.goto('/');
  const editor = page.locator('.CodeMirror').first();
  await expect(editor).toBeVisible();
  await expectPreviewVisibleAndIdle(page);

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

  await editor.click({ position: { x: 24, y: 24 } });
  await expect(editor).toHaveClass(/CodeMirror-focused/);
  await page.keyboard.type('E2E_MERMAID_EDITOR_OK ');

  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          window.__editorValue ||
          document.querySelector('.CodeMirror')?.CodeMirror?.getValue() ||
          '',
      ),
    )
    .toContain('E2E_MERMAID_EDITOR_OK');

  await page.keyboard.type('AND_AGAIN');
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          window.__editorValue ||
          document.querySelector('.CodeMirror')?.CodeMirror?.getValue() ||
          '',
      ),
    )
    .toContain('AND_AGAIN');

  await expect(page.getByText('Something went wrong')).toHaveCount(0);
  expectNoEditorCrash(page, errors);

  const previewHasMermaid = await page.locator('.bytemd-preview .bytemd-mermaid, .bytemd-preview code.language-mermaid').count();
  expect(previewHasMermaid).toBeGreaterThan(0);
  await expectPreviewVisibleAndIdle(page);
});
