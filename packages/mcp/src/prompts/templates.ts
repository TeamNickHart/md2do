import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PROMPT_TEMPLATES } from '../types.js';

/**
 * Register all MCP prompts with the server
 */
export function registerPrompts(server: Server) {
  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, () => ({
    prompts: [
      {
        name: PROMPT_TEMPLATES.DAILY_STANDUP,
        description:
          'Generate a daily standup report showing what was completed yesterday and what is planned for today',
        arguments: [
          {
            name: 'assignee',
            description: 'Filter tasks by assignee (optional)',
            required: false,
          },
          {
            name: 'project',
            description: 'Filter tasks by project (optional)',
            required: false,
          },
        ],
      },
      {
        name: PROMPT_TEMPLATES.SPRINT_SUMMARY,
        description:
          'Generate a sprint summary report showing progress, completion rate, and remaining work',
        arguments: [
          {
            name: 'project',
            description: 'Project name for sprint summary',
            required: false,
          },
        ],
      },
      {
        name: PROMPT_TEMPLATES.OVERDUE_REVIEW,
        description:
          'Review all overdue tasks and generate a prioritization report',
        arguments: [
          {
            name: 'assignee',
            description: 'Filter by assignee (optional)',
            required: false,
          },
        ],
      },
    ],
  }));

  // Handle prompt requests
  server.setRequestHandler(GetPromptRequestSchema, (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case PROMPT_TEMPLATES.DAILY_STANDUP:
        return getDailyStandupPrompt(args);

      case PROMPT_TEMPLATES.SPRINT_SUMMARY:
        return getSprintSummaryPrompt(args);

      case PROMPT_TEMPLATES.OVERDUE_REVIEW:
        return getOverdueReviewPrompt(args);

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });
}

/**
 * Daily standup prompt
 */
function getDailyStandupPrompt(args?: Record<string, string>) {
  const assigneeFilter = args?.assignee ? `--assignee ${args.assignee}` : '';
  const projectFilter = args?.project ? `--project ${args.project}` : '';

  return {
    description: 'Daily standup report template',
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Please generate a daily standup report using md2do tasks.

Use the list_tasks tool to:
1. Get tasks completed yesterday (check createdDate or look for recently completed tasks)
2. Get incomplete tasks that are due today or overdue

${assigneeFilter ? `Filter by assignee: ${args?.assignee}` : ''}
${projectFilter ? `Filter by project: ${args?.project}` : ''}

Format the report as:
**Yesterday:**
- List of completed tasks

**Today:**
- List of tasks planned/in progress

**Blockers:**
- Any overdue or high-priority tasks that need attention`,
        },
      },
    ],
  };
}

/**
 * Sprint summary prompt
 */
function getSprintSummaryPrompt(args?: Record<string, string>) {
  const projectFilter = args?.project ? `--project ${args.project}` : '';

  return {
    description: 'Sprint summary report template',
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Please generate a sprint summary report using md2do tasks.

Use the get_task_stats tool to get overall statistics${projectFilter ? ` for project: ${args?.project}` : ''}.

Also use list_tasks to:
1. Get all tasks (completed and incomplete)
2. Identify high-priority tasks
3. Check for overdue items

Format the report with:
**Sprint Overview:**
- Total tasks
- Completion rate (completed / total)
- Tasks by priority

**Progress:**
- Recently completed work
- In progress tasks
- Remaining work

**Risks:**
- Overdue tasks
- High-priority incomplete tasks`,
        },
      },
    ],
  };
}

/**
 * Overdue review prompt
 */
function getOverdueReviewPrompt(args?: Record<string, string>) {
  const assigneeFilter = args?.assignee ? `--assignee ${args?.assignee}` : '';

  return {
    description: 'Overdue tasks review template',
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Please review all overdue tasks and help prioritize them.

Use the list_tasks tool with:
- overdue: true
${assigneeFilter ? `- assignee: ${args?.assignee}` : ''}
- sort by priority

Analyze the results and provide:
**Overdue Tasks by Priority:**
- Group tasks by priority (urgent, high, normal, low)

**Recommended Actions:**
- Suggest which tasks to tackle first
- Identify tasks that might need re-scoping or delegation
- Flag any potential blockers

**Summary:**
- Total overdue count
- Oldest overdue task
- Recommendations for getting back on track`,
        },
      },
    ],
  };
}
