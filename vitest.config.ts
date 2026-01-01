import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      include: [
        'src/lib/auth/jwt.ts',
        'src/lib/auth/password.ts',
        'src/lib/auth/permissions.ts',
        'src/lib/tools/search.ts',
        'src/lib/rag/chunking.ts',
        'src/lib/rag/embedding.ts',
        'src/lib/sample.ts'
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      }
    }
  }
});
