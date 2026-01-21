import { defineWorkspace } from 'vitest/config';

/**
 * Vitest Workspace Configuration
 *
 * This configures coverage collection across all packages in the monorepo.
 * Each package has its own vitest.config.ts but this workspace config
 * enables unified coverage reporting.
 */
export default defineWorkspace([
  {
    extends: './packages/core/vitest.config.ts',
    test: {
      name: 'core',
      root: './packages/core',
    },
  },
  {
    extends: './packages/cli/vitest.config.ts',
    test: {
      name: 'cli',
      root: './packages/cli',
    },
  },
  {
    extends: './packages/config/vitest.config.ts',
    test: {
      name: 'config',
      root: './packages/config',
    },
  },
  {
    extends: './packages/todoist/vitest.config.ts',
    test: {
      name: 'todoist',
      root: './packages/todoist',
    },
  },
  {
    extends: './packages/mcp/vitest.config.ts',
    test: {
      name: 'mcp',
      root: './packages/mcp',
    },
  },
]);
