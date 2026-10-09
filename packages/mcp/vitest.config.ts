import { defineConfig } from 'vitest/config';

// Run tests off UTC by default so UTC-only date code fails here (see
// packages/core/vitest.config.ts). `pnpm test:tz` overrides the timezone.
process.env.TZ ??= 'Europe/Berlin';

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
      ],
      // TODO: Enable thresholds once initial tests are written
      // Target: 70% coverage (newer package, will increase over time)
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 70,
      //   statements: 70,
      // },
    },
  },
});
