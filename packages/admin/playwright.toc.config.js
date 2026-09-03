const { devices } = require('@playwright/test');

const fixturePort = Number(process.env.MERMAID_E2E_PORT || 4177);

module.exports = {
  testDir: './tests/e2e',
  timeout: 90_000,
  use: {
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node tests/e2e/serve-fixture.mjs',
    port: fixturePort,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'toc-heading',
      testMatch: /toc-heading\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${fixturePort}`,
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
};
