function collectUncaughtErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => {
    errors.push(String(err && err.message ? err.message : err));
  });
  return errors;
}

async function expectPreviewVisibleAndIdle(page) {
  const preview = page.locator('.bytemd-preview').first();
  await expectVisibleWithSize(preview);
}

async function expectVisibleWithSize(locator) {
  const { expect } = require('@playwright/test');
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).toBeTruthy();
  expect(box.width).toBeGreaterThan(120);
  expect(box.height).toBeGreaterThan(80);
}

function expectNoEditorCrash(page, errors) {
  const { expect } = require('@playwright/test');
  const fatal = errors.filter((message) =>
    /iterable|is not a function|removeChild|NotFoundError|Something went wrong/i.test(
      message,
    ),
  );
  expect(fatal, fatal.join('\n')).toEqual([]);
  expect(errors, errors.join('\n')).toEqual([]);
}

module.exports = {
  collectUncaughtErrors,
  expectNoEditorCrash,
  expectPreviewVisibleAndIdle,
};
