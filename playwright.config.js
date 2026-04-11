// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'browser',
      testDir: './tests/browser',
      timeout: 15000,
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      testMatch: 'e2e.spec.js',
      timeout: 120000,
    },
  ],
  webServer: {
    command: 'node node_modules/serve/build/main.js -l 3456 .',
    port: 3456,
    timeout: 10000,
    reuseExistingServer: !process.env.CI,
  },
});
