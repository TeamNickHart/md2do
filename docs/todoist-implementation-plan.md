# Todoist Integration Implementation Plan

## Overview

Implement bidirectional synchronization between markdown tasks and Todoist using the official TypeScript SDK (`@doist/todoist-api-typescript`). This builds on existing parser support for `[todoist:ID]` tags to enable seamless integration between local markdown files and Todoist's cloud-based task management.

## Current State

### Already Implemented ✅

- **Parser Support**: Extracts `[todoist:123456789]` IDs from markdown
- **Type Definitions**: Task type includes `todoistId?: string` and `completedDate?: Date`
- **Patterns**: `TODOIST_ID` regex pattern in `packages/core/src/parser/patterns.ts`

### Not Yet Implemented

- Todoist API client
- Configuration management
- File write operations (this will be md2do's first write capability!)
- Sync logic
- CLI commands for Todoist integration

## Architecture

### Package Structure

```
md2do/
├── packages/
│   ├── core/               # ✅ Existing - parsing & filtering
│   │   ├── src/
│   │   │   ├── parser/     # ✅ Already parses [todoist:ID]
│   │   │   └── writer/     # 🆕 NEW - Modify markdown files
│   │   └── tests/
│   │
│   ├── cli/                # ✅ Existing - commands
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── list.ts    # ✅ Existing
│   │   │   │   ├── stats.ts   # ✅ Existing
│   │   │   │   └── todoist.ts # 🆕 NEW - Todoist commands
│   │   │   └── config/     # 🆕 NEW - Config management
│   │   └── tests/
│   │
│   ├── mcp/                # ✅ Existing - MCP server
│   │
│   └── todoist/            # 🆕 NEW PACKAGE
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts        # Public API exports
│       │   ├── client.ts       # Todoist API wrapper
│       │   ├── mapper.ts       # md2do Task ↔ Todoist Task
│       │   ├── sync.ts         # Sync orchestration
│       │   └── types.ts        # Type definitions
│       └── tests/
│           ├── client.test.ts
│           ├── mapper.test.ts
│           └── sync.test.ts
│
└── docs/
    └── todoist-implementation-plan.md  # This file
```

## Configuration Strategy

### Hierarchical Configuration

**Resolution Order (first match wins):**

1. **Environment Variable**: `TODOIST_API_TOKEN`
2. **Project Config**: `.md2do.json` or `.md2do.yaml` (walk up from current directory)
3. **Global Config**: `~/.md2do.json` or `~/.config/md2do/config.json`

### Configuration Schema

```typescript
interface Config {
  // Markdown settings
  markdown?: {
    root?: string; // Default: current directory
    exclude?: string[]; // Paths to exclude
    pattern?: string; // File glob pattern
  };

  // Default assignee for @me
  defaultAssignee?: string;

  // Todoist integration
  todoist?: {
    apiToken?: string; // Todoist API token
    defaultProject?: string; // Default project name
    autoSync?: boolean; // Auto-sync on list command
    syncDirection?: 'push' | 'pull' | 'both'; // Default: both
    labelMapping?: Record<string, string>; // md2do tag → Todoist label
  };

  // Output formatting
  output?: {
    format?: 'pretty' | 'table' | 'json';
    colors?: boolean;
    paths?: boolean;
  };
}
```

### Configuration Files

**Global Config** (`~/.md2do.json`):

```json
{
  "defaultAssignee": "nick",
  "todoist": {
    "apiToken": "abc123def456...",
    "defaultProject": "Inbox",
    "autoSync": false
  },
  "output": {
    "format": "pretty",
    "colors": true
  }
}
```

**Project Config** (`.md2do.json`):

```json
{
  "markdown": {
    "root": "./notes",
    "exclude": ["archive/", "drafts/"]
  },
  "todoist": {
    "apiToken": "xyz789work...",
    "defaultProject": "Work"
  }
}
```

**Use Cases:**

- **Personal use**: Single global config with personal Todoist token
- **Work/Personal separation**: Work projects use `.md2do.json` with work Todoist token
- **Team use**: Shared project config, personal tokens via environment variable
- **CI/CD**: Token via `TODOIST_API_TOKEN` environment variable

## Implementation Phases

### Phase 1: Configuration Management (2-3 hours)

**Goal:** Load and validate hierarchical configuration

#### Tasks

1. **Install Dependencies**

   ```bash
   pnpm add cosmiconfig zod
   ```

2. **Create Config Module** (`packages/cli/src/config/`)
   - `config.ts` - Config loading with cosmiconfig
   - `schema.ts` - Zod schema for validation
   - `defaults.ts` - Default configuration values

3. **Config Resolution Logic**

   ```typescript
   async function loadConfig(cwd: string): Promise<Config> {
     // 1. Check environment variables
     const envToken = process.env.TODOIST_API_TOKEN;

     // 2. Load project config (walks up from cwd)
     const projectConfig = await loadProjectConfig(cwd);

     // 3. Load global config
     const globalConfig = await loadGlobalConfig();

     // 4. Merge with precedence
     return merge(defaults, globalConfig, projectConfig, {
       todoist: { apiToken: envToken },
     });
   }
   ```

4. **Validation**
   - Validate structure with Zod
   - Type-safe config access
   - Helpful error messages for invalid config

5. **Testing**
   - Unit tests for config merging
   - Test environment variable override
   - Test file hierarchy walking

#### Deliverables

- ✅ Config loading from all sources
- ✅ Environment variable override
- ✅ Type-safe config access
- ✅ Validation with clear errors

### Phase 2: Todoist API Client Package (3-4 hours)

**Goal:** Create `@md2do/todoist` package with type-safe API wrapper

#### Tasks

1. **Package Setup**

   ```bash
   mkdir -p packages/todoist/{src,tests}
   ```

   **package.json:**

   ```json
   {
     "name": "@md2do/todoist",
     "version": "0.1.0",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "dependencies": {
       "@doist/todoist-api-typescript": "^3.0.0",
       "@md2do/core": "workspace:*"
     }
   }
   ```

2. **API Client Wrapper** (`src/client.ts`)

   ```typescript
   import { TodoistApi } from '@doist/todoist-api-typescript';
   import type { Task as TodoistTask } from '@doist/todoist-api-typescript';

   export class TodoistClient {
     private api: TodoistApi;

     constructor(apiToken: string) {
       this.api = new TodoistApi(apiToken);
     }

     async testConnection(): Promise<boolean> {
       try {
         await this.api.getProjects();
         return true;
       } catch {
         return false;
       }
     }

     async getTasks(options?: {
       projectId?: string;
       filter?: string;
     }): Promise<TodoistTask[]> {
       return this.api.getTasks(options);
     }

     async createTask(params: {
       content: string;
       projectId?: string;
       priority?: number;
       dueString?: string;
       labels?: string[];
     }): Promise<TodoistTask> {
       return this.api.addTask(params);
     }

     async updateTask(
       taskId: string,
       updates: Partial<TodoistTask>,
     ): Promise<void> {
       await this.api.updateTask(taskId, updates);
     }

     async closeTask(taskId: string): Promise<void> {
       await this.api.closeTask(taskId);
     }

     async reopenTask(taskId: string): Promise<void> {
       // Implementation depends on Todoist API
     }

     async deleteTask(taskId: string): Promise<void> {
       await this.api.deleteTask(taskId);
     }
   }
   ```

3. **Task Mapper** (`src/mapper.ts`)

   Convert between md2do Task and Todoist Task formats:

   ```typescript
   import type { Task } from '@md2do/core';
   import type { Task as TodoistTask } from '@doist/todoist-api-typescript';

   export function toTodoistTask(task: Task): {
     content: string;
     priority?: number;
     dueString?: string;
     labels?: string[];
   } {
     return {
       content: task.text,
       priority: mapPriority(task.priority),
       dueString: task.dueDate?.toISOString().split('T')[0],
       labels: task.tags,
     };
   }

   export function fromTodoistTask(
     todoistTask: TodoistTask,
     markdown: { file: string; line: number },
   ): Task {
     return {
       id: generateTaskId(markdown.file, markdown.line, todoistTask.content),
       text: todoistTask.content,
       completed: todoistTask.isCompleted,
       file: markdown.file,
       line: markdown.line,
       todoistId: todoistTask.id,
       priority: mapPriorityFromTodoist(todoistTask.priority),
       dueDate: todoistTask.due?.date
         ? new Date(todoistTask.due.date)
         : undefined,
       tags: todoistTask.labels || [],
       completedDate: todoistTask.completedAt
         ? new Date(todoistTask.completedAt)
         : undefined,
     };
   }

   function mapPriority(priority?: string): number {
     // md2do: urgent/high/normal/low → Todoist: 4/3/2/1
     switch (priority) {
       case 'urgent':
         return 4;
       case 'high':
         return 3;
       case 'normal':
         return 2;
       default:
         return 1;
     }
   }

   function mapPriorityFromTodoist(priority: number): string {
     switch (priority) {
       case 4:
         return 'urgent';
       case 3:
         return 'high';
       case 2:
         return 'normal';
       default:
         return 'low';
     }
   }
   ```

4. **Error Handling**
   - Network errors → retry with exponential backoff
   - Rate limit errors → queue and delay
   - Authentication errors → clear error message
   - Invalid data → validation errors

5. **Testing**
   - Unit tests for mapper functions
   - Mock Todoist API responses
   - Test error handling paths
   - Test priority mapping

#### Deliverables

- ✅ `@md2do/todoist` package created
- ✅ Type-safe API wrapper
- ✅ Task mapping functions
- ✅ Error handling
- ✅ Unit tests

### Phase 3: File Writer Module (3-4 hours)

**Goal:** Enable safe modification of markdown files

**⚠️ IMPORTANT:** This is md2do's **first write operation**. Must be bulletproof.

#### Tasks

1. **Create Writer Module** (`packages/core/src/writer/`)

   ```typescript
   // packages/core/src/writer/index.ts

   import fs from 'fs/promises';
   import path from 'path';

   export interface UpdateTaskOptions {
     file: string;
     line: number;
     updates: {
       todoistId?: string;
       completed?: boolean;
       completedDate?: Date;
       dueDate?: Date;
     };
   }

   export async function updateTaskInFile(
     options: UpdateTaskOptions,
   ): Promise<void> {
     const { file, line, updates } = options;

     // Read current file
     const content = await fs.readFile(file, 'utf-8');
     const lines = content.split('\n');

     // Validate line number
     if (line < 1 || line > lines.length) {
       throw new Error(`Invalid line number ${line} in file ${file}`);
     }

     // Get target line (1-indexed → 0-indexed)
     const targetLine = lines[line - 1];

     // Verify it's a task
     if (!TASK_CHECKBOX.test(targetLine)) {
       throw new Error(`Line ${line} is not a task`);
     }

     // Apply updates
     let updatedLine = targetLine;

     if (updates.todoistId !== undefined) {
       updatedLine = addTodoistId(updatedLine, updates.todoistId);
     }

     if (updates.completed !== undefined) {
       updatedLine = setCompleted(updatedLine, updates.completed);
     }

     if (updates.completedDate !== undefined) {
       updatedLine = addCompletedDate(updatedLine, updates.completedDate);
     }

     if (updates.dueDate !== undefined) {
       updatedLine = updateDueDate(updatedLine, updates.dueDate);
     }

     // Update line
     lines[line - 1] = updatedLine;

     // Atomic write: temp file → rename
     const tempFile = `${file}.tmp`;
     await fs.writeFile(tempFile, lines.join('\n'), 'utf-8');
     await fs.rename(tempFile, file);
   }

   function addTodoistId(line: string, todoistId: string): string {
     // Check if todoist ID already exists
     if (TODOIST_ID.test(line)) {
       // Replace existing
       return line.replace(TODOIST_ID, `[todoist:${todoistId}]`);
     }
     // Add at end of line
     return `${line.trimEnd()} [todoist:${todoistId}]`;
   }

   function setCompleted(line: string, completed: boolean): string {
     const checkbox = completed ? '[x]' : '[ ]';
     return line.replace(TASK_CHECKBOX, (match, indent) => {
       return `${indent}- ${checkbox} `;
     });
   }

   function addCompletedDate(line: string, date: Date): string {
     const dateStr = date.toISOString().split('T')[0];
     if (COMPLETED_DATE.test(line)) {
       return line.replace(COMPLETED_DATE, `[completed:${dateStr}]`);
     }
     return `${line.trimEnd()} [completed:${dateStr}]`;
   }

   function updateDueDate(line: string, date: Date): string {
     const dateStr = date.toISOString().split('T')[0];
     if (DUE_DATE_ABSOLUTE.test(line)) {
       return line.replace(DUE_DATE_ABSOLUTE, `[due:${dateStr}]`);
     }
     return `${line.trimEnd()} [due:${dateStr}]`;
   }
   ```

2. **Safety Features**
   - **Atomic writes**: Write to temp file, then rename
   - **Validation**: Verify line is actually a task
   - **Backups**: Option to keep `.bak` files
   - **Dry-run mode**: Show what would change without writing

3. **Git Awareness** (Optional for v1)

   ```typescript
   async function hasUncommittedChanges(file: string): Promise<boolean> {
     const { stdout } = await exec(`git status --porcelain ${file}`);
     return stdout.trim().length > 0;
   }

   // Warn before modifying uncommitted files
   if (await hasUncommittedChanges(file)) {
     console.warn(`Warning: ${file} has uncommitted changes`);
   }
   ```

4. **Testing**
   - Test adding `[todoist:ID]` to tasks
   - Test updating existing `[todoist:ID]`
   - Test toggling completion status
   - Test atomic writes (verify temp file behavior)
   - Test error cases (invalid line, not a task, etc.)

#### Deliverables

- ✅ File modification functions
- ✅ Atomic write operations
- ✅ Comprehensive error handling
- ✅ Unit tests with temp files

### Phase 4: Todoist CLI Commands (4-5 hours)

**Goal:** Add `md2do todoist` command group

#### Commands

##### 4.1 `md2do todoist list`

List tasks from Todoist (not markdown):

```bash
md2do todoist list [options]

Options:
  --filter <filter>    Todoist filter expression (e.g., "today", "@work")
  --project <name>     Filter by project name
  --limit <n>          Limit number of results
  --format <type>      Output format (pretty|table|json)
```

Implementation:

```typescript
async function todoistListCommand(options: {
  filter?: string;
  project?: string;
  limit?: number;
  format?: string;
}) {
  const config = await loadConfig(process.cwd());

  if (!config.todoist?.apiToken) {
    console.error('Error: Todoist API token not configured');
    console.error(
      'Set TODOIST_API_TOKEN or run: md2do config set todoist.apiToken <token>',
    );
    process.exit(1);
  }

  const client = new TodoistClient(config.todoist.apiToken);
  const tasks = await client.getTasks({
    filter: options.filter,
    // TODO: Map project name to project ID
  });

  // Format and display
  if (options.format === 'json') {
    console.log(JSON.stringify({ tasks }, null, 2));
  } else {
    formatAsPretty(tasks);
  }
}
```

##### 4.2 `md2do todoist add`

Create task directly in Todoist:

```bash
md2do todoist add "<task>" [options]

Options:
  --project <name>     Project name
  --priority <level>   Priority: urgent|high|normal|low
  --due <date>         Due date (YYYY-MM-DD or "today", "tomorrow")
  --labels <tags>      Comma-separated labels

Examples:
  md2do todoist add "Review PR #423 !!" --project Work --labels code-review
  md2do todoist add "Buy groceries" --due tomorrow --priority normal
```

##### 4.3 `md2do todoist import`

Import markdown task to Todoist and write back ID:

```bash
md2do todoist import <file>:<line>

Examples:
  md2do todoist import projects/work/sprint.md:15
  md2do todoist import ./notes.md:8
```

Implementation:

```typescript
async function todoistImportCommand(location: string) {
  const [file, lineStr] = location.split(':');
  const line = parseInt(lineStr, 10);

  // 1. Read and parse task from markdown
  const task = await readTaskFromFile(file, line);

  // 2. Create in Todoist
  const client = new TodoistClient(config.todoist.apiToken);
  const todoistTask = await client.createTask(toTodoistTask(task));

  // 3. Write [todoist:ID] back to markdown
  await updateTaskInFile({
    file,
    line,
    updates: { todoistId: todoistTask.id },
  });

  console.log(`✓ Imported to Todoist (ID: ${todoistTask.id})`);
  console.log(`✓ Updated ${file}:${line} with [todoist:${todoistTask.id}]`);
}
```

##### 4.4 `md2do todoist sync`

Bidirectional sync between markdown and Todoist:

```bash
md2do todoist sync [options]

Options:
  --path <path>        Path to sync (default: current directory)
  --dry-run            Show what would be synced without making changes
  --direction <dir>    Sync direction: push|pull|both (default: both)
  --force              Skip confirmation prompts

Examples:
  md2do todoist sync --dry-run
  md2do todoist sync --path ./work/notes
  md2do todoist sync --direction pull  # Only update markdown from Todoist
```

Implementation outline:

```typescript
async function todoistSyncCommand(options: {
  path?: string;
  dryRun?: boolean;
  direction?: 'push' | 'pull' | 'both';
  force?: boolean;
}) {
  // 1. Scan markdown for tasks with [todoist:ID]
  const scanResult = await scanMarkdownFiles({ root: options.path });
  const tasksWithTodoist = scanResult.tasks.filter((t) => t.todoistId);

  // 2. Fetch corresponding Todoist tasks
  const client = new TodoistClient(config.todoist.apiToken);
  const todoistTasks = await Promise.all(
    tasksWithTodoist.map((t) => client.getTask(t.todoistId!)),
  );

  // 3. Detect conflicts and plan updates
  const syncPlan = await planSync(
    tasksWithTodoist,
    todoistTasks,
    options.direction,
  );

  // 4. Show dry-run or execute
  if (options.dryRun) {
    displaySyncPlan(syncPlan);
    return;
  }

  // 5. Confirm changes
  if (!options.force && syncPlan.updates.length > 0) {
    const confirmed = await confirmSync(syncPlan);
    if (!confirmed) return;
  }

  // 6. Execute sync
  await executeSync(syncPlan);
}
```

#### Deliverables

- ✅ `todoist list` command
- ✅ `todoist add` command
- ✅ `todoist import` command
- ✅ `todoist sync` command
- ✅ Integration tests for each command

### Phase 5: Sync Logic (4-5 hours)

**Goal:** Intelligent bidirectional synchronization

#### Sync Strategy

**Conflict Detection:**

- Compare `completedDate` in markdown vs Todoist's `completedAt`
- Compare `dueDate` in markdown vs Todoist's `due.date`
- Detect tasks deleted from Todoist (404 errors)

**Merge Rules:**

1. **Completion Status**
   - Todoist wins (assumed source of truth for shared tasks)
   - If Todoist shows completed but markdown doesn't → update markdown

2. **Due Dates**
   - Most recently modified wins
   - Markdown modification time: file `mtime`
   - Todoist modification time: API returns `updated` timestamp

3. **Task Content**
   - Markdown always wins (Todoist is secondary)
   - Never update markdown task text from Todoist

4. **Deletion**
   - If Todoist task deleted → prompt to remove `[todoist:ID]` from markdown
   - Never delete markdown task

**Conflict Resolution:**

```typescript
interface SyncConflict {
  task: Task;
  todoistTask: TodoistTask;
  conflictType: 'completion' | 'dueDate' | 'both';
  recommendation: 'useMarkdown' | 'useTodoist' | 'askUser';
}

async function detectConflicts(
  mdTask: Task,
  todoistTask: TodoistTask,
): Promise<SyncConflict | null> {
  const conflicts: string[] = [];

  // Completion status differs
  if (mdTask.completed !== todoistTask.isCompleted) {
    conflicts.push('completion');
  }

  // Due date differs
  const mdDue = mdTask.dueDate?.toISOString().split('T')[0];
  const todoistDue = todoistTask.due?.date;
  if (mdDue !== todoistDue) {
    conflicts.push('dueDate');
  }

  if (conflicts.length === 0) return null;

  return {
    task: mdTask,
    todoistTask,
    conflictType: conflicts.join('|') as any,
    recommendation: 'useTodoist', // Default strategy
  };
}
```

#### Sync Plan

```typescript
interface SyncPlan {
  updates: SyncUpdate[];
  conflicts: SyncConflict[];
  errors: SyncError[];
}

interface SyncUpdate {
  type: 'pushToTodoist' | 'pullFromTodoist';
  task: Task;
  changes: {
    completed?: boolean;
    dueDate?: Date;
    completedDate?: Date;
  };
}

async function planSync(
  markdownTasks: Task[],
  todoistTasks: TodoistTask[],
  direction: 'push' | 'pull' | 'both',
): Promise<SyncPlan> {
  const plan: SyncPlan = { updates: [], conflicts: [], errors: [] };

  for (const mdTask of markdownTasks) {
    const todoistTask = todoistTasks.find((t) => t.id === mdTask.todoistId);

    if (!todoistTask) {
      // Todoist task deleted
      plan.errors.push({
        task: mdTask,
        error: 'Todoist task not found (deleted?)',
      });
      continue;
    }

    const conflict = await detectConflicts(mdTask, todoistTask);
    if (conflict) {
      plan.conflicts.push(conflict);
    }

    // Plan updates based on direction
    if (direction === 'pull' || direction === 'both') {
      if (todoistTask.isCompleted && !mdTask.completed) {
        plan.updates.push({
          type: 'pullFromTodoist',
          task: mdTask,
          changes: {
            completed: true,
            completedDate: todoistTask.completedAt
              ? new Date(todoistTask.completedAt)
              : undefined,
          },
        });
      }
    }

    if (direction === 'push' || direction === 'both') {
      if (mdTask.completed && !todoistTask.isCompleted) {
        plan.updates.push({
          type: 'pushToTodoist',
          task: mdTask,
          changes: { completed: true },
        });
      }
    }
  }

  return plan;
}
```

#### Deliverables

- ✅ Conflict detection logic
- ✅ Sync planning algorithm
- ✅ Bidirectional updates
- ✅ Comprehensive tests for all sync scenarios

### Phase 6: Documentation & Testing (2-3 hours)

**Goal:** Production-ready documentation and comprehensive tests

#### Documentation

1. **User-Facing Documentation** (in main README.md)

   Add Todoist section:

   ````markdown
   ## 🔄 Todoist Integration

   md2do supports bidirectional synchronization with Todoist, allowing you to:

   - Import markdown tasks to Todoist
   - Sync completion status and due dates
   - Manage tasks from either markdown or Todoist

   ### Setup

   **Get your Todoist API token:**

   1. Go to https://app.todoist.com/app/settings/integrations/developer
   2. Scroll to "API token" section
   3. Click "Copy to clipboard"

   **Configure md2do:**

   Option 1: Environment variable (recommended for CI/CD)

   ```bash
   export TODOIST_API_TOKEN=your-token-here
   ```
   ````

   Option 2: Global config file (`~/.md2do.json`)

   ```json
   {
     "todoist": {
       "apiToken": "your-token-here",
       "defaultProject": "Inbox"
     }
   }
   ```

   Option 3: Project config file (`./.md2do.json`)

   ```json
   {
     "todoist": {
       "apiToken": "work-token-here",
       "defaultProject": "Work"
     }
   }
   ```

   ### Usage

   **List Todoist tasks:**

   ```bash
   md2do todoist list
   md2do todoist list --filter "today"
   md2do todoist list --project Work
   ```

   **Create task in Todoist:**

   ```bash
   md2do todoist add "Review PR #423" --project Work --due tomorrow
   ```

   **Import markdown task to Todoist:**

   ```bash
   md2do todoist import notes.md:15
   ```

   This creates the task in Todoist and adds `[todoist:ID]` to your markdown.

   **Sync markdown ↔️ Todoist:**

   ```bash
   md2do todoist sync                    # Sync everything
   md2do todoist sync --dry-run          # Preview changes
   md2do todoist sync --direction pull   # Only update markdown
   md2do todoist sync --direction push   # Only update Todoist
   ```

   ### How It Works

   Tasks in markdown can be linked to Todoist using the `[todoist:ID]` tag:

   ```markdown
   - [x] Review PR #423 [todoist:7654321] [completed:2026-01-18]
   - [ ] Deploy to staging [todoist:7654322] [due:2026-01-20]
   ```

   When you run `md2do todoist sync`:
   - Completion status syncs both directions
   - Due dates sync both directions
   - Task content only updates in markdown (never from Todoist)
   - Conflicts are detected and shown for review

   ### Configuration

   **Multiple Todoist accounts:**
   Use project-level config files to use different Todoist accounts for different projects:

   ```
   ~/Work/.md2do.json       # Work Todoist token
   ~/Personal/.md2do.json   # Personal Todoist token
   ```

   **Configuration options:**

   ```json
   {
     "todoist": {
       "apiToken": "token",
       "defaultProject": "Inbox",
       "autoSync": false,
       "syncDirection": "both",
       "labelMapping": {
         "urgent": "p1",
         "backend": "code"
       }
     }
   }
   ```

   ```

   ```

2. **Implementation Documentation** (this file)
   - Keep this file up-to-date as implementation progresses
   - Document any deviations from the plan
   - Add troubleshooting section

3. **API Documentation**
   - JSDoc comments for all public APIs
   - Generate API docs with TypeDoc (optional)

#### Testing

1. **Unit Tests**
   - Config loading and merging
   - Task mapping (md2do ↔ Todoist)
   - Sync conflict detection
   - File modification utilities

2. **Integration Tests**
   - Mock Todoist API responses
   - Test full command workflows
   - Test error handling

3. **E2E Tests**
   - Test with real markdown files (fixtures)
   - Test config file loading
   - Test dry-run mode

4. **Manual Testing Checklist**
   - [ ] Create task in Todoist from markdown
   - [ ] Import markdown task to Todoist
   - [ ] Sync completion status (both directions)
   - [ ] Sync due dates (both directions)
   - [ ] Handle Todoist task deletion
   - [ ] Multi-account configuration
   - [ ] Error messages are clear and actionable

#### Deliverables

- ✅ README.md updated with Todoist section
- ✅ Implementation plan updated
- ✅ All tests passing
- ✅ Manual testing completed

## Technical Decisions

### File Modification Approach

**Chosen: Direct Line Replacement**

Pros:

- Simple and fast
- Preserves exact formatting
- Predictable behavior

Cons:

- Assumes task hasn't moved to different line
- Requires careful validation

**Alternative: Parse → Modify → Regenerate**

Pros:

- More robust to file changes
- Could normalize formatting

Cons:

- May not preserve user formatting
- More complex implementation

**Mitigation:** Start with direct line replacement. If task is found at a different line (by ID), warn user and offer to update anyway.

### Priority Mapping

md2do uses semantic priorities (`urgent`, `high`, `normal`, `low`), while Todoist uses numeric priorities (1-4).

**Mapping:**

- md2do `urgent` → Todoist `4` (P1)
- md2do `high` → Todoist `3` (P2)
- md2do `normal` → Todoist `2` (P3)
- md2do `low` → Todoist `1` (P4)

### Sync Frequency

**v1: Manual only**

- User runs `md2do todoist sync` explicitly
- Safe, predictable, no surprises

**Future: Auto-sync options**

- `--auto-sync` flag on `md2do list`
- Watch mode: `md2do todoist watch`
- Git hooks: sync on commit

### Conflict Resolution Strategy

**Default: Todoist wins for completion, timestamps win for dates**

This matches typical workflows:

- Users complete tasks in Todoist (shared with team)
- Users plan/schedule tasks in markdown (personal notes)

**Override:** `--prefer markdown` or `--prefer todoist` flag

## Success Criteria

### Phase 6 is complete when:

- [x] Can create Todoist task from CLI
- [x] Can list Todoist tasks in md2do format
- [x] Can import markdown task to Todoist (adds `[todoist:ID]`)
- [x] Can sync task completion status bidirectionally
- [x] Can sync due dates bidirectionally
- [x] File modification is safe (atomic writes)
- [x] Configuration works (env, global, project)
- [x] All tests pass (unit, integration, e2e)
- [x] Documentation is comprehensive
- [x] Manual testing checklist completed

## Risks & Mitigation

| Risk                            | Impact | Mitigation                                            |
| ------------------------------- | ------ | ----------------------------------------------------- |
| **File corruption from writes** | High   | Atomic writes, temp files, backups                    |
| **Sync conflicts**              | Medium | Clear resolution strategy, user prompts, dry-run mode |
| **API rate limiting**           | Medium | Request batching, exponential backoff, queue          |
| **Todoist API changes**         | Low    | Use official SDK, version pinning                     |
| **Task moved in markdown**      | Low    | ID-based lookup fallback, warn user                   |
| **Network failures**            | Medium | Retry logic, offline mode detection                   |
| **Invalid tokens**              | Low    | Clear error messages, config validation               |

## Future Enhancements (Post-v1)

### Interactive Setup

```bash
md2do todoist init
```

- Open browser to Todoist settings
- Guide user through token creation
- Validate token
- Save to config interactively

### Advanced Sync Features

- Webhook support for real-time sync
- Support for Todoist subtasks
- Support for Todoist sections
- Support for Todoist comments
- Bulk import/export
- Migration tools

### Watch Mode

```bash
md2do todoist watch
```

- Monitor markdown files for changes
- Auto-sync on file save
- Desktop notifications

### UI Enhancements

- Interactive conflict resolution
- Progress bars for sync operations
- Colored diff output for dry-run

## Appendix

### Todoist API Resources

- **Official Docs**: https://developer.todoist.com/rest/v2/
- **TypeScript SDK**: https://www.npmjs.com/package/@doist/todoist-api-typescript
- **GitHub Repo**: https://github.com/Doist/todoist-api-typescript

### Configuration Examples

**Minimal config:**

```json
{
  "todoist": {
    "apiToken": "abc123..."
  }
}
```

**Full config:**

```json
{
  "markdown": {
    "root": "~/Documents/notes",
    "exclude": ["archive/", ".git/"]
  },
  "defaultAssignee": "nick",
  "todoist": {
    "apiToken": "abc123...",
    "defaultProject": "Work",
    "autoSync": false,
    "syncDirection": "both",
    "labelMapping": {
      "urgent": "priority-high",
      "backend": "engineering"
    }
  },
  "output": {
    "format": "pretty",
    "colors": true,
    "paths": true
  }
}
```

### Task Syntax Examples

**Markdown task with Todoist sync:**

```markdown
- [ ] Review PR #423 @nick !! #backend [due:2026-01-20] [todoist:7654321]
```

**After completing in Todoist and syncing:**

```markdown
- [x] Review PR #423 @nick !! #backend [due:2026-01-20] [todoist:7654321] [completed:2026-01-19]
```

## Implementation Timeline

| Phase             | Estimated Time  | Description                           |
| ----------------- | --------------- | ------------------------------------- |
| 1. Configuration  | 2-3 hours       | Config loading, validation, hierarchy |
| 2. API Client     | 3-4 hours       | Todoist package, client, mapper       |
| 3. File Writer    | 3-4 hours       | Safe markdown modification            |
| 4. CLI Commands   | 4-5 hours       | list, add, import, sync commands      |
| 5. Sync Logic     | 4-5 hours       | Conflict detection, resolution        |
| 6. Docs & Testing | 2-3 hours       | Documentation, comprehensive tests    |
| **Total**         | **18-24 hours** | ~3-4 days of focused work             |

## Notes

- Keep commits atomic (one phase at a time)
- Test each phase thoroughly before moving to next
- Update this document as implementation progresses
- Document any deviations from the plan
- Add troubleshooting section as issues are discovered
