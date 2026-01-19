import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { scanMarkdownFiles } from '../utils/scanner.js';
import type { Task } from '@md2do/core';

/**
 * Register all MCP resources with the server
 */
export function registerResources(server: Server) {
  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, () => ({
    resources: [
      {
        uri: 'task://all',
        name: 'All Tasks',
        description: 'All tasks in the workspace',
        mimeType: 'application/json',
      },
      {
        uri: 'task://project/{name}',
        name: 'Project Tasks',
        description: 'Tasks for a specific project',
        mimeType: 'application/json',
      },
      {
        uri: 'task://person/{name}',
        name: 'Person Tasks',
        description: 'Tasks for a specific person (from 1-1 files)',
        mimeType: 'application/json',
      },
      {
        uri: 'task://file/{path}',
        name: 'File Tasks',
        description: 'Tasks from a specific file',
        mimeType: 'application/json',
      },
    ],
  }));

  // Handle resource reads
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      // Parse URI
      const url = new URL(uri) as URL;

      if (url.protocol !== 'task:') {
        throw new Error(`Unsupported protocol: ${url.protocol}`);
      }

      // Scan all tasks
      const scanResult = await scanMarkdownFiles({
        root: process.cwd(),
      });

      let tasks: Task[] = scanResult.tasks;
      let description = '';

      // Filter based on URI path
      const path = url.pathname.substring(2); // Remove leading '//'

      if (path === 'all') {
        description = 'All tasks in workspace';
      } else if (path.startsWith('project/')) {
        const projectName = path.substring(8);
        tasks = tasks.filter((t) => t.project === projectName);
        description = `Tasks for project: ${projectName}`;
      } else if (path.startsWith('person/')) {
        const personName = path.substring(7);
        tasks = tasks.filter((t) => t.person === personName);
        description = `Tasks for person: ${personName}`;
      } else if (path.startsWith('file/')) {
        const filePath = path.substring(5);
        tasks = tasks.filter((t) => t.file === filePath);
        description = `Tasks from file: ${filePath}`;
      } else {
        throw new Error(`Unknown resource path: ${path}`);
      }

      // Format response
      const result = {
        description,
        tasks: tasks.map(formatTask),
        metadata: {
          total: tasks.length,
          completed: tasks.filter((t) => t.completed).length,
          incomplete: tasks.filter((t) => !t.completed).length,
        },
      };

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
      };
    }
  });
}

/**
 * Format a task for JSON output
 */
function formatTask(task: Task) {
  const formatted: Record<string, unknown> = {
    id: task.id,
    text: task.text,
    completed: task.completed,
    file: task.file,
    line: task.line,
  };

  if (task.assignee) formatted.assignee = task.assignee;
  if (task.priority) formatted.priority = task.priority;
  if (task.project) formatted.project = task.project;
  if (task.person) formatted.person = task.person;
  if (task.tags.length > 0) formatted.tags = task.tags;
  if (task.dueDate) formatted.dueDate = task.dueDate.toISOString();
  if (task.completedDate)
    formatted.completedDate = task.completedDate.toISOString();
  if (task.contextHeading) formatted.contextHeading = task.contextHeading;

  return formatted;
}
