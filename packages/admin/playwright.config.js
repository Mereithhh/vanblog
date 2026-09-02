const { devices } = require('@playwright/test');

const fixturePort = Number(process.env.MERMAID_E2E_PORT || 4177);
const adminPort = Number(process.env.ADMIN_E2E_PORT || 3002);

module.exports = {
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  use: {
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node tests/e2e/serve-admin.mjs',
      url: `http://127.0.0.1:${adminPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
    {
      command: 'node tests/e2e/serve-fixture.mjs',
      port: fixturePort,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'admin-app',
      testMatch: /admin-editor-mermaid\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${adminPort}`,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'bytemd-fixture',
      testMatch: /mermaid-editor\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${fixturePort}`,
      },
    },
  ],
};
