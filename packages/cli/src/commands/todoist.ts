import { Command } from 'commander';
import { loadConfig } from '@md2do/config';
import {
  TodoistClient,
  md2doToTodoistPriority,
  md2doToTodoist,
  todoistToMd2do,
} from '@md2do/todoist';
import { parseTask, updateTask } from '@md2do/core';
import type { Task as TodoistTask } from '@doist/todoist-api-typescript';
import type { Task } from '@md2do/core';
import { scanMarkdownFiles } from '../scanner.js';
import fs from 'fs/promises';

interface TodoistListOptions {
  project?: string;
  limit?: number;
  format?: string;
}

interface TodoistAddOptions {
  project?: string;
  priority?: string;
  due?: string;
  labels?: string;
}

interface TodoistImportOptions {
  project?: string;
}

interface TodoistSyncOptions {
  path?: string;
  dryRun?: boolean;
  direction?: 'push' | 'pull' | 'both';
  force?: boolean;
}

/**
 * Create the todoist command group
 */
export function createTodoistCommand(): Command {
  const command = new Command('todoist');

  command.description('Manage Todoist integration');

  // Add subcommands
  command.addCommand(createTodoistListCommand());
  command.addCommand(createTodoistAddCommand());
  command.addCommand(createTodoistImportCommand());
  command.addCommand(createTodoistSyncCommand());

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

/**
 * Create the 'todoist add' subcommand
 */
function createTodoistAddCommand(): Command {
  const command = new Command('add');

  command
    .description('Create a task directly in Todoist')
    .argument('<task>', 'Task content')
    .option('--project <name>', 'Project name')
    .option('--priority <level>', 'Priority: urgent|high|normal|low', 'normal')
    .option(
      '--due <date>',
      'Due date (YYYY-MM-DD, "today", "tomorrow", or natural language)',
    )
    .option('--labels <tags>', 'Comma-separated labels')
    .action(async (taskContent: string, options: TodoistAddOptions) => {
      try {
        await todoistAddAction(taskContent, options);
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
 * Action handler for 'todoist add' command
 */
async function todoistAddAction(
  taskContent: string,
  options: TodoistAddOptions,
): Promise<void> {
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
  const projectName =
    options.project || config.todoist.defaultProject || 'Inbox';
  const project = await client.findProjectByName(projectName);
  if (project) {
    projectId = project.id;
  } else if (options.project) {
    console.error(`❌ Error: Project "${options.project}" not found`);
    process.exit(1);
  }

  // Parse labels
  const labels = options.labels
    ? options.labels.split(',').map((l) => l.trim())
    : [];

  // Ensure labels exist
  for (const labelName of labels) {
    await client.ensureLabel(labelName);
  }

  // Create task
  const priority = md2doToTodoistPriority(options.priority);
  const taskParams: Record<string, string | number | string[]> = {
    content: taskContent,
    priority,
    labels,
  };

  if (options.due) {
    taskParams.due_string = options.due;
  }

  if (projectId) {
    taskParams.project_id = projectId;
  }

  const task = await client.createTask(taskParams);

  // Display success
  console.log('');
  console.log('✅ Task created in Todoist!');
  console.log('');
  console.log(`  Content: ${task.content}`);
  console.log(`  Priority: ${formatPriority(task.priority).trim() || 'low'}`);
  console.log(`  Project: ${projectName}`);
  if (task.due?.date) {
    console.log(`  Due: ${task.due.date}`);
  }
  if (task.labels.length > 0) {
    console.log(`  Labels: ${task.labels.join(', ')}`);
  }
  console.log('');
  console.log(`  View in Todoist: ${task.url}`);
  console.log('');
}

/**
 * Create the 'todoist import' subcommand
 */
function createTodoistImportCommand(): Command {
  const command = new Command('import');

  command
    .description('Import a markdown task to Todoist and write back the ID')
    .argument('<location>', 'File location in format: <file>:<line>')
    .option('--project <name>', 'Project name (overrides config default)')
    .action(async (location: string, options: TodoistImportOptions) => {
      try {
        await todoistImportAction(location, options);
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
 * Action handler for 'todoist import' command
 */
async function todoistImportAction(
  location: string,
  options: TodoistImportOptions,
): Promise<void> {
  // Parse location
  const parts = location.split(':');
  if (parts.length !== 2) {
    console.error('❌ Error: Invalid location format. Expected <file>:<line>');
    console.error('   Example: tasks.md:15');
    process.exit(1);
  }

  const file = parts[0];
  const lineStr = parts[1];

  if (!file || !lineStr) {
    console.error('❌ Error: Invalid location format. Expected <file>:<line>');
    console.error('   Example: tasks.md:15');
    process.exit(1);
  }

  const line = parseInt(lineStr, 10);

  if (isNaN(line) || line < 1) {
    console.error(`❌ Error: Invalid line number: ${lineStr}`);
    process.exit(1);
  }

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

  // Read file
  let content: string;
  try {
    content = await fs.readFile(file, 'utf-8');
  } catch (error) {
    console.error(`❌ Error: Could not read file: ${file}`);
    console.error(
      `   ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }

  const lines = content.split('\n');
  if (line > lines.length) {
    console.error(`❌ Error: Line ${line} does not exist in ${file}`);
    console.error(`   File has ${lines.length} lines`);
    process.exit(1);
  }

  const lineContent = lines[line - 1];
  if (!lineContent) {
    console.error(`❌ Error: Line ${line} is empty`);
    process.exit(1);
  }

  // Parse task from line
  const parseResult = parseTask(lineContent, line, file, {});
  if (!parseResult.task) {
    console.error(`❌ Error: Line ${line} is not a task`);
    console.error(`   Line content: ${lineContent}`);
    process.exit(1);
  }

  const task = parseResult.task;

  // Check if already has Todoist ID
  if (task.todoistId) {
    console.error(`❌ Error: Task already has a Todoist ID: ${task.todoistId}`);
    console.error("   Use 'md2do todoist sync' to sync existing tasks");
    process.exit(1);
  }

  // Create client
  const client = new TodoistClient({ apiToken: config.todoist.apiToken });

  // Find project ID
  let projectId: string | undefined;
  const projectName =
    options.project || config.todoist.defaultProject || 'Inbox';
  const project = await client.findProjectByName(projectName);
  if (project) {
    projectId = project.id;
  } else if (options.project) {
    console.error(`❌ Error: Project "${options.project}" not found`);
    process.exit(1);
  }

  // Convert task to Todoist format
  const todoistParams = md2doToTodoist(task, projectId);

  // Ensure labels exist
  if (todoistParams.labels) {
    for (const labelName of todoistParams.labels) {
      await client.ensureLabel(labelName);
    }
  }

  // Create task in Todoist
  const todoistTask = await client.createTask(todoistParams);

  // Update markdown file with Todoist ID
  const updateResult = await updateTask({
    file: file,
    line,
    updates: {
      text: `${task.text} [todoist:${todoistTask.id}]`,
    },
  });

  if (!updateResult.success) {
    console.error(`❌ Error: Failed to update ${file}:${line}`);
    console.error(`   ${updateResult.error}`);
    process.exit(1);
  }

  // Display success
  console.log('');
  console.log('✅ Task imported to Todoist!');
  console.log('');
  console.log(`  Content: ${todoistTask.content}`);
  console.log(
    `  Priority: ${formatPriority(todoistTask.priority).trim() || 'low'}`,
  );
  console.log(`  Project: ${projectName}`);
  if (todoistTask.due?.date) {
    console.log(`  Due: ${todoistTask.due.date}`);
  }
  if (todoistTask.labels.length > 0) {
    console.log(`  Labels: ${todoistTask.labels.join(', ')}`);
  }
  console.log('');
  console.log(`  Todoist ID: ${todoistTask.id}`);
  console.log(`  Updated: ${file}:${line}`);
  console.log(`  View in Todoist: ${todoistTask.url}`);
  console.log('');
}

/**
 * Create the 'todoist sync' subcommand
 */
function createTodoistSyncCommand(): Command {
  const command = new Command('sync');

  command
    .description('Bidirectional sync between markdown and Todoist')
    .option('-p, --path <path>', 'Path to sync (default: current directory)')
    .option('--dry-run', 'Show what would be synced without making changes')
    .option('--direction <dir>', 'Sync direction: push|pull|both', 'both')
    .option('--force', 'Skip confirmation prompts')
    .action(async (options: TodoistSyncOptions) => {
      try {
        await todoistSyncAction(options);
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
 * Action handler for 'todoist sync' command
 */
async function todoistSyncAction(options: TodoistSyncOptions): Promise<void> {
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

  console.log('');
  console.log('🔄 Scanning markdown files...');

  // Scan markdown files
  const scanResult = await scanMarkdownFiles({
    root: options.path || process.cwd(),
    pattern: config.markdown?.pattern || '**/*.md',
    exclude: config.markdown?.exclude || [],
  });

  // Filter tasks with Todoist IDs
  const tasksWithTodoist = scanResult.tasks.filter((t) => t.todoistId);

  if (tasksWithTodoist.length === 0) {
    console.log('');
    console.log('No tasks with Todoist IDs found.');
    console.log('');
    console.log("Tip: Use 'md2do todoist import <file>:<line>' to link tasks");
    console.log('');
    return;
  }

  console.log(`Found ${tasksWithTodoist.length} tasks with Todoist IDs`);
  console.log('');
  console.log('🔍 Fetching tasks from Todoist...');

  // Fetch corresponding Todoist tasks
  const todoistTasks = new Map<string, TodoistTask>();
  const notFoundIds: string[] = [];

  for (const task of tasksWithTodoist) {
    try {
      const todoistTask = await client.getTask(task.todoistId!);
      todoistTasks.set(task.todoistId!, todoistTask);
    } catch (error) {
      // Task not found in Todoist (deleted)
      notFoundIds.push(task.todoistId!);
    }
  }

  console.log(`Retrieved ${todoistTasks.size} tasks from Todoist`);
  if (notFoundIds.length > 0) {
    console.log(`${notFoundIds.length} tasks not found (deleted in Todoist)`);
  }
  console.log('');

  // Detect changes
  const updates: Array<{
    type: 'pull' | 'push';
    task: Task;
    todoistTask?: TodoistTask;
    reason: string;
  }> = [];

  for (const mdTask of tasksWithTodoist) {
    const todoistTask = todoistTasks.get(mdTask.todoistId!);

    if (!todoistTask) {
      // Task deleted in Todoist
      if (options.direction === 'pull' || options.direction === 'both') {
        updates.push({
          type: 'pull',
          task: mdTask,
          reason: 'Task deleted in Todoist',
        });
      }
      continue;
    }

    // Check for differences
    const completionDiffers = mdTask.completed !== todoistTask.isCompleted;

    if (completionDiffers) {
      if (options.direction === 'pull' || options.direction === 'both') {
        // Todoist wins for completion status
        updates.push({
          type: 'pull',
          task: mdTask,
          todoistTask,
          reason: todoistTask.isCompleted
            ? 'Mark as completed'
            : 'Mark as incomplete',
        });
      }
    }
  }

  // Display results
  if (updates.length === 0) {
    console.log('✅ Everything is in sync!');
    console.log('');
    return;
  }

  console.log(`📋 Found ${updates.length} changes to sync:`);
  console.log('');

  for (const update of updates) {
    const arrow = update.type === 'pull' ? '←' : '→';
    console.log(`  ${arrow} ${update.task.file}:${update.task.line}`);
    console.log(`     ${update.reason}`);
    console.log(`     ${update.task.text.substring(0, 60)}...`);
    console.log('');
  }

  if (options.dryRun) {
    console.log('🔍 Dry run - no changes made');
    console.log('');
    return;
  }

  // Execute sync
  console.log('🔄 Syncing tasks...');
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    try {
      if (update.type === 'pull' && update.todoistTask) {
        // Update markdown from Todoist
        const mdUpdate = todoistToMd2do(update.todoistTask);
        const result = await updateTask({
          file: update.task.file,
          line: update.task.line,
          updates: {
            completed: mdUpdate.completed,
          },
        });

        if (result.success) {
          console.log(`  ✓ ${update.task.file}:${update.task.line}`);
          successCount++;
        } else {
          console.log(`  ✗ ${update.task.file}:${update.task.line}`);
          console.log(`    Error: ${result.error}`);
          errorCount++;
        }
      } else if (update.type === 'pull' && !update.todoistTask) {
        // Remove Todoist ID from deleted task
        const result = await updateTask({
          file: update.task.file,
          line: update.task.line,
          updates: {
            text: update.task.text.replace(/\s*\[todoist:\d+\]/, ''),
          },
        });

        if (result.success) {
          console.log(
            `  ✓ ${update.task.file}:${update.task.line} (removed ID)`,
          );
          successCount++;
        } else {
          console.log(`  ✗ ${update.task.file}:${update.task.line}`);
          console.log(`    Error: ${result.error}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.log(`  ✗ ${update.task.file}:${update.task.line}`);
      console.log(
        `    Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      errorCount++;
    }
  }

  console.log('');
  console.log(
    `✅ Sync complete: ${successCount} succeeded, ${errorCount} failed`,
  );
  console.log('');
}
