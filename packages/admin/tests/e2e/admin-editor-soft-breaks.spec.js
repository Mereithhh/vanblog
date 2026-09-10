const { test, expect } = require('@playwright/test');
const { loginAsAdmin, mockAdminApis } = require('./admin-api-mock');
const { readEditorValue } = require('./page-errors');

async function openEditor(page, editorConfig) {
  await loginAsAdmin(page, editorConfig ? { editorConfig } : {});
  await mockAdminApis(page);
  await page.goto('/admin/editor?type=article&id=108');
  const editor = page.locator('.bytemd-editor .CodeMirror').first();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  return editor;
}

async function typeSoftBreakSample(page, first, second) {
  await page.evaluate((text) => {
    const cm = document.querySelector('.CodeMirror')?.CodeMirror;
    if (!cm) {
      throw new Error('CodeMirror is not ready');
    }
    cm.setValue(text);
    cm.setCursor({ line: 0, ch: text.length });
    cm.focus();
  }, first);
  await page.keyboard.press('Enter');
  await page.keyboard.type(second);
}

async function readPref() {
  return JSON.parse(window.localStorage.getItem('vanblog-admin-editorConfig') || '{}');
}

async function saveSoftLineBreaksPref(page, label) {
  await page.getByRole('button', { name: '操作' }).click();
  await page.getByText('偏好设置').click();
  const dialog = page.locator('.ant-modal-content').filter({ hasText: '编辑器偏好设置' });
  await expect(dialog).toBeVisible();

  const item = dialog.locator('.ant-form-item').filter({ hasText: '软换行' });
  await expect(item).toBeVisible();
  await item.locator('.ant-select-selector').click();
  await page
    .locator('.ant-select-dropdown:visible .ant-select-item-option-content')
    .filter({ hasText: new RegExp(`^${label}$`) })
    .click();
  await dialog.getByRole('button', { name: /确\s*[定认]/ }).click();
  await expect(dialog).toBeHidden();
}

test.describe('admin editor soft line breaks (#311)', () => {
  test('disabled default keeps standard Markdown (no auto trailing spaces)', async ({ page }) => {
    const editor = await openEditor(page);
    await editor.click({ position: { x: 24, y: 24 } });
    await typeSoftBreakSample(page, 'SOFT_OFF_A', 'SOFT_OFF_B');

    await expect.poll(async () => readEditorValue(page)).toContain('SOFT_OFF_A\nSOFT_OFF_B');
    expect(await readEditorValue(page)).not.toContain('SOFT_OFF_A  \n');
  });

  test('enabled preference pads Enter with trailing spaces', async ({ page }) => {
    const editor = await openEditor(page, {
      afterSave: 'stay',
      useLocalCache: 'close',
      softLineBreaks: 'open',
    });
    await editor.click({ position: { x: 24, y: 24 } });
    await typeSoftBreakSample(page, 'SOFT_ON_A', 'SOFT_ON_B');
    await expect.poll(async () => readEditorValue(page)).toContain('SOFT_ON_A  \nSOFT_ON_B');
  });

  test('toggle persists and Enter completes trailing spaces when enabled', async ({ page }) => {
    const editor = await openEditor(page);
    await saveSoftLineBreaksPref(page, '开启');

    await expect
      .poll(async () => page.evaluate(readPref))
      .toMatchObject({ softLineBreaks: 'open' });

    await editor.click({ position: { x: 24, y: 24 } });
    await typeSoftBreakSample(page, 'SOFT_TOGGLE_A', 'SOFT_TOGGLE_B');
    await expect.poll(async () => readEditorValue(page)).toContain('SOFT_TOGGLE_A  \nSOFT_TOGGLE_B');

    await page.reload();
    await mockAdminApis(page);
    const editorAgain = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editorAgain).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(async () => page.evaluate(readPref))
      .toMatchObject({ softLineBreaks: 'open' });

    await editorAgain.click({ position: { x: 24, y: 24 } });
    await typeSoftBreakSample(page, 'SOFT_RELOAD_A', 'SOFT_RELOAD_B');
    await expect
      .poll(async () => readEditorValue(page))
      .toContain('SOFT_RELOAD_A  \nSOFT_RELOAD_B');
  });
});
