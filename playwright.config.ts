import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3099',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
  webServer: {
    command: 'npx next start -p 3099',
    url: 'http://localhost:3099/es',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
