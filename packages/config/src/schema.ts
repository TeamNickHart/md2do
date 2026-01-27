import { z } from 'zod';

/**
 * Configuration schema for md2do
 * Supports hierarchical configuration: environment → project → global
 */

export const MarkdownConfigSchema = z
  .object({
    root: z.string().optional(),
    exclude: z.array(z.string()).optional(),
    pattern: z.string().optional(),
  })
  .optional();

export const TodoistConfigSchema = z
  .object({
    apiToken: z.string().optional(),
    defaultProject: z.string().optional(),
    autoSync: z.boolean().optional(),
    syncDirection: z.enum(['push', 'pull', 'both']).optional(),
    labelMapping: z.record(z.string()).optional(),
  })
  .optional();

export const OutputConfigSchema = z
  .object({
    format: z.enum(['pretty', 'table', 'json']).optional(),
    colors: z.boolean().optional(),
    paths: z.boolean().optional(),
  })
  .optional();

export const WarningConfigSchema = z
  .object({
    enabled: z.boolean().optional(),
    rules: z
      .record(
        z.enum([
          'unsupported-bullet',
          'malformed-checkbox',
          'missing-space-after',
          'missing-space-before',
          'relative-date-no-context',
          'missing-due-date',
          'missing-completed-date',
          'duplicate-todoist-id',
          'file-read-error',
        ]),
        z.enum(['error', 'warn', 'info', 'off']),
      )
      .optional(),
  })
  .optional();

export const ConfigSchema = z.object({
  markdown: MarkdownConfigSchema,
  defaultAssignee: z.string().optional(),
  todoist: TodoistConfigSchema,
  output: OutputConfigSchema,
  warnings: WarningConfigSchema,
});

export type MarkdownConfig = z.infer<typeof MarkdownConfigSchema>;
export type TodoistConfig = z.infer<typeof TodoistConfigSchema>;
export type OutputConfig = z.infer<typeof OutputConfigSchema>;
export type WarningConfig = z.infer<typeof WarningConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Config = {
  markdown: {
    pattern: '**/*.md',
    exclude: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
  },
  todoist: {
    autoSync: false,
    syncDirection: 'both',
  },
  output: {
    format: 'pretty',
    colors: true,
    paths: true,
  },
  warnings: {
    enabled: true,
    rules: {
      // Format/style warnings - enabled by default
      'unsupported-bullet': 'warn',
      'malformed-checkbox': 'warn',
      'missing-space-after': 'warn',
      'missing-space-before': 'warn',

      // Context warnings - enabled but informational
      'relative-date-no-context': 'warn',

      // Metadata completeness - disabled by default (too noisy)
      'missing-due-date': 'off',
      'missing-completed-date': 'off',

      // Errors - always shown
      'duplicate-todoist-id': 'error',
      'file-read-error': 'error',
    },
  },
};
