import { expect, test } from '@playwright/test';

const { uniq } = require('lodash');

const RouterConfig = require('../../config/routes').default;

const BASE_URL = `http://localhost:${process.env.PORT || 8001}`;

function formatter(routes, parentPath = '') {
  const fixedParentPath = parentPath.replace(/\/{1,}/g, '/');
  let result = [];
  routes.forEach((item) => {
    if (item.path && !item.path.startsWith('/')) {
      result.push(`${fixedParentPath}/${item.path}`.replace(/\/{1,}/g, '/'));
    }

    if (item.path && item.path.startsWith('/')) {
      result.push(`${item.path}`.replace(/\/{1,}/g, '/'));
    }

    if (item.routes) {
      result = result.concat(
        formatter(item.routes, item.path ? `${fixedParentPath}/${item.path}` : parentPath),
      );
    }
  });
  return uniq(result.filter((item) => !!item));
}

const testPage = (path, page) => async () => {
  await page.evaluate(() => {
    localStorage.setItem('antd-pro-authority', '["admin"]');
  });
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForSelector('footer', {
    timeout: 2000,
  });
  const haveFooter = await page.evaluate(() => document.getElementsByTagName('footer').length > 0);
  expect(haveFooter).toBeTruthy();
};

const routers = formatter(RouterConfig);
routers.forEach((route) => {
  test(`test route page ${route}`, async ({ page }) => {
    await testPage(route, page);
  });
});
