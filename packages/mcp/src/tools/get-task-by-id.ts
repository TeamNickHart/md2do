import type { Task } from '@md2do/core';
import { scanMarkdownFiles } from '../utils/scanner.js';
import { GetTaskByIdInputSchema } from '../types.js';

/**
 * Get a single task by its ID
 */
export async function getTaskById(input: unknown): Promise<string> {
  // Validate input
  const validated = GetTaskByIdInputSchema.parse(input);

  // Scan markdown files
  const scanResult = await scanMarkdownFiles({
    root: validated.path || process.cwd(),
  });

  // Find task by ID
  const task = scanResult.tasks.find((t) => t.id === validated.id);

  if (!task) {
    return JSON.stringify(
      {
        error: 'Task not found',
        id: validated.id,
      },
      null,
      2,
    );
  }

  // Format result
  return JSON.stringify(
    {
      task: formatTask(task),
    },
    null,
    2,
  );
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
