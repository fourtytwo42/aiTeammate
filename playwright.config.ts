import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    reducedMotion: 'reduce'
  },
  webServer: {
    command: 'npm run build && npm run start',
    env: {
      NEXT_PUBLIC_AUTH_BYPASS: '1'
    },
    url: 'http://127.0.0.1:3000',
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  }
});
