import { z } from 'zod';

/**
 * Zod schemas for MCP tool inputs
 */

export const ListTasksInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe('Path to scan (defaults to current directory)'),
  assignee: z.string().optional().describe('Filter by assignee username'),
  priority: z
    .enum(['urgent', 'high', 'normal', 'low'])
    .optional()
    .describe('Filter by priority level'),
  project: z.string().optional().describe('Filter by project name'),
  person: z.string().optional().describe('Filter by person (from 1-1 files)'),
  tag: z.string().optional().describe('Filter by tag'),
  completed: z.boolean().optional().describe('Filter by completion status'),
  overdue: z.boolean().optional().describe('Show only overdue tasks'),
  dueToday: z.boolean().optional().describe('Show tasks due today'),
  dueThisWeek: z.boolean().optional().describe('Show tasks due this week'),
  dueWithin: z.number().optional().describe('Show tasks due within N days'),
  sort: z
    .enum(['due', 'priority', 'created', 'file', 'project', 'assignee'])
    .optional()
    .describe('Sort by field'),
  reverse: z.boolean().optional().describe('Reverse sort order'),
  limit: z.number().optional().describe('Limit number of results'),
});

export type ListTasksInput = z.infer<typeof ListTasksInputSchema>;

export const GetTaskStatsInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe('Path to scan (defaults to current directory)'),
  groupBy: z
    .enum(['assignee', 'project', 'person', 'priority', 'tag'])
    .optional()
    .describe('Group statistics by field'),
  assignee: z
    .string()
    .optional()
    .describe('Filter by assignee before generating stats'),
  project: z
    .string()
    .optional()
    .describe('Filter by project before generating stats'),
});

export type GetTaskStatsInput = z.infer<typeof GetTaskStatsInputSchema>;

export const SearchTasksInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe('Path to scan (defaults to current directory)'),
  query: z.string().describe('Search query (searches in task text)'),
  caseInsensitive: z.boolean().optional().describe('Case insensitive search'),
  limit: z.number().optional().describe('Limit number of results'),
});

export type SearchTasksInput = z.infer<typeof SearchTasksInputSchema>;

export const GetTaskByIdInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe('Path to scan (defaults to current directory)'),
  id: z.string().describe('Task ID to retrieve'),
});

export type GetTaskByIdInput = z.infer<typeof GetTaskByIdInputSchema>;

/**
 * Prompt template names
 */
export const PROMPT_TEMPLATES = {
  DAILY_STANDUP: 'daily_standup',
  SPRINT_SUMMARY: 'sprint_summary',
  OVERDUE_REVIEW: 'overdue_review',
} as const;

export type PromptTemplateName =
  (typeof PROMPT_TEMPLATES)[keyof typeof PROMPT_TEMPLATES];
