import { defineConfig } from 'vitest/config';

// Run tests in a timezone east of UTC so date code that falls back to UTC
// (e.g. toISOString().split('T')[0]) fails here, not only for users. Set
// before workers start: workers inherit it, and can't change it themselves.
// `pnpm test:tz` overrides this to run the suite in several timezones.
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
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
