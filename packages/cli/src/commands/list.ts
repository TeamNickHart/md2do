import { Command } from 'commander';
import { filters, sorting } from '@md2do/core';
import { scanMarkdownFiles } from '../scanner.js';
import { formatAsPretty, formatAsTable } from '../formatters/pretty.js';
import { formatAsJson } from '../formatters/json.js';

interface ListCommandOptions {
  path?: string;
  pattern?: string;
  exclude?: string[];
  completed?: boolean;
  incomplete?: boolean;
  assignee?: string;
  priority?: string;
  project?: string;
  person?: string;
  tag?: string;
  overdue?: boolean;
  dueToday?: boolean;
  dueThisWeek?: boolean;
  dueWithin?: number;
  sort?: string;
  reverse?: boolean;
  format?: string;
  colors?: boolean;
  paths?: boolean;
  context?: boolean;
}

export function createListCommand(): Command {
  const command = new Command('list');

  command
    .description('List tasks from markdown files')
    .option('-p, --path <path>', 'Path to scan (defaults to current directory)')
    .option('--pattern <pattern>', 'Glob pattern for markdown files', '**/*.md')
    .option('--exclude <patterns...>', 'Patterns to exclude from scanning')

    // Status filters
    .option('--completed', 'Show only completed tasks')
    .option('--incomplete', 'Show only incomplete tasks')

    // Assignee filter
    .option('-a, --assignee <username>', 'Filter by assignee')

    // Priority filter
    .option('--priority <level>', 'Filter by priority (urgent|high|normal|low)')

    // Project/Person filters
    .option('--project <name>', 'Filter by project')
    .option('--person <name>', 'Filter by person (from 1-1 files)')

    // Tag filter
    .option('-t, --tag <tag>', 'Filter by tag')

    // Due date filters
    .option('--overdue', 'Show only overdue tasks')
    .option('--due-today', 'Show tasks due today')
    .option('--due-this-week', 'Show tasks due this week')
    .option('--due-within <days>', 'Show tasks due within N days', parseInt)

    // Sorting
    .option(
      '-s, --sort <field>',
      'Sort by field (due|priority|created|file|project|assignee)',
      'file',
    )
    .option('--reverse', 'Reverse sort order')

    // Output format
    .option(
      '-f, --format <type>',
      'Output format (pretty|table|json)',
      'pretty',
    )
    .option('--no-colors', 'Disable colors in output')
    .option('--no-paths', 'Hide file paths')
    .option('--context', 'Show context information (project, person, heading)')

    .action(async (options: ListCommandOptions) => {
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

        if (options.completed !== undefined) {
          taskFilters.push(filters.byCompleted(true));
        }

        if (options.incomplete !== undefined) {
          taskFilters.push(filters.byCompleted(false));
        }

        if (options.assignee) {
          taskFilters.push(filters.byAssignee(options.assignee));
        }

        if (options.priority) {
          const priority = options.priority as
            | 'urgent'
            | 'high'
            | 'normal'
            | 'low';
          taskFilters.push(filters.byPriority(priority));
        }

        if (options.project) {
          taskFilters.push(filters.byProject(options.project));
        }

        if (options.person) {
          taskFilters.push(filters.byPerson(options.person));
        }

        if (options.tag) {
          taskFilters.push(filters.byTag(options.tag));
        }

        if (options.overdue) {
          taskFilters.push(filters.isOverdue());
        }

        if (options.dueToday) {
          taskFilters.push(filters.isDueToday());
        }

        if (options.dueThisWeek) {
          taskFilters.push(filters.isDueThisWeek());
        }

        if (options.dueWithin) {
          taskFilters.push(filters.isDueWithinDays(options.dueWithin));
        }

        // Apply all filters
        if (taskFilters.length > 0) {
          tasks = tasks.filter(filters.combineFilters(taskFilters));
        }

        // Apply sorting
        let comparator: sorting.TaskComparator;

        switch (options.sort) {
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

        if (options.reverse) {
          comparator = sorting.reverse(comparator);
        }

        tasks.sort(comparator);

        // Format output
        let output: string;

        switch (options.format) {
          case 'json':
            output = formatAsJson(tasks);
            break;
          case 'table':
            output = formatAsTable(tasks, {
              showFilePaths: options.paths ?? true,
              colors: options.colors ?? true,
              vscodeLinks: true,
              showContext: options.context ?? false,
            });
            break;
          case 'pretty':
          default:
            output = formatAsPretty(tasks, {
              showFilePaths: options.paths ?? true,
              colors: options.colors ?? true,
              vscodeLinks: true,
              showContext: options.context ?? false,
            });
            break;
        }

        console.log(output);

        // Show warnings if any
        if (scanResult.warnings.length > 0) {
          console.error(
            `\n⚠️  ${scanResult.warnings.length} warnings encountered during scanning`,
          );
          for (const warning of scanResult.warnings.slice(0, 5)) {
            console.error(
              `  ${warning.file}:${warning.line} - ${warning.reason}`,
            );
          }
          if (scanResult.warnings.length > 5) {
            console.error(
              `  ... and ${scanResult.warnings.length - 5} more warnings`,
            );
          }
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}
