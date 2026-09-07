const { test, expect } = require('@playwright/test');
const { ISSUE_391_MERMAID } = require('./admin-api-mock');
const {
  collectUncaughtErrors,
  expectNoEditorCrash,
  expectPreviewVisibleAndIdle,
  pasteMermaidFenceAndType,
  readEditorValue,
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

test('dark-mode admin preview mermaid containers get the dark theme class (#404)', async ({
  page,
}) => {
  await page.goto('/?dark=1');
  await expect(page.locator('.CodeMirror').first()).toBeVisible();
  await expect
    .poll(async () =>
      page
        .locator(
          '.bytemd-preview .mermaid-theme-dark, .bytemd-preview [data-mermaid-theme="dark"]',
        )
        .count(),
    )
    .toBeGreaterThan(0);

  const theme = await page.evaluate(() => {
    const diagram = document.querySelector('.bytemd-preview .bytemd-mermaid');
    const fence = document.querySelector('.bytemd-preview code.language-mermaid');
    const node = diagram || fence;
    if (!node) {
      return null;
    }
    return {
      theme: node.getAttribute('data-mermaid-theme'),
      darkClass: node.classList.contains('mermaid-theme-dark'),
      htmlDark: document.documentElement.classList.contains('dark'),
    };
  });

  expect(theme).toBeTruthy();
  expect(theme.htmlDark).toBe(true);
  expect(theme.theme).toBe('dark');
  expect(theme.darkClass).toBe(true);
});

test('pasting styled mermaid with Chinese labels stays editable (#391)', async ({ page }) => {
  const errors = collectUncaughtErrors(page);
  await page.goto('/');
  const editor = page.locator('.CodeMirror').first();
  await expect(editor).toBeVisible();
  await expectPreviewVisibleAndIdle(page);

  await editor.click({ position: { x: 24, y: 24 } });
  await expect(editor).toHaveClass(/CodeMirror-focused/);
  await pasteMermaidFenceAndType(page, ISSUE_391_MERMAID, 'E2E_391_FIXTURE_OK');

  await expect.poll(async () => readEditorValue(page)).toContain('fill:#9fe1e7');
  await expect.poll(async () => readEditorValue(page)).toContain('协商脑力');
  await expect.poll(async () => readEditorValue(page)).toContain('E2E_391_FIXTURE_OK');

  await page.keyboard.press('Enter');
  await page.keyboard.type('STILL_TYPING');
  await expect.poll(async () => readEditorValue(page)).toContain('STILL_TYPING');

  await expect(page.getByText('Something went wrong')).toHaveCount(0);
  expectNoEditorCrash(page, errors);
  await expectPreviewVisibleAndIdle(page);
});
