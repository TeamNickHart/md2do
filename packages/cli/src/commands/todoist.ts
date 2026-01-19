import { Command } from 'commander';
import { loadConfig } from '@md2do/config';
import { TodoistClient } from '@md2do/todoist';
import type { Task as TodoistTask } from '@doist/todoist-api-typescript';

interface TodoistListOptions {
  project?: string;
  limit?: number;
  format?: string;
}

/**
 * Create the todoist command group
 */
export function createTodoistCommand(): Command {
  const command = new Command('todoist');

  command.description('Manage Todoist integration');

  // Add subcommands
  command.addCommand(createTodoistListCommand());

  return command;
}

/**
 * Create the 'todoist list' subcommand
 */
function createTodoistListCommand(): Command {
  const command = new Command('list');

  command
    .description('List tasks from Todoist')
    .option('--project <name>', 'Filter by project name')
    .option('--limit <n>', 'Limit number of results', parseInt)
    .option('-f, --format <type>', 'Output format (pretty|json)', 'pretty')
    .action(async (options: TodoistListOptions) => {
      try {
        await todoistListAction(options);
      } catch (error) {
        console.error(
          'Error:',
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    });

  return command;
}

/**
 * Action handler for 'todoist list' command
 */
async function todoistListAction(options: TodoistListOptions): Promise<void> {
  // Load configuration
  const config = await loadConfig();

  // Validate API token
  if (!config.todoist?.apiToken) {
    console.error('❌ Error: Todoist API token not configured');
    console.error('');
    console.error('Please set your API token using one of these methods:');
    console.error(
      '  1. Environment variable: export TODOIST_API_TOKEN=<token>',
    );
    console.error('  2. Global config: ~/.md2do.json or ~/.md2do.yaml');
    console.error('  3. Project config: .md2do.json or .md2do.yaml');
    console.error('');
    console.error(
      'See docs/todoist-setup.md for instructions on generating a token.',
    );
    process.exit(1);
  }

  // Create client
  const client = new TodoistClient({ apiToken: config.todoist.apiToken });

  // Find project ID if project name provided
  let projectId: string | undefined;
  if (options.project) {
    const project = await client.findProjectByName(options.project);
    if (!project) {
      console.error(`❌ Error: Project "${options.project}" not found`);
      process.exit(1);
    }
    projectId = project.id;
  } else if (config.todoist.defaultProject) {
    // Use default project from config
    const project = await client.findProjectByName(
      config.todoist.defaultProject,
    );
    if (project) {
      projectId = project.id;
    }
  }

  // Fetch tasks
  const tasks = await client.getTasks(projectId ? { projectId } : undefined);

  // Apply limit
  const limitedTasks = options.limit ? tasks.slice(0, options.limit) : tasks;

  // Format and display
  if (options.format === 'json') {
    formatAsJsonTodoist(limitedTasks);
  } else {
    formatAsPrettyTodoist(
      limitedTasks,
      options.project || config.todoist.defaultProject,
    );
  }
}

/**
 * Format Todoist tasks as JSON
 */
function formatAsJsonTodoist(tasks: TodoistTask[]): void {
  console.log(
    JSON.stringify(
      {
        tasks: tasks.map((t) => ({
          id: t.id,
          content: t.content,
          description: t.description,
          completed: t.isCompleted,
          priority: t.priority,
          due: t.due?.date,
          labels: t.labels,
          projectId: t.projectId,
          url: t.url,
        })),
        metadata: {
          total: tasks.length,
          completed: tasks.filter((t) => t.isCompleted).length,
          incomplete: tasks.filter((t) => !t.isCompleted).length,
        },
      },
      null,
      2,
    ),
  );
}

/**
 * Format Todoist tasks as pretty output
 */
function formatAsPrettyTodoist(
  tasks: TodoistTask[],
  projectName?: string,
): void {
  const completed = tasks.filter((t) => t.isCompleted).length;
  const incomplete = tasks.filter((t) => !t.isCompleted).length;

  // Header
  console.log('');
  if (projectName) {
    console.log(`📋 Todoist tasks from "${projectName}"`);
  } else {
    console.log('📋 Todoist tasks');
  }
  console.log(`Found ${tasks.length} tasks`);
  console.log(`  ✓ ${completed} completed | ○ ${incomplete} incomplete`);
  console.log('');

  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  // Sort by priority (higher priority first)
  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);

  // Display tasks
  for (const task of sortedTasks) {
    const checkbox = task.isCompleted ? '✓' : '○';
    const priority = formatPriority(task.priority);
    const labels =
      task.labels.length > 0
        ? ` ${task.labels.map((l: string) => `#${l}`).join(' ')}`
        : '';
    const due = task.due?.date ? ` (${task.due.date})` : '';

    console.log(`  ${checkbox} ${priority}${task.content}${due}${labels}`);
    console.log(`    ${task.url}`);
    console.log('');
  }
}

/**
 * Format Todoist priority as visual indicator
 */
function formatPriority(priority: number): string {
  switch (priority) {
    case 4:
      return '!!! '; // urgent
    case 3:
      return '!! '; // high
    case 2:
      return '! '; // normal
    default:
      return ''; // low
  }
}
