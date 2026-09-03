const { devices } = require('@playwright/test');

const fixturePort = Number(process.env.MERMAID_E2E_PORT || 4177);
const adminPort = Number(process.env.ADMIN_E2E_PORT || 3002);
const backupPort = Number(process.env.BACKUP_E2E_PORT || 4178);
const postIsrPort = Number(process.env.POST_ISR_E2E_PORT || 4179);
const adminMetaPort = Number(process.env.ADMIN_META_E2E_PORT || 4180);
const commentLoginPort = Number(process.env.COMMENT_LOGIN_E2E_PORT || 4181);

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
    {
      command: 'node tests/e2e/backup-restore-server.mjs',
      url: `http://127.0.0.1:${backupPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'node tests/e2e/post-isr-server.mjs',
      url: `http://127.0.0.1:${postIsrPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'node tests/e2e/admin-meta-server.mjs',
      url: `http://127.0.0.1:${adminMetaPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'node tests/e2e/comment-login-server.mjs',
      url: `http://127.0.0.1:${commentLoginPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
  projects: [
    {
      name: 'admin-app',
      testMatch: /admin-editor-.*\.spec\.js|custom-page-info\.spec\.js|custom-page-upload\.spec\.js/,
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
    {
      name: 'backup-restore',
      testMatch: /backup-restore\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${backupPort}`,
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'post-isr',
      testMatch: /post-isr\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${postIsrPort}`,
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'admin-meta',
      testMatch: /admin-meta\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${adminMetaPort}`,
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'comment-login',
      testMatch: /comment-login\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${commentLoginPort}`,
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
};
