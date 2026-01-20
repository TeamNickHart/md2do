# @md2do/todoist

Todoist API integration for md2do, providing bidirectional task synchronization between markdown files and Todoist.

## Features

- 🔄 **Bidirectional Task Mapping** - Convert between md2do and Todoist task formats
- 🎯 **Priority Conversion** - Map semantic priorities (urgent/high/normal/low) to Todoist priorities (4/3/2/1)
- 📅 **Date Handling** - UTC-aware date parsing and formatting
- 🏷️ **Label Management** - Automatic label creation and mapping
- 🔌 **Official SDK** - Built on `@doist/todoist-api-typescript`
- ✅ **Type Safe** - Full TypeScript support with strict mode
- 🧪 **Well Tested** - 31 tests with comprehensive coverage

## Getting Your Todoist API Token

Before using this package, you'll need a Todoist API token:

1. **Log in to Todoist** at [https://app.todoist.com](https://app.todoist.com)
2. **Go to Settings** → **Integrations**
   - Direct link: [Todoist Integrations Settings](https://app.todoist.com/app/settings/integrations/developer)
3. **Copy your API token** from the "API token" section
4. **Keep it secure!** This token provides full access to your Todoist account

## Installation

### For CLI Usage (Recommended)

If you're using md2do CLI, the Todoist integration is already included:

```bash
# Install md2do globally
npm install -g @md2do/cli

# Or use locally
npx @md2do/cli todoist list
```

### For Programmatic Usage

```bash
# Install with peer dependencies
pnpm add @md2do/todoist @md2do/core

# Or using npm
npm install @md2do/todoist @md2do/core
```

## Configuration

### For CLI Users

Configure your API token using one of these methods:

**Option 1: Environment Variable** (recommended for security)

```bash
export TODOIST_API_TOKEN="your-api-token-here"
```

**Option 2: Global Config File** (~/.md2do.json)

```json
{
  "todoist": {
    "apiToken": "your-api-token-here",
    "defaultProject": "Inbox"
  }
}
```

**Option 3: Project Config File** (./.md2do.json)

```json
{
  "todoist": {
    "apiToken": "your-project-token-here",
    "defaultProject": "Work"
  }
}
```

For complete configuration options, see the [Configuration Guide](https://md2do.com/todoist) (coming soon).

### For Programmatic Usage

Pass the API token directly to the client:

```typescript
import { TodoistClient } from '@md2do/todoist';

// Initialize client with API token
const client = new TodoistClient({
  apiToken: process.env.TODOIST_API_TOKEN!,
});

// Get all tasks
const tasks = await client.getTasks();

// Get tasks for a specific project
const projectTasks = await client.getTasks({ projectId: '123456' });

// Create a new task
const newTask = await client.createTask({
  content: 'Review pull request',
  priority: 3,
  labels: ['work', 'urgent'],
  due_date: '2026-01-25',
});

// Complete a task
await client.completeTask(newTask.id);
```

## API Reference

### TodoistClient

Wrapper around the Todoist API with error handling and convenience methods.

#### Constructor

```typescript
new TodoistClient(config: TodoistClientConfig)
```

**Config:**

- `apiToken: string` - Your Todoist API token

#### Methods

##### `getTasks(options?)`

Get all active tasks, optionally filtered by project or label.

```typescript
const tasks = await client.getTasks({
  projectId: '123456', // optional
  labelId: '789', // optional
});
```

##### `getTask(taskId)`

Get a specific task by ID.

```typescript
const task = await client.getTask('123456');
```

##### `createTask(params)`

Create a new task.

```typescript
const task = await client.createTask({
  content: 'Task description',
  priority: 3, // 1-4 (1=low, 4=urgent)
  labels: ['work'], // optional
  due_date: '2026-01-25', // optional, YYYY-MM-DD
  project_id: '123456', // optional
});
```

##### `updateTask(taskId, params)`

Update an existing task.

```typescript
await client.updateTask('123456', {
  content: 'Updated description',
  priority: 4,
});
```

##### `completeTask(taskId)`

Mark a task as completed.

```typescript
await client.completeTask('123456');
```

##### `reopenTask(taskId)`

Reopen a completed task.

```typescript
await client.reopenTask('123456');
```

##### `deleteTask(taskId)`

Delete a task permanently.

```typescript
await client.deleteTask('123456');
```

##### `getProjects()`

Get all projects.

```typescript
const projects = await client.getProjects();
```

##### `getProject(projectId)`

Get a specific project by ID.

```typescript
const project = await client.getProject('123456');
```

##### `findProjectByName(name)`

Find a project by name (case-insensitive).

```typescript
const project = await client.findProjectByName('Work');
```

##### `getLabels()`

Get all labels.

```typescript
const labels = await client.getLabels();
```

##### `ensureLabel(name)`

Create a label if it doesn't exist, otherwise return the existing label.

```typescript
const label = await client.ensureLabel('urgent');
```

##### `test()`

Test the API connection.

```typescript
const isConnected = await client.test();
```

### Task Mapping

Convert between md2do and Todoist task formats.

#### `md2doToTodoist(task, projectId?)`

Convert an md2do task to Todoist task creation parameters.

```typescript
import { md2doToTodoist } from '@md2do/todoist';
import type { Task } from '@md2do/core';

const mdTask: Task = {
  id: 'abc123',
  text: 'Fix bug',
  completed: false,
  file: 'bugs.md',
  line: 5,
  tags: ['backend', 'urgent'],
  assignee: 'nick',
  priority: 'urgent',
  dueDate: new Date('2026-01-25'),
};

const todoistParams = md2doToTodoist(mdTask, 'project-123');
// {
//   content: 'Fix bug',
//   priority: 4,
//   labels: ['backend', 'urgent'],
//   due_date: '2026-01-25',
//   project_id: 'project-123',
// }
```

#### `todoistToMd2do(todoistTask, assignee?)`

Convert a Todoist task to md2do task update data.

```typescript
import { todoistToMd2do } from '@md2do/todoist';

const update = todoistToMd2do(todoistTask, 'nick');
// {
//   text: 'Fix bug @nick !!! #backend #urgent (2026-01-25) [todoist:123456]',
//   completed: false,
//   todoistId: '123456',
//   priority: 'urgent',
//   tags: ['backend', 'urgent'],
//   due: Date('2026-01-25'),
// }
```

### Priority Mapping

#### `md2doToTodoistPriority(priority?)`

Convert md2do priority to Todoist priority.

```typescript
import { md2doToTodoistPriority } from '@md2do/todoist';

md2doToTodoistPriority('urgent'); // 4
md2doToTodoistPriority('high'); // 3
md2doToTodoistPriority('normal'); // 2
md2doToTodoistPriority('low'); // 1
md2doToTodoistPriority(undefined); // 1
```

#### `todoistToMd2doPriority(priority)`

Convert Todoist priority to md2do priority.

```typescript
import { todoistToMd2doPriority } from '@md2do/todoist';

todoistToMd2doPriority(4); // 'urgent'
todoistToMd2doPriority(3); // 'high'
todoistToMd2doPriority(2); // 'normal'
todoistToMd2doPriority(1); // 'low'
```

### Text Formatting

#### `extractTaskContent(text)`

Extract clean task content by removing all metadata.

```typescript
import { extractTaskContent } from '@md2do/todoist';

const text = 'Fix bug @nick !!! #backend (2026-01-25) [todoist:123456]';
extractTaskContent(text); // 'Fix bug'
```

#### `formatTaskContent(content, options)`

Format task content with metadata.

```typescript
import { formatTaskContent } from '@md2do/todoist';

formatTaskContent('Fix bug', {
  assignee: 'nick',
  priority: 'urgent',
  tags: ['backend'],
  due: new Date('2026-01-25'),
  todoistId: '123456',
});
// 'Fix bug @nick !!! #backend (2026-01-25) [todoist:123456]'
```

## CLI Usage Examples

Once configured, use the md2do CLI commands:

### List Todoist Tasks

```bash
# List all tasks from default project
md2do todoist list

# List from specific project
md2do todoist list --project Work

# Limit results
md2do todoist list --limit 10

# JSON output
md2do todoist list --format json
```

### Create Tasks

```bash
# Simple task
md2do todoist add "Review pull request"

# With priority and labels
md2do todoist add "Fix bug" --priority urgent --labels bug,backend

# With due date
md2do todoist add "Meeting prep" --due tomorrow --project Work
```

### Import Markdown Tasks

```bash
# Import a task from markdown to Todoist
md2do todoist import tasks.md:15

# Specify project
md2do todoist import notes.md:42 --project Personal
```

### Sync with Todoist

```bash
# Sync all tasks (dry run first)
md2do todoist sync --dry-run

# Actually sync
md2do todoist sync

# Sync specific directory
md2do todoist sync --path ./work-notes

# Pull only (update markdown from Todoist)
md2do todoist sync --direction pull
```

## Programmatic Usage with Configuration

Use with `@md2do/config` for automatic token management:

```typescript
import { loadConfig } from '@md2do/config';
import { TodoistClient } from '@md2do/todoist';

// Load config from environment, project, or global config
const config = await loadConfig();

if (!config.todoist?.apiToken) {
  throw new Error('Todoist API token not configured');
}

// Create client with configured token
const client = new TodoistClient({
  apiToken: config.todoist.apiToken,
});

// Find default project if configured
let projectId: string | undefined;
if (config.todoist.defaultProject) {
  const project = await client.findProjectByName(config.todoist.defaultProject);
  projectId = project?.id;
}

// Use client...
```

## Error Handling

All client methods throw descriptive errors:

```typescript
try {
  const task = await client.getTask('invalid-id');
} catch (error) {
  console.error(error.message);
  // 'Failed to get task invalid-id: Task not found'
}
```

## Date Handling

All dates are handled in UTC to avoid timezone issues:

```typescript
import { md2doToTodoist } from '@md2do/todoist';

const task = {
  // ... other fields
  dueDate: new Date('2026-01-25T00:00:00.000Z'), // Always use UTC
};

const params = md2doToTodoist(task);
params.due_date; // '2026-01-25'
```

## TypeScript Types

All types are fully typed and exported:

```typescript
import type {
  TodoistClientConfig,
  TodoistTaskParams,
  Md2doTaskUpdate,
} from '@md2do/todoist';

import type { Task as TodoistTask } from '@doist/todoist-api-typescript';
```

## Testing

Run tests:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run
```

## Examples

### Sync Tasks from Todoist

```typescript
import { TodoistClient, todoistToMd2do } from '@md2do/todoist';
import { updateTask } from '@md2do/core';

const client = new TodoistClient({ apiToken: process.env.TODOIST_API_TOKEN! });

// Get tasks from Todoist
const todoistTasks = await client.getTasks({ projectId: '123456' });

// Convert and update markdown files
for (const todoistTask of todoistTasks) {
  const update = todoistToMd2do(todoistTask);

  // Find corresponding markdown task and update
  await updateTask({
    file: 'tasks.md',
    line: 5, // line number from scanning
    updates: {
      completed: update.completed,
      text: update.text,
    },
  });
}
```

### Push Tasks to Todoist

```typescript
import { TodoistClient, md2doToTodoist } from '@md2do/todoist';
import { scanMarkdownFile } from '@md2do/core';

const client = new TodoistClient({ apiToken: process.env.TODOIST_API_TOKEN! });

// Scan markdown file
const { tasks } = scanMarkdownFile('tasks.md', 'tasks.md');

// Push tasks without Todoist IDs
for (const task of tasks) {
  if (!task.todoistId && !task.completed) {
    const params = md2doToTodoist(task, 'project-123');
    const created = await client.createTask(params);

    // Update markdown with Todoist ID
    await updateTask({
      file: task.file,
      line: task.line,
      updates: {
        text: `${task.text} [todoist:${created.id}]`,
      },
    });
  }
}
```

### Ensure Labels Exist

```typescript
import { TodoistClient } from '@md2do/todoist';

const client = new TodoistClient({ apiToken: process.env.TODOIST_API_TOKEN! });

// Ensure all required labels exist
const requiredLabels = ['urgent', 'backend', 'frontend', 'bug', 'feature'];

for (const labelName of requiredLabels) {
  await client.ensureLabel(labelName);
}
```

## Related Packages

- **[@md2do/core](../core)** - Core parsing, filtering, and scanning
- **[@md2do/config](../config)** - Configuration management
- **[@md2do/cli](../cli)** - Command-line interface

## Documentation

- [Todoist Setup Guide](../../docs/todoist-setup.md) - Complete configuration guide
- [Implementation Plan](../../docs/todoist-implementation-plan.md) - Technical roadmap
- [Todoist API Docs](https://developer.todoist.com/rest/v2/) - Official API documentation

## License

MIT
