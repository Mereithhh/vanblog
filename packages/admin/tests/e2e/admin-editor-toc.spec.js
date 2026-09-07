const { test, expect } = require('@playwright/test');
const { loginAsAdmin, mockAdminApis } = require('./admin-api-mock');
const {
  collectUncaughtErrors,
  expectNoEditorCrash,
  expectPreviewVisibleAndIdle,
} = require('./page-errors');

async function openEditorOutline(page) {
  const toc = page.locator('.bytemd-toc');
  await expect(toc).toBeAttached({ timeout: 30_000 });
  if (!(await toc.evaluate((el) => el.classList.contains('bytemd-hidden')))) {
    return;
  }
  const icons = page.locator('.bytemd-toolbar-right .bytemd-toolbar-icon');
  const count = await icons.count();
  for (let i = 0; i < count; i += 1) {
    await icons.nth(i).click();
    if (!(await toc.evaluate((el) => el.classList.contains('bytemd-hidden')))) {
      return;
    }
    const help = page.locator('.bytemd-help');
    if (
      (await help.count()) &&
      !(await help.evaluate((el) => el.classList.contains('bytemd-hidden')))
    ) {
      await icons.nth(i).click();
    }
  }
  throw new Error('Could not open the ByteMD outline');
}

async function expectToolbarVisible(page) {
  const toolbar = page.locator('.bytemd-toolbar').first();
  await expect(toolbar).toBeVisible();
  const box = await toolbar.boundingBox();
  expect(box).toBeTruthy();
  expect(box.height).toBeGreaterThan(16);
  expect(box.width).toBeGreaterThan(120);

  const metrics = await page.evaluate(() => {
    const bar = document.querySelector('.bytemd-toolbar');
    const editor = document.querySelector('.bytemd');
    if (!bar || !editor) {
      return { missing: true };
    }
    const t = bar.getBoundingClientRect();
    const b = editor.getBoundingClientRect();
    const hit = document.elementFromPoint(t.left + Math.min(24, t.width / 2), t.top + t.height / 2);
    return {
      missing: false,
      toolbarTop: t.top,
      editorTop: b.top,
      inViewport: t.bottom > 0 && t.top < window.innerHeight && t.right > 0 && t.left < window.innerWidth,
      windowScroll: window.scrollY,
      editorScroll: editor.scrollTop,
      hitToolbar: Boolean(hit && hit.closest('.bytemd-toolbar')),
    };
  });

  expect(metrics.missing).toBe(false);
  expect(metrics.inViewport).toBe(true);
  expect(metrics.windowScroll).toBe(0);
  expect(metrics.editorScroll).toBe(0);
  expect(metrics.toolbarTop).toBeGreaterThanOrEqual(metrics.editorTop - 1);
  expect(metrics.toolbarTop).toBeLessThan(metrics.editorTop + 8);
  expect(metrics.hitToolbar).toBe(true);
}

async function expectEditorNotBlank(page) {
  const editor = page.locator('.bytemd-editor .CodeMirror').first();
  await expect(editor).toBeVisible();
  const box = await editor.boundingBox();
  expect(box).toBeTruthy();
  expect(box.width).toBeGreaterThan(120);
  expect(box.height).toBeGreaterThan(80);

  const metrics = await page.evaluate(() => {
    const body = document.querySelector('.bytemd-body');
    const editorEl = document.querySelector('.bytemd-editor');
    const cm = document.querySelector('.bytemd-editor .CodeMirror');
    if (!cm) {
      return { missing: true };
    }
    const rect = cm.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + 36, rect.top + 36);
    return {
      missing: false,
      bodyScroll: body ? body.scrollTop : -1,
      editorScroll: editorEl ? editorEl.scrollTop : -1,
      cmScroll: cm.scrollTop,
      inEditor: Boolean(hit && hit.closest('.bytemd-editor')),
      value: cm.CodeMirror ? cm.CodeMirror.getValue() : '',
    };
  });

  expect(metrics.missing).toBe(false);
  expect(metrics.bodyScroll).toBe(0);
  expect(metrics.editorScroll).toBe(0);
  expect(metrics.cmScroll).toBe(0);
  expect(metrics.inEditor).toBe(true);
  expect(metrics.value.length).toBeGreaterThan(0);
}

