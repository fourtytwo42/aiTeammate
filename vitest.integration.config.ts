import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['node_modules/**'],
    environment: 'node'
  }
});
