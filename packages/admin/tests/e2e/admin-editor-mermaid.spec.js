const { test, expect } = require('@playwright/test');
const { ISSUE_391_MERMAID, loginAsAdmin, mockAdminApis } = require('./admin-api-mock');
const {
  collectUncaughtErrors,
  expectNoEditorCrash,
  expectPreviewVisibleAndIdle,
  pasteMermaidFenceAndType,
  readEditorValue,
} = require('./page-errors');

test.describe('real Umi admin editor', () => {
  test('article 68 with mermaid stays editable', async ({ page }) => {
    const errors = collectUncaughtErrors(page);
    await loginAsAdmin(page);
    await mockAdminApis(page);

    await page.goto('/admin/editor?type=article&id=68');

    const editor = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Markdown 语法测试').first()).toBeVisible();
    await expectPreviewVisibleAndIdle(page);

    await expect
      .poll(async () =>
        page.evaluate(() => document.querySelector('.CodeMirror')?.CodeMirror?.getValue() || ''),
      )
      .toContain('```mermaid');

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
        leftover: Boolean(
          document.querySelector('body > [id^="dbytemd-mermaid"], body > [id^="dmermaid"]'),
        ),
        focused: el.classList.contains('CodeMirror-focused'),
      };
    });

    expect(hit.inEditor).toBe(true);
    expect(hit.leftover).toBe(false);

    await editor.click({ position: { x: 24, y: 24 } });
    await expect(editor).toHaveClass(/CodeMirror-focused/);
    await page.keyboard.type('E2E_ADMIN_MERMAID_OK ');

    await expect
      .poll(async () =>
        page.evaluate(() => document.querySelector('.CodeMirror')?.CodeMirror?.getValue() || ''),
      )
      .toContain('E2E_ADMIN_MERMAID_OK');

    await page.keyboard.press('Backspace');
    await page.keyboard.type('STILL_EDITABLE');

    await expect
      .poll(async () =>
        page.evaluate(() => document.querySelector('.CodeMirror')?.CodeMirror?.getValue() || ''),
      )
      .toContain('STILL_EDITABLE');

    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    expectNoEditorCrash(page, errors);

    const previewHasMermaid = await page
      .locator('.bytemd-preview .bytemd-mermaid, .bytemd-preview code.language-mermaid')
      .count();
    expect(previewHasMermaid).toBeGreaterThan(0);
    await expectPreviewVisibleAndIdle(page);
  });

  test('pasting styled mermaid with Chinese labels stays editable (#391)', async ({ page }) => {
    const errors = collectUncaughtErrors(page);
    await loginAsAdmin(page);
    await mockAdminApis(page);

    await page.goto('/admin/editor?type=article&id=68');

    const editor = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expectPreviewVisibleAndIdle(page);

    await editor.click({ position: { x: 24, y: 24 } });
    await expect(editor).toHaveClass(/CodeMirror-focused/);
    await pasteMermaidFenceAndType(page, ISSUE_391_MERMAID, 'E2E_391_STILL_EDITABLE');

    await expect.poll(async () => readEditorValue(page)).toContain('fill:#9fe1e7');
    await expect.poll(async () => readEditorValue(page)).toContain('努力学习');
    await expect.poll(async () => readEditorValue(page)).toContain('E2E_391_STILL_EDITABLE');

    await page.keyboard.press('Enter');
    await page.keyboard.type('AFTER_ENTER');
    await expect.poll(async () => readEditorValue(page)).toContain('AFTER_ENTER');

    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    expectNoEditorCrash(page, errors);
    await expectPreviewVisibleAndIdle(page);
  });
});