async function typeInEditor(page, text) {
  const editor = page.locator('.bytemd-editor .CodeMirror').first();
  await editor.click({ position: { x: 24, y: 24 } });
  await page.keyboard.type(text);
  await expect
    .poll(async () =>
      page.evaluate(() => document.querySelector('.CodeMirror')?.CodeMirror?.getValue() || ''),
    )
    .toContain(text);
}

test.describe('admin editor outline vs markdown heading', () => {
  test('nested outline then heading click does not blank the editor', async ({ page }) => {
    const errors = collectUncaughtErrors(page);
    await loginAsAdmin(page);
    await mockAdminApis(page);

    await page.goto('/admin/editor?type=article&id=370');

    const editor = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('目录点击空白测试').first()).toBeVisible();
    await expect(page.getByText('一级标题').first()).toBeVisible();
    await expectPreviewVisibleAndIdle(page);
    await expectEditorNotBlank(page);
    await expectToolbarVisible(page);

    await openEditorOutline(page);
    await expect(page.locator('.bytemd-toc li.bytemd-toc-2').filter({ hasText: '二级标题' })).toBeVisible();

    await page.locator('.bytemd-toc li.bytemd-toc-2').filter({ hasText: '二级标题' }).click();
    await expectEditorNotBlank(page);
    await expectToolbarVisible(page);
    await expect(page.locator('.bytemd-preview h2').filter({ hasText: '二级标题' })).toBeVisible();

    await page.locator('.bytemd-preview h2').filter({ hasText: '二级标题' }).click();
    await expectEditorNotBlank(page);

    await page.evaluate(() => {
      const cmEl = document.querySelector('.bytemd-editor .CodeMirror');
      const cm = cmEl && cmEl.CodeMirror;
      if (!cm) {
        return;
      }
      const line = cm.getValue().split('\n').findIndex((row) => row.startsWith('## 二级标题'));
      if (line >= 0) {
        cm.scrollIntoView({ line, ch: 0 });
      }
    });
    const nestedHeading = page.locator('.bytemd-editor .cm-header-2').filter({ hasText: '二级标题' });
    await expect(nestedHeading).toBeVisible();
    await nestedHeading.click();
    await expectEditorNotBlank(page);

    await typeInEditor(page, 'E2E_EDITOR_TOC_OK ');
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    expectNoEditorCrash(page, errors);
    await expectPreviewVisibleAndIdle(page);
  });

  test('short article still works after opening the outline', async ({ page }) => {
    const errors = collectUncaughtErrors(page);
    await loginAsAdmin(page);
    await mockAdminApis(page);

    await page.goto('/admin/editor?type=article&id=108');

    const editor = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('方向键光标测试标题').first()).toBeVisible();
    await expectEditorNotBlank(page);
    await expectToolbarVisible(page);

    await openEditorOutline(page);
    await expectEditorNotBlank(page);
    await expectToolbarVisible(page);
    await typeInEditor(page, 'E2E_SHORT_TOC_OK ');
    expectNoEditorCrash(page, errors);
  });

  test('long article TOC jump keeps the toolbar in view (#298)', async ({ page }) => {
    const errors = collectUncaughtErrors(page);
    await loginAsAdmin(page);
    await mockAdminApis(page);

    await page.goto('/admin/editor?type=article&id=298');

    const editor = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('长文工具栏测试').first()).toBeVisible();
    await expectPreviewVisibleAndIdle(page);
    await expectEditorNotBlank(page);
    await expectToolbarVisible(page);

    await openEditorOutline(page);
    await expect(page.locator('.bytemd-toc li').filter({ hasText: '文末标题' })).toBeVisible();

    await page.evaluate(() => {
      window.scrollTo(0, 2400);
      const layout = document.querySelector('.ant-pro-layout-content, .editor-full, .bytemd');
      if (layout) {
        layout.scrollTop = 2400;
      }
    });

    await page.locator('.bytemd-toc li').filter({ hasText: '文末标题' }).click();
    await expect(page.locator('.bytemd-preview h2').filter({ hasText: '文末标题' })).toBeVisible();
    await expectEditorNotBlank(page);
    await expectToolbarVisible(page);

    const firstIcon = page.locator('.bytemd-toolbar-left .bytemd-toolbar-icon').first();
    await expect(firstIcon).toBeVisible();
    await firstIcon.click();
    await page.keyboard.press('Escape');
    await expectToolbarVisible(page);

    await typeInEditor(page, 'E2E_TOOLBAR_LONG_OK ');
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    expectNoEditorCrash(page, errors);
    await expectPreviewVisibleAndIdle(page);
    await expectToolbarVisible(page);
  });
});
