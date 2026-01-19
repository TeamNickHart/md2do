import chalk from 'chalk';
import Table from 'cli-table3';
import type { Task } from '@md2do/core';
import { formatDistanceToNow } from 'date-fns';

export interface PrettyFormatOptions {
  /**
   * Show file paths (defaults to true)
   */
  showFilePaths?: boolean;

  /**
   * Use colors (defaults to true)
   */
  colors?: boolean;

  /**
   * Make file paths clickable in VSCode (defaults to true)
   */
  vscodeLinks?: boolean;

  /**
   * Show context information (project, person, heading)
   */
  showContext?: boolean;
}

/**
 * Format tasks in a pretty, human-readable format
 *
 * @param tasks - Tasks to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatAsPretty(
  tasks: Task[],
  options: PrettyFormatOptions = {},
): string {
  const {
    showFilePaths = true,
    colors = true,
    vscodeLinks = true,
    showContext = false,
  } = options;

  if (tasks.length === 0) {
    return colors ? chalk.yellow('No tasks found') : 'No tasks found';
  }

  const output: string[] = [];

  // Header
  const completedCount = tasks.filter((t) => t.completed).length;
  const incompleteCount = tasks.length - completedCount;

  if (colors) {
    output.push(chalk.bold.blue(`\nFound ${tasks.length} tasks`));
    output.push(
      chalk.green(`  ✓ ${completedCount} completed`) +
        chalk.gray(' | ') +
        chalk.yellow(`○ ${incompleteCount} incomplete`),
    );
    output.push('');
  } else {
    output.push(`\nFound ${tasks.length} tasks`);
    output.push(
      `  ✓ ${completedCount} completed | ○ ${incompleteCount} incomplete`,
    );
    output.push('');
  }

  // Tasks
  for (const task of tasks) {
    const parts: string[] = [];

    // Checkbox
    const checkbox = task.completed
      ? colors
        ? chalk.green('✓')
        : '✓'
      : colors
        ? chalk.gray('○')
        : '○';
    parts.push(checkbox);

    // Priority indicator
    if (task.priority) {
      const priorityMark = getPriorityMark(task.priority, colors);
      parts.push(priorityMark);
    }

    // Task text
    const text = colors ? chalk.white(task.text) : task.text;
    parts.push(text);

    // Assignee
    if (task.assignee) {
      const assignee = colors
        ? chalk.cyan(`@${task.assignee}`)
        : `@${task.assignee}`;
      parts.push(assignee);
    }

    // Due date
    if (task.dueDate) {
      const dueText = formatDueDate(task.dueDate, task.completed, colors);
      parts.push(dueText);
    }

    // Tags
    if (task.tags.length > 0) {
      const tagText = task.tags
        .map((tag) => (colors ? chalk.blue(`#${tag}`) : `#${tag}`))
        .join(' ');
      parts.push(tagText);
    }

    output.push('  ' + parts.join(' '));

    // Context information (if enabled)
    if (showContext) {
      const contextParts: string[] = [];

      if (task.project) {
        contextParts.push(
          colors
            ? chalk.magenta(`project:${task.project}`)
            : `project:${task.project}`,
        );
      }

      if (task.person) {
        contextParts.push(
          colors
            ? chalk.magenta(`person:${task.person}`)
            : `person:${task.person}`,
        );
      }

      if (task.contextHeading) {
        contextParts.push(
          colors ? chalk.gray(task.contextHeading) : task.contextHeading,
        );
      }

      if (contextParts.length > 0) {
        output.push(
          '    ' +
            (colors
              ? chalk.dim(contextParts.join(' | '))
              : contextParts.join(' | ')),
        );
      }
    }

    // File path
    if (showFilePaths) {
      const filePath = formatFilePath(
        task.file,
        task.line,
        vscodeLinks,
        colors,
      );
      output.push('    ' + filePath);
    }

    output.push(''); // Empty line between tasks
  }

  return output.join('\n');
}

/**
 * Format tasks as a table
 *
 * @param tasks - Tasks to format
 * @param options - Formatting options
 * @returns Formatted table string
 */
export function formatAsTable(
  tasks: Task[],
  options: PrettyFormatOptions = {},
): string {
  const { colors = true } = options;

  if (tasks.length === 0) {
    return colors ? chalk.yellow('No tasks found') : 'No tasks found';
  }

  const table = new Table({
    head: [
      colors ? chalk.bold('Status') : 'Status',
      colors ? chalk.bold('Priority') : 'Priority',
      colors ? chalk.bold('Task') : 'Task',
      colors ? chalk.bold('Assignee') : 'Assignee',
      colors ? chalk.bold('Due') : 'Due',
      colors ? chalk.bold('File') : 'File',
    ],
    style: {
      head: colors ? [] : [],
      border: colors ? ['gray'] : [],
    },
  });

  for (const task of tasks) {
    table.push([
      task.completed
        ? colors
          ? chalk.green('✓')
          : '✓'
        : colors
          ? chalk.gray('○')
          : '○',
      task.priority ? getPriorityMark(task.priority, colors) : '',
      colors ? chalk.white(task.text) : task.text,
      task.assignee
        ? colors
          ? chalk.cyan(`@${task.assignee}`)
          : `@${task.assignee}`
        : '',
      task.dueDate ? formatDueDate(task.dueDate, task.completed, colors) : '',
      `${task.file}:${task.line}`,
    ]);
  }

  return table.toString();
}

/**
 * Get priority mark with optional color
 */
function getPriorityMark(priority: string, colors: boolean): string {
  switch (priority) {
    case 'urgent':
      return colors ? chalk.red('!!!') : '!!!';
    case 'high':
      return colors ? chalk.yellow('!!') : '!!';
    case 'normal':
      return colors ? chalk.blue('!') : '!';
    default:
      return '';
  }
}

/**
 * Format due date with color coding
 */
function formatDueDate(
  dueDate: Date,
  completed: boolean,
  colors: boolean,
): string {
  const now = new Date();
  const relative = formatDistanceToNow(dueDate, { addSuffix: true });

  const text = `due ${relative}`;
  const isOverdue = dueDate < now && !completed;

  if (!colors) {
    return isOverdue ? `${text} (overdue)` : text;
  }

  if (isOverdue) {
    return chalk.red.bold(text);
  } else if (completed) {
    return chalk.gray(text);
  } else {
    return chalk.green(text);
  }
}

/**
 * Format file path with optional VSCode link
 */
function formatFilePath(
  file: string,
  line: number,
  vscodeLink: boolean,
  colors: boolean,
): string {
  const pathText = `${file}:${line}`;

  if (vscodeLink) {
    // VSCode terminal recognizes this format and makes it clickable
    const link = `file://${process.cwd()}/${file}:${line}`;
    return colors ? chalk.dim.underline(link) : link;
  }

  return colors ? chalk.dim(pathText) : pathText;
}
