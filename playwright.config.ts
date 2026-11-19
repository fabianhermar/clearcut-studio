import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 2,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : 'list',
  use: {
    baseURL: 'http://localhost:3099',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: process.env.CI
        ? { ...devices['Desktop Chrome'] }
        : { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
  webServer: {
    command: 'pnpm exec next start -p 3099',
    url: 'http://localhost:3099/es',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
