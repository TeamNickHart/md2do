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

export const ConfigSchema = z.object({
  markdown: MarkdownConfigSchema,
  defaultAssignee: z.string().optional(),
  todoist: TodoistConfigSchema,
  output: OutputConfigSchema,
});

export type MarkdownConfig = z.infer<typeof MarkdownConfigSchema>;
export type TodoistConfig = z.infer<typeof TodoistConfigSchema>;
export type OutputConfig = z.infer<typeof OutputConfigSchema>;
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
};
