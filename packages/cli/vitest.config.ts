import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        'tests/e2e/**', // Exclude E2E tests from coverage
      ],
      // TODO: Enable thresholds once unit tests are written
      // Target: 70% coverage (CLI code harder to test)
      // Note: E2E tests in tests/e2e/ are proof-of-concept (skipped)
      // Real E2E tests are in scripts/e2e-test.sh
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 70,
      //   statements: 70,
      // },
    },
  },
});
