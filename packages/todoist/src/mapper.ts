import type { Task } from '@md2do/core';
import type { Task as TodoistTask } from '@doist/todoist-api-typescript';

/**
 * Priority mapping between md2do and Todoist
 * md2do: urgent (!!!) / high (!!) / normal (!) / low (none)
 * Todoist: 4 / 3 / 2 / 1
 */
export function md2doToTodoistPriority(priority?: string): number {
  switch (priority) {
    case 'urgent':
      return 4;
    case 'high':
      return 3;
    case 'normal':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

export function todoistToMd2doPriority(priority: number): string | undefined {
  switch (priority) {
    case 4:
      return 'urgent';
    case 3:
      return 'high';
    case 2:
      return 'normal';
    case 1:
      return 'low';
    default:
      return undefined;
  }
}

/**
 * Extract task content without metadata for Todoist
 * Removes: assignee, priority markers, tags, dates, todoist ID
 */
export function extractTaskContent(text: string): string {
  return (
    text
      // Remove assignee @username
      .replace(/@\w+/g, '')
      // Remove priority markers
      .replace(/!+/g, '')
      // Remove tags
      .replace(/#\w+/g, '')
      // Remove dates in parentheses
      .replace(/\(\d{4}-\d{2}-\d{2}\)/g, '')
      // Remove Todoist ID
      .replace(/\[todoist:\s*\d+\]/gi, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Format Todoist task content for markdown
 * Adds back assignee, priority, tags, and due date
 */
export function formatTaskContent(
  content: string,
  options: {
    assignee?: string;
    priority?: string;
    tags?: string[];
    due?: Date;
    todoistId?: string;
  },
): string {
  let result = content;

  // Add assignee
  if (options.assignee) {
    result += ` @${options.assignee}`;
  }

  // Add priority markers
  if (options.priority === 'urgent') {
    result += ' !!!';
  } else if (options.priority === 'high') {
    result += ' !!';
  } else if (options.priority === 'normal') {
    result += ' !';
  }

  // Add tags
  if (options.tags && options.tags.length > 0) {
    result += ' ' + options.tags.map((tag) => `#${tag}`).join(' ');
  }

  // Add due date
  if (options.due) {
    // Format date in UTC to avoid timezone issues
    const year = options.due.getUTCFullYear();
    const month = String(options.due.getUTCMonth() + 1).padStart(2, '0');
    const day = String(options.due.getUTCDate()).padStart(2, '0');
    result += ` (${year}-${month}-${day})`;
  }

  // Add Todoist ID
  if (options.todoistId) {
    result += ` [todoist:${options.todoistId}]`;
  }

  return result;
}

/**
 * Convert md2do task to Todoist task creation parameters
 */
export interface TodoistTaskParams {
  content: string;
  priority: number;
  labels?: string[];
  due_date?: string;
  due_string?: string;
  project_id?: string;
}

export function md2doToTodoist(
  task: Task,
  projectId?: string,
): TodoistTaskParams {
  const params: TodoistTaskParams = {
    content: extractTaskContent(task.text),
    priority: md2doToTodoistPriority(task.priority),
  };

  // Add labels from tags
  if (task.tags && task.tags.length > 0) {
    params.labels = task.tags;
  }

  // Add due date
  if (task.dueDate) {
    // Format date in UTC to avoid timezone issues
    const year = task.dueDate.getUTCFullYear();
    const month = String(task.dueDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(task.dueDate.getUTCDate()).padStart(2, '0');
    params.due_date = `${year}-${month}-${day}`;
  }

  // Add project ID
  if (projectId) {
    params.project_id = projectId;
  }

  return params;
}

/**
 * Convert Todoist task to md2do task update data
 */
export interface Md2doTaskUpdate {
  text: string;
  completed: boolean;
  todoistId: string;
  priority?: string;
  tags?: string[];
  due?: Date;
}

export function todoistToMd2do(
  todoistTask: TodoistTask,
  assignee?: string,
): Md2doTaskUpdate {
  const priority = todoistToMd2doPriority(todoistTask.priority);
  // Parse date string as UTC to avoid timezone issues
  const due = todoistTask.due?.date
    ? new Date(`${todoistTask.due.date}T00:00:00.000Z`)
    : undefined;

  // Build format options with only defined values
  const formatOptions: {
    assignee?: string;
    priority?: string;
    tags?: string[];
    due?: Date;
    todoistId?: string;
  } = {
    todoistId: todoistTask.id,
  };

  if (assignee !== undefined) {
    formatOptions.assignee = assignee;
  }

  if (priority !== undefined) {
    formatOptions.priority = priority;
  }

  if (todoistTask.labels.length > 0) {
    formatOptions.tags = todoistTask.labels;
  }

  if (due !== undefined) {
    formatOptions.due = due;
  }

  const update: Md2doTaskUpdate = {
    text: formatTaskContent(todoistTask.content, formatOptions),
    completed: todoistTask.isCompleted ?? false,
    todoistId: todoistTask.id,
  };

  // Add optional properties only if they have values
  if (priority !== undefined) {
    update.priority = priority;
  }

  if (todoistTask.labels.length > 0) {
    update.tags = todoistTask.labels;
  }

  if (due !== undefined) {
    update.due = due;
  }

  return update;
}
