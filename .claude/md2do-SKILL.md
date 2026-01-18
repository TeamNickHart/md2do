# md2do Development Skill

## When to Use This Skill

Use this skill when:

- Building or modifying the md2do CLI tool
- Working on markdown task parsing
- Implementing filters, sorting, or context extraction
- Adding new CLI commands or features
- Writing tests for md2do functionality
- Questions about md2do architecture or patterns

## Overview

**md2do** is a CLI tool for scanning and managing TODO items in markdown files. It provides intelligent parsing with context awareness and is architected to support future MCP server integration.

**Key Reference:** Always consult `/path/to/md2do-project-plan.md` for complete specifications, data models, and implementation phases.

## Library-First Development Philosophy

**Critical: Always check for established libraries before implementing custom solutions.**

### Discovery Process

Before writing custom code, follow this checklist:

1. **Search npm** - Search for the problem domain (e.g., "node config file", "cli argument parser")
2. **Verify quality** - Check weekly downloads (>100k/week indicates well-maintained)
3. **Check TypeScript support** - Look for native types or @types packages
4. **Review recent activity** - Last update within 6 months preferred
5. **Read the README** - If it solves 80%+ of the problem, use it
6. **Check bundle size** - Use bundlephobia.com to avoid bloat

### Recommended Libraries by Category

**CLI & Terminal:**

