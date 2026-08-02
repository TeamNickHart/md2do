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
      {
        name: PROMPT_TEMPLATES.BUILD_INTEGRATION,
        description:
          'Generate a prompt to help a Claude agent fetch tasks from an external source and write valid md2do JSONL ingest files',
        arguments: [
          {
            name: 'source',
            description:
              'Source system slug (e.g. teams, outlook, slack, gcal)',
            required: true,
          },
          {
            name: 'mode',
            description:
              'Output mode: "jsonl" (default) or "provider" (appends TypeScript SourceProvider skeleton)',
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

      case PROMPT_TEMPLATES.BUILD_INTEGRATION:
        return getBuildIntegrationPrompt(args);

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
 * Build integration prompt
 */
function getBuildIntegrationPrompt(args?: Record<string, string>) {
  const source = args?.source ?? 'your-source';

  const corePrompt = `You are helping build a new md2do source integration for: ${source}.

md2do ingests external tasks via a JSONL file — one JSON record per line.
Your job: fetch tasks from ${source}, write valid JSONL, then run the ingest command.

## JSONL Format

Required fields (every record must have all four):

  source       string   — always "${source}"
  externalId   string   — stable, unique ID for this item in ${source}
  text         string   — task description (plain text)
  completed    boolean  — true if already done/resolved

Optional fields:

  priority     string   — "urgent" | "high" | "normal" | "low"
  dueDate      string   — YYYY-MM-DD (ISO date only, no time)
  tags         string[] — tag names, no # prefix
  assignee     string   — username, no @ prefix
  metadata     object   — any extra data (preserved, ignored by md2do)

## Example

{"source":"${source}","externalId":"abc-123","text":"Review Q3 budget","completed":false,"priority":"high","dueDate":"2026-08-15","tags":["finance"],"assignee":"nick"}
{"source":"${source}","externalId":"abc-456","text":"Old action item","completed":true}

## Instructions

1. Fetch all relevant items from ${source} (unread @mentions, flagged emails, saved items, etc.)
2. Write one JSONL line per item to /tmp/${source}-tasks.jsonl
3. Choose externalId carefully — use the most stable unique identifier in ${source}
   (message-id, event-id, thread-id — NOT a list index or timestamp alone)
4. Map priorities to md2do levels:
   - Critical / P0 / urgent → "urgent"
   - Important / P1 / high  → "high"
   - Normal / P2 / medium   → "normal"
   - Low / P3 / no priority → "low" (or omit)
5. Set completed: true only when explicitly done/resolved/closed in ${source}

After writing the file, run:

  md2do ingest /tmp/${source}-tasks.jsonl --vault ~/notes

This creates vault/${source}/${source}-tasks.md with all tasks in md2do format,
queryable via \`md2do list\`, the Obsidian plugin, and the MCP server.`;

  const providerSkeleton = `

## TypeScript SourceProvider Skeleton

If you want a programmatic integration instead of agent-generated JSONL, implement this interface:

\`\`\`typescript
import type { SourceProvider, SourceTask, FetchOptions } from '@md2do/core';

export class ${source.charAt(0).toUpperCase() + source.slice(1)}Provider implements SourceProvider {
  readonly slug = '${source}';
  readonly name = '${source.charAt(0).toUpperCase() + source.slice(1)}';

  async fetchTasks(options?: FetchOptions): Promise<SourceTask[]> {
    // TODO: fetch items from ${source} API
    return [];
  }
}
\`\`\`

Then use \`ingestRecords()\` from \`@md2do/core\` to convert to markdown:

\`\`\`typescript
import { ingestRecords } from '@md2do/core';

const provider = new ${source.charAt(0).toUpperCase() + source.slice(1)}Provider(client);
const tasks = await provider.fetchTasks();
const records = tasks.map((t) => ({ source: provider.slug, ...t }));
const markdown = ingestRecords(records);
\`\`\``;

  const text =
    args?.mode === 'provider' ? corePrompt + providerSkeleton : corePrompt;

  return {
    description: `Integration builder prompt for ${source}`,
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text,
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
