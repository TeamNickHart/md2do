import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import type { Task } from '@md2do/core';
import { scanMarkdownFiles } from '../scanner.js';
import { filters } from '@md2do/core';

interface StatsCommandOptions {
  path?: string;
  pattern?: string;
  exclude?: string[];
  by?: string;
  assignee?: string;
  project?: string;
  colors?: boolean;
}

export function createStatsCommand(): Command {
  const command = new Command('stats');

  command
    .description('Show task statistics')
    .option('-p, --path <path>', 'Path to scan (defaults to current directory)')
    .option('--pattern <pattern>', 'Glob pattern for markdown files', '**/*.md')
    .option('--exclude <patterns...>', 'Patterns to exclude from scanning')
    .option(
      '--by <field>',
      'Group by field (assignee|project|person|priority|tag)',
    )
    .option('-a, --assignee <username>', 'Filter by assignee')
    .option('--project <name>', 'Filter by project')
    .option('--no-colors', 'Disable colors in output')
    .action(async (options: StatsCommandOptions) => {
      try {
        // Scan markdown files
        const scanResult = await scanMarkdownFiles({
          root: options.path || process.cwd(),
          ...(options.pattern !== undefined && { pattern: options.pattern }),
          ...(options.exclude !== undefined && { exclude: options.exclude }),
        });

        let tasks = scanResult.tasks;

        // Apply filters
        const taskFilters: filters.TaskFilter[] = [];

        if (options.assignee) {
          taskFilters.push(filters.byAssignee(options.assignee));
        }

        if (options.project) {
          taskFilters.push(filters.byProject(options.project));
        }

        if (taskFilters.length > 0) {
          tasks = tasks.filter(filters.combineFilters(taskFilters));
        }

        // Display statistics
        if (options.by) {
          showGroupedStats(tasks, options.by, options.colors ?? true);
        } else {
          showOverallStats(
            tasks,
            scanResult.metadata.filesScanned,
            options.colors ?? true,
          );
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}

/**
 * Show overall task statistics
 */
function showOverallStats(
  tasks: Task[],
  filesScanned: number,
  colors: boolean,
): void {
  const completed = tasks.filter((t) => t.completed).length;
  const incomplete = tasks.filter((t) => !t.completed).length;

  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < new Date(),
  ).length;

  const dueToday = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const today = new Date();
    return (
      t.dueDate.getDate() === today.getDate() &&
      t.dueDate.getMonth() === today.getMonth() &&
      t.dueDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const title = colors
    ? chalk.bold.blue('md2do Statistics')
    : 'md2do Statistics';

  console.log(`\n${title}`);
  console.log('─'.repeat(40));
  console.log();

  // Overall
  console.log(colors ? chalk.bold('Overall:') : 'Overall:');
  console.log(`  Files scanned: ${filesScanned}`);
  console.log(`  Total tasks: ${tasks.length}`);
  console.log(`  ${colors ? chalk.green('✓') : '✓'} Completed: ${completed}`);
  console.log(
    `  ${colors ? chalk.yellow('○') : '○'} Incomplete: ${incomplete}`,
  );
  console.log();

  // Status
  if (incomplete > 0) {
    console.log(colors ? chalk.bold('Status:') : 'Status:');
    if (overdue > 0) {
      console.log(`  ${colors ? chalk.red('●') : '●'} Overdue: ${overdue}`);
    }
    if (dueToday > 0) {
      console.log(
        `  ${colors ? chalk.yellow('●') : '●'} Due today: ${dueToday}`,
      );
    }
    console.log();
  }

  // By Priority
  const priorityStats = getPriorityStats(tasks);
  if (
    priorityStats.urgent +
      priorityStats.high +
      priorityStats.normal +
      priorityStats.low >
    0
  ) {
    console.log(colors ? chalk.bold('By Priority:') : 'By Priority:');
    if (priorityStats.urgent > 0) {
      console.log(
        `  ${colors ? chalk.red('!!!') : '!!!'} Urgent: ${priorityStats.urgent}`,
      );
    }
    if (priorityStats.high > 0) {
      console.log(
        `  ${colors ? chalk.yellow('!!') : '!!'} High: ${priorityStats.high}`,
      );
    }
    if (priorityStats.normal > 0) {
      console.log(
        `  ${colors ? chalk.blue('!') : '!'} Normal: ${priorityStats.normal}`,
      );
    }
    if (priorityStats.low > 0) {
      console.log(
        `  ${colors ? chalk.gray('○') : '○'} Low: ${priorityStats.low}`,
      );
    }
    console.log();
  }

  // By Assignee
  const assigneeStats = groupBy(tasks, 'assignee');
  if (Object.keys(assigneeStats).length > 0) {
    console.log(colors ? chalk.bold('By Assignee:') : 'By Assignee:');
    for (const [assignee, count] of Object.entries(assigneeStats).sort(
      ([, a], [, b]) => b - a,
    )) {
      const name = assignee || '(unassigned)';
      console.log(
        `  ${colors ? chalk.cyan(`@${name}`) : `@${name}`}: ${count}`,
      );
    }
    console.log();
  }

  // By Project
  const projectStats = groupBy(tasks, 'project');
  if (Object.keys(projectStats).length > 0) {
    console.log(colors ? chalk.bold('By Project:') : 'By Project:');
    for (const [project, count] of Object.entries(projectStats).sort(
      ([, a], [, b]) => b - a,
    )) {
      const name = project || '(no project)';
      console.log(`  ${name}: ${count}`);
    }
    console.log();
  }
}

/**
 * Show statistics grouped by a specific field
 */
function showGroupedStats(
  tasks: Task[],
  groupBy: string,
  colors: boolean,
): void {
  const title = colors
    ? chalk.bold.blue(`Task Statistics by ${groupBy}`)
    : `Task Statistics by ${groupBy}`;

  console.log(`\n${title}`);
  console.log('─'.repeat(60));
  console.log();

  const table = new Table({
    head: [
      colors ? chalk.bold(capitalize(groupBy)) : capitalize(groupBy),
      colors ? chalk.bold('Total') : 'Total',
      colors ? chalk.bold('Completed') : 'Completed',
      colors ? chalk.bold('Incomplete') : 'Incomplete',
      colors ? chalk.bold('Overdue') : 'Overdue',
    ],
    style: {
      head: colors ? [] : [],
      border: colors ? ['gray'] : [],
    },
  });

  // Group tasks
  const groups = new Map<string, Task[]>();

  for (const task of tasks) {
    let key: string;

    switch (groupBy) {
      case 'assignee':
        key = task.assignee || '(unassigned)';
        break;
      case 'project':
        key = task.project || '(no project)';
        break;
      case 'person':
        key = task.person || '(no person)';
        break;
      case 'priority':
        key = task.priority || 'low';
        break;
      case 'tag':
        // For tags, add task to multiple groups
        if (task.tags.length === 0) {
          key = '(no tags)';
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(task);
        } else {
          for (const tag of task.tags) {
            if (!groups.has(tag)) groups.set(tag, []);
            groups.get(tag)!.push(task);
          }
        }
        continue;
      default:
        key = '(unknown)';
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(task);
  }

  // Calculate stats for each group
  const stats: Array<{
    name: string;
    total: number;
    completed: number;
    incomplete: number;
    overdue: number;
  }> = [];

  for (const [name, groupTasks] of groups.entries()) {
    const completed = groupTasks.filter((t) => t.completed).length;
    const incomplete = groupTasks.length - completed;
    const overdue = groupTasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < new Date(),
    ).length;

    stats.push({
      name,
      total: groupTasks.length,
      completed,
      incomplete,
      overdue,
    });
  }

  // Sort by total (descending)
  stats.sort((a, b) => b.total - a.total);

  // Add rows to table
  for (const stat of stats) {
    table.push([
      stat.name,
      stat.total.toString(),
      colors
        ? chalk.green(stat.completed.toString())
        : stat.completed.toString(),
      colors
        ? chalk.yellow(stat.incomplete.toString())
        : stat.incomplete.toString(),
      stat.overdue > 0
        ? colors
          ? chalk.red(stat.overdue.toString())
          : stat.overdue.toString()
        : '0',
    ]);
  }

  console.log(table.toString());
  console.log();
}

/**
 * Get priority statistics
 */
function getPriorityStats(tasks: Task[]): {
  urgent: number;
  high: number;
  normal: number;
  low: number;
} {
  return {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    normal: tasks.filter((t) => t.priority === 'normal').length,
    low: tasks.filter((t) => !t.priority).length,
  };
}

/**
 * Group tasks by a field
 */
function groupBy(tasks: Task[], field: keyof Task): Record<string, number> {
  const groups: Record<string, number> = {};

  for (const task of tasks) {
    const value = task[field];
    const key = value !== undefined ? String(value) : '';

    if (!groups[key]) {
      groups[key] = 0;
    }
    groups[key]++;
  }

  return groups;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
