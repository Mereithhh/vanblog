const { test, expect } = require('@playwright/test');
const { loginAsAdmin, mockAdminApis } = require('./admin-api-mock');
const { readEditorValue } = require('./page-errors');

const MOBILE_TOOLS = ['粗体', '斜体', '引用', '链接', '图片', '无序列表', '代码'];
const DESKTOP_ONLY = ['表情', '自定义高亮块', '外链图片转存', '插入 more 标记'];

async function openEditor(page) {
  await loginAsAdmin(page);
  await mockAdminApis(page);
  await page.goto('/admin/editor?type=article&id=108');
  const editor = page.locator('.bytemd-editor .CodeMirror').first();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  return editor;
}

test.describe('admin editor mobile toolbar (#504)', () => {
  test('mobile viewport shows the curated tools and keeps the page from overflowing', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openEditor(page);

    await expect(page.locator('.bytemd-toolbar-tab').filter({ hasText: '编辑' })).toBeVisible();
    await expect(page.locator('.bytemd-toolbar-tab').filter({ hasText: '预览' })).toBeVisible();

    const mobileBar = page.locator('.vanblog-mobile-toolbar');
    await expect(mobileBar).toBeVisible();
    await expect(mobileBar.getByLabel('标题')).toBeVisible();
    for (const name of MOBILE_TOOLS) {
      await expect(mobileBar.getByRole('button', { name, exact: true })).toBeVisible();
    }
    for (const name of DESKTOP_ONLY) {
      await expect(mobileBar.getByRole('button', { name })).toHaveCount(0);
    }

    await mobileBar.getByRole('button', { name: '粗体', exact: true }).click();
    await expect.poll(async () => readEditorValue(page)).toMatch(/\*\*/);

    const toolbar = page.locator('.bytemd-toolbar').first();
    await expect(toolbar).toBeVisible();
    const metrics = await page.evaluate(() => {
      const bar = document.querySelector('.bytemd-toolbar');
      const box = bar ? bar.getBoundingClientRect() : null;
      return {
        docWidth: document.documentElement.scrollWidth,
        viewWidth: window.innerWidth,
        toolbarTop: box ? box.top : -1,
        toolbarVisible: Boolean(box && box.bottom > 0 && box.top < window.innerHeight),
      };
    });
    expect(metrics.docWidth).toBeLessThanOrEqual(metrics.viewWidth + 2);
    expect(metrics.toolbarVisible).toBe(true);
    expect(metrics.toolbarTop).toBeGreaterThanOrEqual(0);
  });

  test('desktop split toolbar is unchanged and does not mount the mobile row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openEditor(page);

    await expect(page.locator('.bytemd-toolbar-tab')).toHaveCount(0);
    await expect(page.locator('.vanblog-mobile-toolbar')).toHaveCount(0);

    const leftIcons = page.locator('.bytemd-toolbar-left .bytemd-toolbar-icon');
    expect(await leftIcons.count()).toBeGreaterThanOrEqual(8);

    const titles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.bytemd-toolbar-left .bytemd-toolbar-icon')).map(
        (node) => node.getAttribute('aria-label') || node.getAttribute('title') || '',
      ),
    );
    // Desktop still exposes the builtin formatting row (tippy titles land after hover;
    // the icon nodes themselves must exist and not be display:none).
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.bytemd-toolbar-left .bytemd-toolbar-icon')).filter(
        (node) => getComputedStyle(node).display === 'none',
      ).length,
    );
    expect(hidden).toBe(0);
    expect(titles.length).toBeGreaterThanOrEqual(8);
  });
});
