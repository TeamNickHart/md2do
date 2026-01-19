import type { Task } from '@md2do/core';
import { filters, sorting } from '@md2do/core';
import { scanMarkdownFiles } from '../utils/scanner.js';
import { ListTasksInputSchema } from '../types.js';

/**
 * List tasks with optional filtering and sorting
 */
export async function listTasks(input: unknown): Promise<string> {
  // Validate input
  const validated = ListTasksInputSchema.parse(input);

  // Scan markdown files
  const scanResult = await scanMarkdownFiles({
    root: validated.path || process.cwd(),
  });

  let tasks = scanResult.tasks;

  // Apply filters
  const taskFilters: filters.TaskFilter[] = [];

  if (validated.assignee) {
    taskFilters.push(filters.byAssignee(validated.assignee));
  }

  if (validated.priority) {
    taskFilters.push(filters.byPriority(validated.priority));
  }

  if (validated.project) {
    taskFilters.push(filters.byProject(validated.project));
  }

  if (validated.person) {
    taskFilters.push(filters.byPerson(validated.person));
  }

  if (validated.tag) {
    taskFilters.push(filters.byTag(validated.tag));
  }

  if (validated.completed !== undefined) {
    taskFilters.push(filters.byCompleted(validated.completed));
  }

  if (validated.overdue) {
    taskFilters.push(filters.isOverdue());
  }

  if (validated.dueToday) {
    taskFilters.push(filters.isDueToday());
  }

  if (validated.dueThisWeek) {
    taskFilters.push(filters.isDueThisWeek());
  }

  if (validated.dueWithin) {
    taskFilters.push(filters.isDueWithinDays(validated.dueWithin));
  }

  if (taskFilters.length > 0) {
    tasks = tasks.filter(filters.combineFilters(taskFilters));
  }

  // Apply sorting
  if (validated.sort) {
    let comparator: sorting.TaskComparator;

    switch (validated.sort) {
      case 'due':
        comparator = sorting.byDueDate();
        break;
      case 'priority':
        comparator = sorting.byPriority();
        break;
      case 'created':
        comparator = sorting.byCreatedDate();
        break;
      case 'file':
        comparator = sorting.byFile();
        break;
      case 'project':
        comparator = sorting.byProject();
        break;
      case 'assignee':
        comparator = sorting.byAssignee();
        break;
      default:
        comparator = sorting.byFile();
    }

    if (validated.reverse) {
      comparator = sorting.reverse(comparator);
    }

    tasks.sort(comparator);
  }

  // Apply limit
  if (validated.limit && validated.limit > 0) {
    tasks = tasks.slice(0, validated.limit);
  }

  // Format results as JSON
  return JSON.stringify(
    {
      tasks: tasks.map(formatTask),
      metadata: {
        total: tasks.length,
        completed: tasks.filter((t) => t.completed).length,
        incomplete: tasks.filter((t) => !t.completed).length,
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