- **commander** or **yargs** - Argument parsing (don't write custom argv parsing)
- **chalk** - Terminal colors (don't use console color codes)
- **ora** - Spinners and loading indicators
- **cli-table3** - Tables (don't manually format with spaces)
- **inquirer** or **prompts** - Interactive prompts
- **boxen** - Draw boxes around text

**Configuration:**

- **cosmiconfig** - Config file discovery and loading (CRITICAL - don't write custom)
- **dotenv** - Environment variables
- **zod** or **joi** - Configuration validation

**File System:**

- **fast-glob** or **glob** - File pattern matching (don't use manual readdir recursion)
- **fs-extra** - Enhanced fs with promises (better than native fs for CLI apps)
- **chokidar** - File watching (for future watch mode)

**Date/Time:**

- **date-fns** - Date manipulation (don't use native Date math)
- **date-fns-tz** - Timezone support if needed

**Validation & Parsing:**

- **zod** - Schema validation with TypeScript inference (preferred)
- **joi** - Alternative, more established but worse TypeScript

**Markdown & Text:**

- **remark** / **unified** - Full AST (for complex parsing)
- **marked** - Simple, fast parser (if AST not needed)
- **gray-matter** - Frontmatter parsing (if you add YAML support)
- **string-width** - Terminal string width (handles emoji/unicode)

**Utilities:**

- **execa** - Run shell commands (better than child_process)
- **which** - Find executables in PATH
- **update-notifier** - Notify users of new versions

**Build & Dev:**

- **tsx** - Run TypeScript directly (better than ts-node)
- **tsup** - Bundle for npm publishing
- **concurrently** - Run multiple commands in parallel

### Common Anti-Patterns to Avoid

Never reinvent these wheels:

```typescript
// ❌ DON'T: Custom config file parsing
function loadConfig() {
  const configPath = path.join(os.homedir(), '.md2dorc');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
}

// ✅ DO: Use cosmiconfig
import { cosmiconfig } from 'cosmiconfig';
const explorer = cosmiconfig('md2do');
const result = await explorer.search();
```

```typescript
// ❌ DON'T: Manual date math
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1); // Mutates!

// ✅ DO: Use date-fns
import { addDays } from 'date-fns';
const tomorrow = addDays(new Date(), 1); // Immutable
```

```typescript
// ❌ DON'T: Manual argument parsing
const args = process.argv.slice(2);
const command = args[0];
const flags = {};
for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    flags[args[i].slice(2)] = args[i + 1];
  }
}

// ✅ DO: Use commander
import { Command } from 'commander';
const program = new Command();
program.command('list').option('-a, --assignee <name>').action(handleList);
```

```typescript
// ❌ DON'T: String concatenation for colors
console.log('\x1b[31m' + error + '\x1b[0m');

// ✅ DO: Use chalk
import chalk from 'chalk';
console.log(chalk.red(error));
```

```typescript
// ❌ DON'T: Manual glob recursion
function findMarkdownFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ✅ DO: Use fast-glob
import fg from 'fast-glob';
const files = await fg('**/*.md', { cwd: dir, ignore: ['node_modules'] });
```

### When to Build Custom

Only implement custom solutions when:

1. **No library exists** for your specific use case
2. **Poor maintenance** - Library hasn't been updated in 2+ years
3. **Excessive dependencies** - Library pulls in 50+ packages for simple task
4. **Performance critical** - Library is measurably too slow for your needs
5. **Massive overkill** - Library is 10x more complex than what you need
6. **Security concerns** - Known vulnerabilities with no fixes

**Example: For md2do task parsing**

- ✅ Custom regex parser is appropriate (no library for this specific syntax)
- ✅ Custom filter logic is appropriate (domain-specific)
- ❌ Custom config loading would be inappropriate (cosmiconfig exists)
- ❌ Custom CLI framework would be inappropriate (commander exists)

### Library Selection for md2do

**Core dependencies:**

```json
{
  "dependencies": {
    "commander": "^11.0.0", // CLI framework
    "chalk": "^5.0.0", // Terminal colors
    "cosmiconfig": "^9.0.0", // Config loading
    "date-fns": "^3.0.0", // Date utilities
    "fast-glob": "^3.3.0", // File pattern matching
    "zod": "^3.22.0" // Validation
  },
  "devDependencies": {
    "vitest": "^1.0.0", // Testing
    "@vitest/ui": "^1.0.0", // Test UI
    "tsx": "^4.0.0" // Run TypeScript
  }
}
```

**Optional enhancements:**

```json
{
  "dependencies": {
    "ora": "^7.0.0", // Loading spinners
    "cli-table3": "^0.6.0", // Tables for stats
    "inquirer": "^9.0.0", // Interactive prompts (for md2do done)
    "update-notifier": "^7.0.0" // Version check
  }
}
```

## Project Architecture

### Monorepo Structure

```
md2do/
├── packages/
│   ├── core/              # Pure TypeScript (no I/O, 100% testable)
│   ├── cli/               # Command-line interface
│   └── mcp/               # MCP server (future)
├── package.json           # Workspace root
└── pnpm-workspace.yaml
```

**Critical:** Keep `core` package pure (no file I/O, no console.log). All I/O happens in `cli` package.

### Core Package Responsibilities

The `core` package contains pure business logic:

- Type definitions (`types/`)
- Markdown parsing (`parser/`)
- File scanning (`scanner/`)
- Filtering logic (`filters/`)
- Sorting logic (`sorters/`)
- Utilities (`utils/`) - date parsing, ID generation

### CLI Package Responsibilities

The `cli` package handles I/O and user interaction:

- Command definitions (`commands/`)
- Output formatting (`formatters/`)
- Configuration management (`config/`)
- File system operations
- User input/output

## TypeScript Conventions

### Code Style

**Follow Nick's preferences:**

- Use 2-space indentation
- Always use semicolons
- Prefer `const` over `let`
- Use trailing commas in multiline structures
- Prefer functional patterns (map, filter, reduce) over loops
- Use descriptive variable names (no single letters except in short lambdas)
- Extract magic numbers to named constants
- Prefer pure functions with explicit inputs/outputs

**Example:**

```typescript
// Good
const incompleteTasks = tasks.filter((task) => !task.completed);
const sortedByDue = incompleteTasks.sort((a, b) =>
  compareDates(a.dueDate, b.dueDate),
);

// Avoid
let result = [];
for (let i = 0; i < tasks.length; i++) {
  if (!tasks[i].completed) {
    result.push(tasks[i]);
  }
}
```

### Type Safety

- Use strict TypeScript settings
- Avoid `any` - use `unknown` if type is truly unknown
- Define explicit interfaces for all data structures
- Use discriminated unions for variant types
- Prefer `type` for unions/primitives, `interface` for objects

**Example:**

```typescript
// Core task type
interface Task {
  id: string;
  text: string;
  completed: boolean;
  // ... other fields
}

// Filter result type
interface FilterResult {
  tasks: Task[];
  metadata: {
    total: number;
    filtered: number;
  };
}

// Priority as discriminated union
type Priority = 'urgent' | 'high' | 'normal' | 'low';
```

### Error Handling

- Always handle promise rejections
- Use custom Error classes for domain errors
- Provide helpful error messages with context
- Never swallow errors silently

**Example:**

```typescript
class TaskParsingError extends Error {
  constructor(
    message: string,
    public file: string,
    public line: number,
  ) {
    super(`${message} at ${file}:${line}`);
    this.name = 'TaskParsingError';
  }
}

// Usage
if (!isValidTaskSyntax(line)) {
  throw new TaskParsingError('Invalid task syntax', currentFile, lineNumber);
}
```

## Parser Implementation

### Regex Patterns

**Store all regex patterns in constants with clear names:**

```typescript
// parser/patterns.ts
export const PATTERNS = {
  TASK_CHECKBOX: /^(\s*)-\s+\[([ xX])\]\s+/,
  ASSIGNEE: /@([\w-]+)/g,
  PRIORITY_URGENT: /!!!/,
  PRIORITY_HIGH: /!!/,
  PRIORITY_NORMAL: /(?<!!)!(?!!)/, // Single ! not part of !! or !!!
  DUE_DATE_ABSOLUTE: /\[due:\s*(\d{4}-\d{2}-\d{2})\]/,
  DUE_DATE_RELATIVE: /\[due:\s*(tomorrow|today|next\s+week)\]/i,
  TAG: /#([\w-]+)/g,
  TODOIST_ID: /\[todoist:\s*(\d+)\]/,
  COMPLETED_DATE: /\[completed:\s*(\d{4}-\d{2}-\d{2})\]/,
  HEADING_DATE: /^#{1,6}\s+.*?(\d{1,2}\/\d{1,2}\/\d{2,4})/,
} as const;
```

**Document each regex with examples:**

```typescript
/**
 * Matches GFM task checkbox syntax
 *
 * Examples:
 *   "- [ ] Task" → match, incomplete
 *   "- [x] Task" → match, complete
 *   "  - [X] Task" → match, complete (case-insensitive)
 *   "* [ ] Task" → no match (not supported)
 */
export const TASK_CHECKBOX = /^(\s*)-\s+\[([ xX])\]\s+/;
```

### Parsing Pipeline

Follow this pattern for parsing tasks:

```typescript
export function parseTask(
  line: string,
  lineNumber: number,
  file: string,
  context: ParsingContext,
): Task | null {
  // 1. Check if line is a task
  const taskMatch = line.match(PATTERNS.TASK_CHECKBOX);
  if (!taskMatch) return null;

  // 2. Extract completion status
  const completed = taskMatch[2].toLowerCase() === 'x';

  // 3. Extract text (everything after checkbox)
  const fullText = line.substring(taskMatch[0].length);

  // 4. Parse metadata from text
  const assignee = extractAssignee(fullText);
  const priority = extractPriority(fullText);
  const dueDate = extractDueDate(fullText, context);
  const tags = extractTags(fullText);
  const todoistId = extractTodoistId(fullText);
  const completedDate = extractCompletedDate(fullText);

  // 5. Clean text (remove metadata markers)
  const cleanText = cleanTaskText(fullText);

  // 6. Generate stable ID
  const id = generateTaskId(file, lineNumber, cleanText);

  return {
    id,
    text: cleanText,
    completed,
    file,
    line: lineNumber,
    assignee,
    priority,
    dueDate,
    tags,
    todoistId,
    completedDate,
    // Context from file structure and headings
    project: context.project,
    person: context.person,
    contextDate: context.currentDate,
    contextHeading: context.currentHeading,
  };
}
```

### Context Tracking

Track context while scanning files:

```typescript
interface ParsingContext {
  project?: string; // From folder structure
  person?: string; // From filename
  currentDate?: Date; // From most recent heading
  currentHeading?: string; // The heading text itself
}

export class MarkdownScanner {
  private context: ParsingContext = {};

  scanFile(filePath: string, content: string): Task[] {
    // Extract project from path: "projects/divvy/notes.md" → "divvy"
    this.context.project = extractProjectFromPath(filePath);

    // Extract person from filename: "1-1s/jane-doe.md" → "jane-doe"
    this.context.person = extractPersonFromFilename(filePath);

    const tasks: Task[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Update context date from headings
      const headingDate = extractDateFromHeading(line);
      if (headingDate) {
        this.context.currentDate = headingDate;
        this.context.currentHeading = line.trim();
      }

      // Parse task with current context
      const task = parseTask(line, i + 1, filePath, this.context);
      if (task) {
        tasks.push(task);
      }
    }

    return tasks;
  }
}
```

## Date Handling

### Absolute Dates

```typescript
import { parse, isValid } from 'date-fns';

export function parseAbsoluteDate(dateStr: string): Date | null {
  // Try ISO format: 2026-01-25
  let date = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (isValid(date)) return date;

  // Try US format: 1/25/26
  date = parse(dateStr, 'M/d/yy', new Date());
  if (isValid(date)) return date;

  // Try full year: 1/25/2026
  date = parse(dateStr, 'M/d/yyyy', new Date());
  if (isValid(date)) return date;

  return null;
}
```

### Relative Dates

```typescript
import { addDays, addWeeks, startOfWeek } from 'date-fns';

export function resolveRelativeDate(
  relative: string,
  baseDate: Date,
): Date | null {
  const normalized = relative.toLowerCase().trim();

  switch (normalized) {
    case 'today':
      return baseDate;

    case 'tomorrow':
      return addDays(baseDate, 1);

    case 'next week':
      // Next Monday
      return addWeeks(startOfWeek(baseDate, { weekStartsOn: 1 }), 1);

    case 'next month':
      return addMonths(baseDate, 1);

    default:
      return null;
  }
}
```

### Date Warnings

When relative dates lack context:

```typescript
interface DateResolutionWarning {
  file: string;
  line: number;
  text: string;
  reason: string;
}

export function extractDueDate(
  text: string,
  context: ParsingContext,
): { date: Date | null; warning?: DateResolutionWarning } {
  const absoluteMatch = text.match(PATTERNS.DUE_DATE_ABSOLUTE);
  if (absoluteMatch) {
    return { date: parseAbsoluteDate(absoluteMatch[1]) };
  }

  const relativeMatch = text.match(PATTERNS.DUE_DATE_RELATIVE);
  if (relativeMatch) {
    if (!context.currentDate) {
      return {
        date: null,
        warning: {
          file: context.file,
          line: context.line,
          text: text,
          reason: 'Relative due date without context date from heading',
        },
      };
    }

    return {
      date: resolveRelativeDate(relativeMatch[1], context.currentDate),
    };
  }

  return { date: null };
}
```

## Filtering Implementation

### Filter Interface

```typescript
interface TaskFilter {
  assignee?: string | string[];
  completed?: boolean;
  overdue?: boolean;
  dueDate?: {
    before?: Date;
    after?: Date;
    exact?: Date;
  };
  priority?: Priority | Priority[];
  project?: string | string[];
  person?: string | string[];
  tags?: string | string[];
  hasTag?: boolean;
  path?: string;
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return tasks.filter((task) => {
    // Assignee filter
    if (filter.assignee) {
      const assignees = Array.isArray(filter.assignee)
        ? filter.assignee
        : [filter.assignee];
      if (!task.assignee || !assignees.includes(task.assignee)) {
        return false;
      }
    }

    // Completion filter
    if (filter.completed !== undefined) {
      if (task.completed !== filter.completed) {
        return false;
      }
    }

    // Overdue filter
    if (filter.overdue && task.dueDate) {
      const now = new Date();
      if (task.dueDate >= now) {
        return false;
      }
    }

    // Priority filter
    if (filter.priority) {
      const priorities = Array.isArray(filter.priority)
        ? filter.priority
        : [filter.priority];
      if (!task.priority || !priorities.includes(task.priority)) {
        return false;
      }
    }

    // Tags filter
    if (filter.tags) {
      const requiredTags = Array.isArray(filter.tags)
        ? filter.tags
        : [filter.tags];
      const hasAllTags = requiredTags.every((tag) => task.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    return true;
  });
}
```

## CLI Implementation

### Command Structure

Use commander.js pattern:

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('md2do')
  .description('Scan and manage TODOs in markdown files')
  .version('1.0.0');

// List command
program
  .command('list')
  .description('List tasks with optional filters')
  .option('-a, --assignee <name>', 'filter by assignee')
  .option('--overdue', 'show only overdue tasks')
  .option(
    '-p, --priority <level>',
    'filter by priority (urgent|high|normal|low)',
  )
  .option('--project <name>', 'filter by project')
  .option('--tag <tag>', 'filter by tag')
  .option('-s, --sort <field>', 'sort by field (due|priority|created|file)')
  .option('-f, --format <format>', 'output format (pretty|json|csv)', 'pretty')
  .action(async (options) => {
    await handleListCommand(options);
  });

// Stats command
program
  .command('stats')
  .description('Show task statistics')
  .option('-a, --assignee <name>', 'filter by assignee')
  .option('--by <field>', 'group by field (assignee|project|priority)')
  .action(async (options) => {
    await handleStatsCommand(options);
  });

program.parse();
```

### Output Formatting

**Pretty format with colors:**

```typescript
import chalk from 'chalk';

export function formatTasksPretty(tasks: Task[], groupBy?: string): string {
  const lines: string[] = [];

  // Group tasks
  const groups = groupTasks(tasks, groupBy);

  for (const [groupName, groupTasks] of Object.entries(groups)) {
    // Group header
    lines.push('');
    lines.push(chalk.bold.cyan(groupName));
    lines.push(chalk.gray('─'.repeat(60)));

    // Tasks in group
    for (const task of groupTasks) {
      lines.push(formatSingleTask(task));
      lines.push(''); // Blank line between tasks
    }
  }

  return lines.join('\n');
}

function formatSingleTask(task: Task): string {
  const parts: string[] = [];

  // Priority indicator
  const priorityIcon = {
    urgent: '🔴',
    high: '🟠',
    normal: '🟡',
    low: '⚪',
  }[task.priority || 'low'];

  // Priority markers + text
  const priorityMarkers = {
    urgent: '!!!',
    high: '!!',
    normal: '!',
    low: '',
  }[task.priority || 'low'];

  parts.push(`${priorityIcon} ${priorityMarkers} ${task.text}`);

  // Due date with overdue indicator
  if (task.dueDate) {
    const isOverdue = task.dueDate < new Date();
    const dateStr = formatDate(task.dueDate);
    const dueLine = isOverdue
      ? chalk.red(
          `   Due: ${dateStr} (${getDaysOverdue(task.dueDate)} days ago)`,
        )
      : chalk.yellow(`   Due: ${dateStr}`);
    parts.push(dueLine);
  }

  // Assignee and tags
  const metadata: string[] = [];
  if (task.assignee) metadata.push(chalk.blue(`@${task.assignee}`));
  if (task.tags.length > 0) {
    metadata.push(task.tags.map((t) => chalk.cyan(`#${t}`)).join(' '));
  }
  if (metadata.length > 0) {
    parts.push(`   ${metadata.join(' ')}`);
  }

  // File path (command-clickable in VSCode)
  const filePath = makeClickablePath(task.file, task.line);
  parts.push(chalk.gray(`   ${filePath}`));

  // Context
  if (task.contextHeading) {
    parts.push(chalk.dim(`   Context: ${task.contextHeading}`));
  }

  return parts.join('\n');
}

function makeClickablePath(file: string, line: number): string {
  const absolutePath = path.resolve(getMarkdownRoot(), file);
  return `file://${absolutePath}:${line}`;
}
```

**JSON format:**

```typescript
export function formatTasksJSON(tasks: Task[]): string {
  const output = {
    tasks: tasks.map((task) => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      file: task.file,
      line: task.line,
      assignee: task.assignee,
      dueDate: task.dueDate?.toISOString(),
      priority: task.priority,
      tags: task.tags,
      project: task.project,
      person: task.person,
      contextDate: task.contextDate?.toISOString(),
      contextHeading: task.contextHeading,
    })),
    metadata: {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      overdue: tasks.filter((t) => isOverdue(t)).length,
    },
  };

  return JSON.stringify(output, null, 2);
}
```

## Testing Strategy

### Unit Tests

**Test parser functions in isolation:**

```typescript
import { describe, it, expect } from 'vitest';
import { parseTask, PATTERNS } from '../parser';

describe('parseTask', () => {
  it('should parse basic incomplete task', () => {
    const line = '- [ ] Review PR';
    const task = parseTask(line, 1, 'test.md', {});

    expect(task).toMatchObject({
      text: 'Review PR',
      completed: false,
      line: 1,
      file: 'test.md',
    });
  });

  it('should extract assignee', () => {
    const line = '- [ ] @nick Review PR';
    const task = parseTask(line, 1, 'test.md', {});

    expect(task?.assignee).toBe('nick');
    expect(task?.text).toBe('Review PR'); // Assignee removed from text
  });

  it('should parse priority levels', () => {
    expect(parseTask('- [ ] Task !!!', 1, 'test.md', {})?.priority).toBe(
      'urgent',
    );
    expect(parseTask('- [ ] Task !!', 1, 'test.md', {})?.priority).toBe('high');
    expect(parseTask('- [ ] Task !', 1, 'test.md', {})?.priority).toBe(
      'normal',
    );
    expect(parseTask('- [ ] Task', 1, 'test.md', {})?.priority).toBeUndefined();
  });

  it('should handle relative dates with context', () => {
    const context = { currentDate: new Date('2026-01-13') };
    const line = '- [ ] Task [due: tomorrow]';
    const task = parseTask(line, 1, 'test.md', context);

    expect(task?.dueDate).toEqual(new Date('2026-01-14'));
  });

  it('should warn about relative dates without context', () => {
    const line = '- [ ] Task [due: tomorrow]';
    const result = parseTaskWithWarnings(line, 1, 'test.md', {});

    expect(result.task?.dueDate).toBeNull();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].reason).toContain('without context date');
  });
});
```

### Integration Tests

**Test full scanning workflow:**

```typescript
describe('MarkdownScanner integration', () => {
  it('should scan directory and extract all tasks', async () => {
    const scanner = new MarkdownScanner({
      root: 'tests/fixtures/sample-markdown',
    });

    const tasks = await scanner.scanAll();

    expect(tasks).toHaveLength(15); // Known count in fixtures

    // Verify context extraction
    const divvyTasks = tasks.filter((t) => t.project === 'divvy');
    expect(divvyTasks.length).toBeGreaterThan(0);

    const janeTasks = tasks.filter((t) => t.person === 'jane-doe');
    expect(janeTasks.length).toBeGreaterThan(0);
  });
});
```

### Test Fixtures

Create realistic test data:

```
tests/fixtures/
└── sample-markdown/
    ├── projects/
    │   └── divvy/
    │       └── sprint-notes.md
    ├── 1-1s/
    │   └── jane-doe.md
    └── personal/
        └── tasks.md
```

**sprint-notes.md:**

```markdown
# Divvy Sprint Planning

## Sprint 23 - 1/13/26

- [ ] @nick Review API design !! #backend
- [ ] @jonathan Update documentation [due: 1/15/26]
- [x] @greg Fix deployment bug [completed: 1/12/26]

## Backlog

- [ ] Refactor authentication #technical-debt
```

## Configuration Management

### Loading Config

```typescript
import { cosmiconfig } from 'cosmiconfig';

export async function loadConfig(): Promise<Config> {
  const explorer = cosmiconfig('md2do');
  const result = await explorer.search();

  if (!result) {
    return getDefaultConfig();
  }

  return validateConfig(result.config);
}

function validateConfig(config: unknown): Config {
  // Use zod or similar for validation
  const schema = z.object({
    markdown: z.object({
      root: z.string(),
      excludePaths: z.array(z.string()).optional(),
    }),
    defaultAssignee: z.string(),
    // ... other fields
  });

  return schema.parse(config);
}
```

## Performance Considerations

### Large Repository Optimization

```typescript
// Use async iteration for large files
export async function* scanFilesAsync(
  root: string,
  options: ScanOptions,
): AsyncGenerator<Task[]> {
  const files = await findMarkdownFiles(root, options);

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const tasks = parseFile(file, content);
    yield tasks;
  }
}

// Consume incrementally
const allTasks: Task[] = [];
for await (const tasks of scanFilesAsync(markdownRoot, options)) {
  allTasks.push(...tasks);
}
```

### Caching (Future)

```typescript
// Cache parsed results with file hash
interface CacheEntry {
  fileHash: string;
  tasks: Task[];
  timestamp: number;
}

export class TaskCache {
  async getCachedTasks(filePath: string): Promise<Task[] | null> {
    const fileHash = await hashFile(filePath);
    const cached = await this.store.get(filePath);

    if (cached && cached.fileHash === fileHash) {
      return cached.tasks;
    }

    return null;
  }
}
```

## Error Messages

**Be helpful and specific:**

```typescript
// Bad
throw new Error('Invalid date');

// Good
throw new Error(
  `Invalid due date format "[due: ${dateStr}]" in ${file}:${line}\n` +
    `Expected format: [due: YYYY-MM-DD] or [due: tomorrow|next week]`,
);
```

```typescript
// Bad
console.error('Config error');

// Good
console.error(
  chalk.red('Error: ') +
    `Invalid config file at ${configPath}\n` +
    `  ${error.message}\n\n` +
    `Run "md2do config reset" to restore defaults.`,
);
```

## Documentation

### Code Comments

```typescript
/**
 * Extracts project name from file path.
 *
 * Looks for "projects/" directory in path and returns the
 * immediate subdirectory name.
 *
 * @example
 * extractProjectFromPath('projects/divvy/notes.md') // => 'divvy'
 * extractProjectFromPath('1-1s/jane.md') // => undefined
 */
export function extractProjectFromPath(filePath: string): string | undefined {
  const match = filePath.match(/projects\/([^/]+)/);
  return match?.[1];
}
```

### README Sections

Include in README:

- Installation instructions
- Quick start guide
- All CLI commands with examples
- Configuration file format
- Syntax guide (how to write tasks)
- Examples of common workflows
- Troubleshooting section
- Contributing guide

## Common Patterns

### ID Generation

```typescript
import { createHash } from 'crypto';

export function generateTaskId(
  file: string,
  line: number,
  text: string,
): string {
  // Hash file+line+text for stable ID
  // ID stays same unless task moves or text changes
  const content = `${file}:${line}:${text}`;
  return createHash('md5').update(content).digest('hex').substring(0, 8);
}
```

### Path Handling

```typescript
import path from 'path';

// Always work with relative paths internally
export function makeRelativePath(absolutePath: string, root: string): string {
  return path.relative(root, absolutePath);
}

// Convert to absolute for file operations
export function makeAbsolutePath(relativePath: string, root: string): string {
  return path.resolve(root, relativePath);
}
```

## Future MCP Integration Points

Design core with MCP in mind:

```typescript
// Core functions return structured data (MCP-friendly)
export interface ScanResult {
  tasks: Task[];
  warnings: Warning[];
  metadata: {
    filesScanned: number;
    totalTasks: number;
    parseErrors: number;
  };
}

// MCP server will expose these as tools:
// - scan_todos(filters) → ScanResult
// - get_todo(id) → Task
// - stats() → Statistics
// - search_tasks(query) → Task[]
```

## Summary

When building md2do:

1. **Search for libraries first** - Don't reinvent config loading, date math, CLI parsing
2. **Consult the project plan** for specifications
3. **Keep core pure** (no I/O in core package)
4. **Write tests first** for complex parsing logic
5. **Use clear regex patterns** with documentation
6. **Provide helpful errors** with context
7. **Follow Nick's style** (functional, typed, clean)
8. **Think MCP-first** (structured data, pure functions)
9. **Document thoroughly** (code comments, README, examples)

### Essential Libraries to Use

- ✅ **cosmiconfig** for config loading
- ✅ **commander** for CLI framework
- ✅ **chalk** for terminal colors
- ✅ **date-fns** for date operations
- ✅ **fast-glob** for file pattern matching
- ✅ **zod** for validation
- ✅ **vitest** for testing

The goal is a reliable, well-tested tool that Nick can trust for daily task management, with an architecture that supports future MCP server integration for Claude.ai conversations.
