import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { listTasks } from './list-tasks.js';
import { getTaskStats } from './get-stats.js';
import { searchTasks } from './search-tasks.js';
import { getTaskById } from './get-task-by-id.js';

/**
 * Register all MCP tools with the server
 */
export function registerTools(server: Server) {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
      {
        name: 'list_tasks',
        description:
          'List tasks from markdown files with optional filtering (assignee, priority, project, tags, due dates) and sorting. Returns tasks in JSON format.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to scan (defaults to current directory)',
            },
            assignee: {
              type: 'string',
              description: 'Filter by assignee username',
            },
            priority: {
              type: 'string',
              enum: ['urgent', 'high', 'normal', 'low'],
              description: 'Filter by priority level',
            },
            project: {
              type: 'string',
              description: 'Filter by project name',
            },
            person: {
              type: 'string',
              description: 'Filter by person (from 1-1 files)',
            },
            tag: {
              type: 'string',
              description: 'Filter by tag',
            },
            completed: {
              type: 'boolean',
              description: 'Filter by completion status',
            },
            overdue: {
              type: 'boolean',
              description: 'Show only overdue tasks',
            },
            dueToday: {
              type: 'boolean',
              description: 'Show tasks due today',
            },
            dueThisWeek: {
              type: 'boolean',
              description: 'Show tasks due this week',
            },
            dueWithin: {
              type: 'number',
              description: 'Show tasks due within N days',
            },
            sort: {
              type: 'string',
              enum: [
                'due',
                'priority',
                'created',
                'file',
                'project',
                'assignee',
              ],
              description: 'Sort by field',
            },
            reverse: {
              type: 'boolean',
              description: 'Reverse sort order',
            },
            limit: {
              type: 'number',
              description: 'Limit number of results',
            },
          },
        },
      },
      {
        name: 'get_task_stats',
        description:
          'Get aggregated task statistics with optional grouping by assignee, project, person, priority, or tag. Returns statistics in JSON format.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to scan (defaults to current directory)',
            },
            groupBy: {
              type: 'string',
              enum: ['assignee', 'project', 'person', 'priority', 'tag'],
              description: 'Group statistics by field',
            },
            assignee: {
              type: 'string',
              description: 'Filter by assignee before generating stats',
            },
            project: {
              type: 'string',
              description: 'Filter by project before generating stats',
            },
          },
        },
      },
      {
        name: 'search_tasks',
        description:
          'Search for tasks by text query. Searches in task descriptions and returns matching tasks in JSON format.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to scan (defaults to current directory)',
            },
            query: {
              type: 'string',
              description: 'Search query (searches in task text)',
            },
            caseInsensitive: {
              type: 'boolean',
              description: 'Case insensitive search',
            },
            limit: {
              type: 'number',
              description: 'Limit number of results',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_task_by_id',
        description:
          'Get a single task by its unique ID. Returns task details in JSON format or an error if not found.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to scan (defaults to current directory)',
            },
            id: {
              type: 'string',
              description: 'Task ID to retrieve',
            },
          },
          required: ['id'],
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'list_tasks': {
          const result = await listTasks(args as Record<string, unknown>);
          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          };
        }

        case 'get_task_stats': {
          const result = await getTaskStats(args as Record<string, unknown>);
          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          };
        }

        case 'search_tasks': {
          const result = await searchTasks(args as Record<string, unknown>);
          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          };
        }

        case 'get_task_by_id': {
          const result = await getTaskById(args as Record<string, unknown>);
          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });
}
