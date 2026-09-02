const { test, expect } = require('@playwright/test');
const { loginAsAdmin, mockAdminApis } = require('./admin-api-mock');

test.describe('real Umi admin editor', () => {
  test('article 68 with mermaid stays editable', async ({ page }) => {
    await loginAsAdmin(page);
    await mockAdminApis(page);

    await page.goto('/admin/editor?type=article&id=68');

    const editor = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Markdown 语法测试').first()).toBeVisible();

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

    const previewHasMermaid = await page
      .locator('.bytemd-preview .bytemd-mermaid, .bytemd-preview code.language-mermaid')
      .count();
    expect(previewHasMermaid).toBeGreaterThan(0);
  });
});
