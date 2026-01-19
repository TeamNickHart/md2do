import type { Task } from '@md2do/core';
import { scanMarkdownFiles } from '../utils/scanner.js';
import { SearchTasksInputSchema } from '../types.js';

/**
 * Search tasks by text query
 */
export async function searchTasks(input: unknown): Promise<string> {
  // Validate input
  const validated = SearchTasksInputSchema.parse(input);

  // Scan markdown files
  const scanResult = await scanMarkdownFiles({
    root: validated.path || process.cwd(),
  });

  // Search in task text
  const query = validated.caseInsensitive
    ? validated.query.toLowerCase()
    : validated.query;

  let results = scanResult.tasks.filter((task) => {
    const text = validated.caseInsensitive
      ? task.text.toLowerCase()
      : task.text;
    return text.includes(query);
  });

  // Apply limit
  if (validated.limit && validated.limit > 0) {
    results = results.slice(0, validated.limit);
  }

  // Format results
  return JSON.stringify(
    {
      query: validated.query,
      results: results.map(formatTask),
      metadata: {
        totalResults: results.length,
        filesScanned: scanResult.metadata.filesScanned,
      },
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
