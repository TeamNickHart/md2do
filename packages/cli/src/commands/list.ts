import { Command } from 'commander';
import { filters, sorting, filterWarnings } from '@md2do/core';
import { loadConfig, DEFAULT_CONFIG } from '@md2do/config';
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
  warnings?: boolean;
  allWarnings?: boolean;
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

    // Warning options
    .option('--no-warnings', 'Hide all warnings')
    .option('--all-warnings', 'Show all warnings (default shows first 5)')

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

        // Load config and apply warning filters (unless --no-warnings overrides)
        if (options.warnings !== false) {
          const config = await loadConfig({
            cwd: options.path || process.cwd(),
          });
          const warningConfig = config.warnings ?? DEFAULT_CONFIG.warnings;

          // Apply config-based filtering
          const filteredWarnings = filterWarnings(
            scanResult.warnings,
            warningConfig ?? {},
          );

          // Show warnings if any remain after filtering
          if (filteredWarnings.length > 0) {
            console.error(
              `\n⚠️  ${filteredWarnings.length} warning${filteredWarnings.length > 1 ? 's' : ''} encountered during scanning`,
            );

            // Show all warnings if --all-warnings, otherwise show first 5
            const warningsToShow = options.allWarnings
              ? filteredWarnings
              : filteredWarnings.slice(0, 5);

            for (const warning of warningsToShow) {
              // Use message field (new) or fallback to reason (legacy)
              const message =
                warning.message || warning.reason || 'Unknown warning';
              console.error(`  ${warning.file}:${warning.line} - ${message}`);
            }

            if (!options.allWarnings && filteredWarnings.length > 5) {
              console.error(
                `  ... and ${filteredWarnings.length - 5} more warning${filteredWarnings.length - 5 > 1 ? 's' : ''} (use --all-warnings to see all)`,
              );
            }
          }
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}
