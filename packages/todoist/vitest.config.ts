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
        '**/client.ts', // thin API wrapper, no unit-testable logic
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 90,
        statements: 80,
      },
    },
  },
});
