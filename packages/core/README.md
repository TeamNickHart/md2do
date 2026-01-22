# @md2do/core

[![npm version](https://badge.fury.io/js/%40md2do%2Fcore.svg)](https://www.npmjs.com/package/@md2do/core)
[![npm downloads](https://img.shields.io/npm/dm/@md2do/core.svg)](https://www.npmjs.com/package/@md2do/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Core library for md2do - parsing, filtering, scanning, and writing markdown tasks.

## Overview

`@md2do/core` provides the fundamental building blocks for working with TODO items in markdown files. This is a library package designed for developers who want to build their own task management tools or integrate md2do functionality into their applications.

**For end users:** Use [@md2do/cli](https://www.npmjs.com/package/@md2do/cli) instead - it provides a ready-to-use command-line interface.

**For developers:** This package gives you programmatic access to all core functionality.

## Features

- 📝 **Parser** - Extract TODO items from markdown with rich metadata (assignees, priorities, tags, due dates)
- 🔍 **Scanner** - Recursively scan directories for markdown files with glob patterns
- 🎯 **Filters** - Filter tasks by any metadata field with type-safe functions
- 📊 **Sorting** - Sort tasks by priority, due date, assignee, file, etc.
- ✍️ **Writer** - Atomically update markdown files while preserving formatting
- 🔧 **Utilities** - Date parsing, ID generation, and helper functions
- ✅ **Type Safe** - Full TypeScript support with strict mode
- 🧪 **Well Tested** - 200+ tests with comprehensive coverage

## Installation

```bash
npm install @md2do/core
```

## Quick Start

```typescript
import { scanMarkdownFile, filters, sorting } from '@md2do/core';

// Scan a markdown file
const result = scanMarkdownFile('tasks.md', 'tasks.md');

console.log(`Found ${result.tasks.length} tasks`);

// Filter urgent tasks assigned to nick
const urgentNickTasks = result.tasks
  .filter(filters.byAssignee('nick'))
  .filter(filters.byPriority('urgent'));

// Sort by due date
const sorted = sorting.sortTasks(urgentNickTasks, 'due');

console.log(sorted);
```

## API Reference

### Parser

Parse markdown content to extract tasks.

#### `parseMarkdown(content, filePath?)`

Parse markdown content and extract all tasks.

```typescript
import { parseMarkdown } from '@md2do/core';

const content = `
- [ ] Fix bug @nick !!! #backend (2026-01-25)
- [x] Write docs @jane !! #docs
`;

const tasks = parseMarkdown(content, 'tasks.md');
// [
//   {
//     id: 'abc123',
//     text: 'Fix bug @nick !!! #backend (2026-01-25)',
//     completed: false,
//     file: 'tasks.md',
//     line: 2,
//     assignee: 'nick',
//     priority: 'urgent',
//     tags: ['backend'],
//     dueDate: Date('2026-01-25'),
//     ...
//   },
//   ...
// ]
```

#### `parseTaskLine(line, lineNumber, filePath?)`

Parse a single markdown task line.

```typescript
import { parseTaskLine } from '@md2do/core';

const task = parseTaskLine(
  '- [ ] Fix bug @nick !!! #backend (2026-01-25)',
  5,
  'tasks.md',
);
```

#### Pattern Exports

```typescript
import {
  TASK_PATTERN,
  ASSIGNEE_PATTERN,
  PRIORITY_PATTERN,
  TAG_PATTERN,
  DUE_DATE_PATTERN,
  TODOIST_ID_PATTERN,
} from '@md2do/core';
```

### Scanner

Scan directories for markdown files and extract tasks.

#### `scanMarkdownFile(filePath, rootPath?)`

Scan a single markdown file.

```typescript
import { scanMarkdownFile } from '@md2do/core';

const result = scanMarkdownFile('./notes/tasks.md', './notes');
// {
//   tasks: [...],
//   metadata: {
//     filesScanned: 1,
//     totalTasks: 15,
//     completed: 3,
//     incomplete: 12
//   }
// }
```

#### `scanMarkdownFiles(options)`

Scan multiple markdown files with glob patterns.

```typescript
import { scanMarkdownFiles } from '@md2do/core';

const result = await scanMarkdownFiles({
  path: './docs',
  pattern: '**/*.md',
  exclude: ['node_modules/**', 'dist/**'],
});

console.log(
  `Found ${result.metadata.totalTasks} tasks in ${result.metadata.filesScanned} files`,
);
```

**Options:**

```typescript
{
  path?: string;           // Root path to scan (default: '.')
  pattern?: string;        // Glob pattern (default: '**/*.md')
  exclude?: string[];      // Patterns to exclude
}
```

### Filters

Type-safe filter functions for tasks.

```typescript
import { filters } from '@md2do/core';

// All filters return (task: Task) => boolean

// By assignee
const nickTasks = tasks.filter(filters.byAssignee('nick'));

// By priority
const urgentTasks = tasks.filter(filters.byPriority('urgent'));

// By tag
const backendTasks = tasks.filter(filters.byTag('backend'));

// By project
const acmeTasks = tasks.filter(filters.byProject('acme-app'));

// By person (from 1-1s)
const janeTasks = tasks.filter(filters.byPerson('jane'));

// By completion status
const incomplete = tasks.filter(filters.incomplete());
const completed = tasks.filter(filters.completed());

// By due date
const overdue = tasks.filter(filters.overdue());
const dueToday = tasks.filter(filters.dueToday());
const dueThisWeek = tasks.filter(filters.dueThisWeek());
const dueWithin = tasks.filter(filters.dueWithinDays(7));

// Combine filters
const urgentBackendTasks = tasks
  .filter(filters.byAssignee('nick'))
  .filter(filters.byPriority('urgent'))
  .filter(filters.byTag('backend'))
  .filter(filters.incomplete());
```

### Sorting

Sort tasks by various fields.

```typescript
import { sorting } from '@md2do/core';

// Sort by priority (urgent → high → normal → low)
const byPriority = sorting.sortTasks(tasks, 'due');

// Sort by due date (earliest first)
const byDue = sorting.sortTasks(tasks, 'due');

// Sort by creation date
const byCreated = sorting.sortTasks(tasks, 'created');

// Sort by file path
const byFile = sorting.sortTasks(tasks, 'file');

// Sort by project
const byProject = sorting.sortTasks(tasks, 'project');

// Sort by assignee (alphabetical)
const byAssignee = sorting.sortTasks(tasks, 'assignee');

// Reverse order
const reversed = sorting.sortTasks(tasks, 'priority', true);
```

**Sort fields:**

- `'due'` - Due date (earliest first)
- `'priority'` - Priority (urgent → high → normal → low)
- `'created'` - Creation date (oldest first)
- `'file'` - File path (alphabetical)
- `'project'` - Project name (alphabetical)
- `'assignee'` - Assignee (alphabetical)

### Writer

Atomically update markdown files.

#### `updateTask(options)`

Update a task in a markdown file.

```typescript
import { updateTask } from '@md2do/core';

await updateTask({
  file: 'tasks.md',
  line: 5,
  updates: {
    completed: true,
    text: 'Fix bug @nick !!! #backend (2026-01-25) [todoist:123456]',
  },
});
```

**Options:**

```typescript
{
  file: string;            // File path
  line: number;            // Line number (1-indexed)
  updates: {
    completed?: boolean;   // Toggle completion
    text?: string;         // Replace entire task text
  };
}
```

**Features:**

- Atomic writes (uses temp file + rename)
- Preserves file formatting
- Updates timestamps for completed tasks
- Safe error handling

### Types

All types are exported for TypeScript users.

```typescript
import type {
  Task,
  Priority,
  ScanResult,
  ScanOptions,
  UpdateTaskOptions,
  TaskUpdate,
} from '@md2do/core';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  file: string;
  line: number;
  assignee?: string;
  priority?: Priority;
  tags: string[];
  dueDate?: Date;
  createdDate?: Date;
  completedDate?: Date;
  todoistId?: string;
  project?: string;
  person?: string;
  heading?: string;
}

type Priority = 'urgent' | 'high' | 'normal' | 'low';
```

### Utilities

#### Date Utilities

```typescript
import {
  parseDate,
  formatDate,
  isOverdue,
  isDueToday,
  isDueThisWeek,
  isDueWithinDays,
} from '@md2do/core';

// Parse dates
const date = parseDate('2026-01-25'); // Date object
const relative = parseDate('tomorrow'); // Relative dates
const natural = parseDate('next friday'); // Natural language

// Format dates
const formatted = formatDate(new Date()); // '2026-01-21'

// Check due dates
isOverdue(task); // boolean
isDueToday(task); // boolean
isDueThisWeek(task); // boolean
isDueWithinDays(task, 7); // boolean
```

#### ID Generation

```typescript
import { generateId } from '@md2do/core';

const id = generateId('tasks.md', 5); // Generate deterministic ID
// 'f7a3b2c1'
```

## Usage Examples

### Build a Custom CLI

```typescript
import { scanMarkdownFiles, filters, sorting } from '@md2do/core';

async function listTasks(options: {
  assignee?: string;
  priority?: string;
  tag?: string;
}) {
  // Scan all markdown files
  const result = await scanMarkdownFiles({
    path: process.cwd(),
    pattern: '**/*.md',
    exclude: ['node_modules/**'],
  });

  let filtered = result.tasks;

  // Apply filters
  if (options.assignee) {
    filtered = filtered.filter(filters.byAssignee(options.assignee));
  }
  if (options.priority) {
    filtered = filtered.filter(filters.byPriority(options.priority as any));
  }
  if (options.tag) {
    filtered = filtered.filter(filters.byTag(options.tag));
  }

  // Sort by priority
  const sorted = sorting.sortTasks(filtered, 'priority');

  // Display
  console.log(`Found ${sorted.length} tasks`);
  sorted.forEach((task) => {
    console.log(`- ${task.text}`);
  });
}

listTasks({ assignee: 'nick', priority: 'urgent' });
```

### Generate Statistics

```typescript
import { scanMarkdownFiles } from '@md2do/core';

async function getStats() {
  const result = await scanMarkdownFiles({ path: '.' });

  // Group by assignee
  const byAssignee = new Map<string, number>();
  result.tasks.forEach((task) => {
    if (task.assignee) {
      const count = byAssignee.get(task.assignee) || 0;
      byAssignee.set(task.assignee, count + 1);
    }
  });

  console.log('Tasks by assignee:');
  byAssignee.forEach((count, assignee) => {
    console.log(`  ${assignee}: ${count}`);
  });
}
```

### Sync Task Completion

```typescript
import { scanMarkdownFile, updateTask } from '@md2do/core';

async function markComplete(filePath: string, taskId: string) {
  const result = scanMarkdownFile(filePath, filePath);
  const task = result.tasks.find((t) => t.id === taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  await updateTask({
    file: task.file,
    line: task.line,
    updates: { completed: true },
  });

  console.log(`✓ Marked task as complete: ${task.text}`);
}
```

### Watch for Changes

```typescript
import { watch } from 'fs';
import { scanMarkdownFile } from '@md2do/core';

function watchFile(filePath: string, onChange: (tasks: Task[]) => void) {
  watch(filePath, async () => {
    const result = scanMarkdownFile(filePath, filePath);
    onChange(result.tasks);
  });
}

watchFile('./tasks.md', (tasks) => {
  console.log(`File updated: ${tasks.length} tasks found`);
});
```

## Testing

Run tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run specific test suite
pnpm test parser

# Run with coverage
pnpm test:coverage
```

**Test coverage:**

- Parser: 70 tests
- Scanner: 43 tests
- Filters: 41 tests
- Sorting: 26 tests
- Writer: 15 tests
- Utilities: 45 tests

## Related Packages

- **[@md2do/cli](../cli)** - Command-line interface (uses this package)
- **[@md2do/config](../config)** - Configuration management
- **[@md2do/todoist](../todoist)** - Todoist API integration (uses this package)
- **[@md2do/mcp](../mcp)** - MCP server for AI integration (uses this package)

## Documentation

- [Main Documentation](https://md2do.com)
- [GitHub Repository](https://github.com/TeamNickHart/md2do)
- [Contributing Guide](https://github.com/TeamNickHart/md2do/blob/main/docs/development/contributing.md)

## License

MIT © [Nick Hart](https://github.com/TeamNickHart)
