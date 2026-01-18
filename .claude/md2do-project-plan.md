# md2do Project Plan

## Overview

**md2do** is a CLI tool for scanning, filtering, and managing TODO items across markdown files. It provides intelligent parsing of tasks with context awareness (dates, assignees, priorities, tags) and optional integration with Todoist for shared task management.

## Core Philosophy

- **Read-first approach**: v1 focuses on parsing and displaying tasks, not modifying markdown files
- **Context-aware**: Extract metadata from file structure and heading dates
- **Flexible filtering**: Support multiple dimensions (assignee, project, priority, due date, tags)
- **VSCode-friendly**: Output formats that enable command+click navigation
- **MCP-ready**: Architecture supports future MCP server wrapper

## Architecture

```
md2do/
├── packages/
│   ├── core/              # Pure TypeScript business logic (no I/O)
│   │   ├── src/
│   │   │   ├── parser/    # Markdown parsing
│   │   │   ├── scanner/   # File system scanning
│   │   │   ├── filters/   # Task filtering logic
│   │   │   ├── types/     # TypeScript interfaces
│   │   │   └── utils/     # Date parsing, sorting
│   │   └── tests/
│   │
│   ├── cli/               # Command-line interface
│   │   ├── src/
│   │   │   ├── commands/  # CLI commands (list, stats, todoist)
│   │   │   ├── formatters/# Output formatting
│   │   │   └── config/    # Configuration management
│   │   └── tests/
│   │
│   └── mcp/               # MCP server (future)
│       └── src/
│           ├── server.ts
│           └── tools/
│
├── examples/              # Example markdown files (for docs & E2E tests)
│   ├── projects/
│   │   ├── acme-app/
│   │   │   └── sprint-notes.md
│   │   └── widget-co/
│   │       └── planning.md
│   ├── 1-1s/
│   │   ├── jane-doe.md
│   │   └── alex-chen.md
│   └── personal/
│       ├── travel.md
│       └── home.md
│
├── .md2dorc.example       # Example configuration
└── README.md
```

## Core Data Model

```typescript
interface Task {
  // Identity
  id: string; // Hash of file+line+text for stability

  // Content
  text: string; // Task description (without metadata)
  completed: boolean; // [ ] vs [x]

  // Location
  file: string; // Relative path from markdown root
  line: number; // Line number in file

  // Extracted context
  project?: string; // From folder structure (e.g., "acme-app" from projects/acme-app/)
  person?: string; // From file name (e.g., "jane-doe" from 1-1s/jane-doe.md)
  contextDate?: Date; // From nearest heading (e.g., "## Meeting 1/13/26")
  contextHeading?: string; // The heading itself for display

  // Explicit metadata (parsed from task text)
  assignee?: string; // @nick, @jonathan, @jenny
  dueDate?: Date; // [due: 2026-01-25] or [due: tomorrow]
  priority?: Priority; // !!!, !!, !, or undefined
  tags: string[]; // #divvy, #urgent, #followup

  // Optional Todoist sync
  todoistId?: string; // [todoist:123456789]
  completedDate?: Date; // [completed: 2026-01-18]
}

enum Priority {
  URGENT = 'urgent', // !!!
  HIGH = 'high', // !!
  NORMAL = 'normal', // !
  LOW = 'low', // (none)
}
```

## Syntax Specification

### Task Format

```markdown
- [ ] @assignee Task description [due: YYYY-MM-DD] priority tags
```

### Assignees

```markdown
- [ ] @nick Review the PR
- [ ] @jonathan Update docs
- [ ] @jenny Book train tickets
```

### Priority Levels

```markdown
- [ ] Critical production bug !!! #urgent
- [ ] Review before standup !!
- [ ] Update documentation !
- [ ] Nice-to-have feature
```

### Due Dates

```markdown
- [ ] Task [due: 2026-01-25] # Absolute date
- [ ] Task [due: tomorrow] # Relative (requires context date)
- [ ] Task [due: next week] # Relative
- [ ] Task [due: 1/25] # Short format (infer year from context)
```

### Tags

```markdown
- [ ] @nick Review PR #acme-app #backend #urgent
```

### Completion Tracking

```markdown
- [x] @nick Finished task [completed: 2026-01-18]
```

### Todoist Sync Marker

```markdown
- [ ] @jenny Book trains [todoist:123456789]
```

### Context Extraction

**From heading dates:**

```markdown
## Sprint Planning 1/13/26

- [ ] @nick Review PR [due: tomorrow]

  # contextDate = 2026-01-13

  # dueDate = 2026-01-14 (calculated)

- [ ] @jonathan Deploy
  # contextDate = 2026-01-13 (no explicit due date)
```

**From file paths:**

```markdown
# File: ~/Documents/markdown/projects/acme-app/sprint-notes.md

- [ ] Update API docs
  # project = "acme-app"

# File: ~/Documents/markdown/1-1s/jane-doe.md

- [ ] Get Jane dashboard access
  # person = "jane-doe"
```

## CLI Commands

### Core Commands

```bash
# List all tasks
md2do list

# Filter by assignee
md2do list --assignee=me           # Default: @nick
md2do list --assignee=jonathan
md2do list --assignee=jenny
md2do list --unassigned            # Tasks with no @person

# Filter by status
md2do list --overdue
md2do list --due=today
md2do list --due=this-week
md2do list --due=this-month
md2do list --completed             # Show completed tasks

# Filter by priority
md2do list --priority=urgent       # !!!
md2do list --priority=high         # !!
md2do list --priority=normal       # !
md2do list --priority=low          # (none)

# Filter by project/person context
md2do list --project=acme-app
md2do list --person=jane-doe

# Filter by tags
md2do list --tag=urgent
md2do list --tag=backend

# Path filters
md2do list --path=projects/acme-app
md2do list --no-recurse

# Sorting
md2do list --sort=due              # By due date
md2do list --sort=priority         # By priority
md2do list --sort=created          # By context date
md2do list --sort=file             # By file path

# Combinations
md2do list --assignee=me --overdue --priority=high
md2do list --project=acme-app --due=this-week
```

### Stats Command

```bash
md2do stats                        # Overall summary
md2do stats --assignee=me
md2do stats --by=assignee          # Group by assignee
md2do stats --by=project           # Group by project
md2do stats --by=priority          # Group by priority
```

Example output:

```
md2do Statistics
─────────────────────────────────

Total Tasks: 47
  Incomplete: 42
  Completed: 5

Status:
  Overdue: 5
  Due today: 3
  Due this week: 12
  Future: 22

By Priority:
  Urgent (!!!): 2
  High (!!): 8
  Normal (!): 15
  Low: 17

By Assignee:
  @nick: 23
  @jonathan: 12
  @jenny: 8
  (unassigned): 4

By Project:
  acme-app: 23
  widget-co: 12
  personal: 12
```

### Todoist Integration (Future)

```bash
# Add task directly to Todoist (no markdown)
md2do todoist add "Buy groceries [due: tomorrow]" --project=Personal

# Import markdown task to Todoist
md2do todoist import <file>:<line>
# Adds [todoist:123456789] to the markdown task

# List Todoist tasks
md2do todoist list
md2do todoist list --filter="@jenny"

# Sync (future: bi-directional)
md2do todoist sync
```

### Config Commands

```bash
md2do config show                  # Show current config
md2do config get markdown.root
md2do config set markdown.root ~/Documents/notes
md2do config set todoist.token xxx
md2do config reset                 # Reset to defaults
```

## Configuration

### Config File: `~/.md2dorc`

```yaml
# Markdown settings
markdown:
  root: ~/Documents/markdown
  excludePaths:
    - archive/
    - templates/
    - .git/
  filePattern: '**/*.md'

# Default assignee (for --assignee=me)
defaultAssignee: nick

# Output settings
output:
  format: pretty # pretty | json | csv
  colors: true
  includeFilePaths: true
  pathFormat: 'file://{absolutePath}:{line}' # For VSCode command+click

# Syntax configuration
syntax:
  # Priority markers
  priority:
    urgent: ['!!!']
    high: ['!!']
    normal: ['!']

  # Due date formats
  dueDate:
    absolute: '\[due:\s*(\d{4}-\d{2}-\d{2})\]'
    relative: '\[due:\s*(tomorrow|today|next\s+week|next\s+month)\]'
    shortDate: '\[due:\s*(\d{1,2}/\d{1,2})\]'

  # Assignee pattern
  assignee: '@([\w-]+)'

  # Tag pattern
  tag: '#([\w-]+)'

  # Completion
  completed: '\[completed:\s*(\d{4}-\d{2}-\d{2})\]'

  # Todoist sync
  todoist: '\[todoist:\s*(\d+)\]'

# Heading date parsing
headingDate:
  patterns:
    - '##\s+.*?(\d{1,2}/\d{1,2}/\d{2,4})' # MM/DD/YY or MM/DD/YYYY
    - '##\s+.*?(\d{4}-\d{2}-\d{2})' # YYYY-MM-DD
    - '##\s+.*?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}'

# Todoist integration (future)
todoist:
  enabled: false
  apiToken: null
  defaultProject: 'Inbox'
  syncLabels:
    - personal
    - home
```

## Output Formatting

### Pretty Format (Default)

```bash
$ md2do list --assignee=me --overdue

🔴 OVERDUE (3)
────────────────────────────────────────────────────────────
!! Review PR #423 (acme-app)
   Due: 1/15/26 (3 days ago)
   @nick #acme-app #backend
   file:///Users/nick/Documents/markdown/projects/acme-app/sprint-planning.md:4
   Context: Sprint Planning 1/13/26

!  Get Jane access to prod dashboard (1-1: jane-doe)
   Due: 1/12/26 (6 days ago)
   @nick
   file:///Users/nick/Documents/markdown/1-1s/jane-doe.md:12
   Context: 1-1 Meeting 1/10/26

   Follow up on Italy rental deposit (personal)
   Due: 1/10/26 (8 days ago)
   @nick #travel #italy
   file:///Users/nick/Documents/markdown/personal/travel/italy-2026.md:45
   Context: Trip Planning

📅 DUE TODAY (2)
────────────────────────────────────────────────────────────
...
```

### JSON Format

```bash
$ md2do list --assignee=me --format=json

{
  "tasks": [
    {
      "id": "a3f2d8b1",
      "text": "Review PR #423",
      "completed": false,
      "file": "projects/acme-app/sprint-planning.md",
      "line": 4,
      "project": "acme-app",
      "contextDate": "2026-01-13T00:00:00Z",
      "contextHeading": "Sprint Planning 1/13/26",
      "assignee": "nick",
      "dueDate": "2026-01-15T00:00:00Z",
      "priority": "high",
      "tags": ["acme-app", "backend"],
      "overdue": true,
      "daysOverdue": 3
    }
  ],
  "summary": {
    "total": 42,
    "overdue": 3,
    "dueToday": 2
  }
}
```

## Implementation Phases

### Phase 1: Core Parsing (Week 1)

**Goal:** Parse markdown files and extract tasks with metadata

- [ ] Set up monorepo with pnpm + Turborepo
- [ ] Define TypeScript interfaces (Task, Config, etc.)
- [ ] Implement markdown file scanner
- [ ] Parse GFM task syntax `- [ ]` / `- [x]`
- [ ] Extract assignees `@person`
- [ ] Extract priority `!`, `!!`, `!!!`
- [ ] Extract tags `#tag`
- [ ] Extract due dates `[due: YYYY-MM-DD]`
- [ ] Extract Todoist IDs `[todoist:123]`
- [ ] Extract completion dates `[completed: YYYY-MM-DD]`
- [ ] Unit tests for parser

### Phase 2: Context Extraction (Week 1-2)

**Goal:** Extract project, person, and date context from file structure and headings

- [ ] Parse project from folder structure (`projects/acme-app/` → `acme-app`)
- [ ] Parse person from 1-1 file names (`1-1s/jane-doe.md` → `jane-doe`)
- [ ] Parse dates from headings (multiple formats)
- [ ] Associate tasks with nearest heading date
- [ ] Resolve relative dates (`tomorrow`, `next week`) using context
- [ ] Handle missing context (warnings for relative dates without context)
- [ ] Unit tests for context extraction

### Phase 3: Filtering & Sorting (Week 2)

**Goal:** Implement all filter and sort operations

- [ ] Filter by assignee (including `--assignee=me`)
- [ ] Filter by completion status
- [ ] Filter by due date (overdue, today, this week, etc.)
- [ ] Filter by priority
- [ ] Filter by project
- [ ] Filter by person (from file context)
- [ ] Filter by tags
- [ ] Filter by path (with --no-recurse option)
- [ ] Sort by due date, priority, created date, file
- [ ] Unit tests for filters

### Phase 4: CLI Interface (Week 2-3)

**Goal:** Build the command-line interface

- [ ] Set up CLI framework (commander.js or yargs)
- [ ] Implement `md2do list` command with all filters
- [ ] Implement `md2do stats` command
- [ ] Implement `md2do config` commands
- [ ] Pretty output formatter (with colors, emojis)
- [ ] JSON output formatter
- [ ] VSCode-friendly file paths (command+clickable)
- [ ] Help documentation
- [ ] Integration tests

### Phase 5: Configuration (Week 3)

**Goal:** Support user configuration

- [ ] Config file loading (`~/.md2dorc`)
- [ ] Config validation
- [ ] XDG config directory support
- [ ] Default config generation
- [ ] Config override from CLI flags
- [ ] Environment variable support
- [ ] Documentation for config options

### Phase 6: Polish & Documentation (Week 3-4)

**Goal:** Production-ready v1.0

- [ ] Error handling and user-friendly messages
- [ ] Performance optimization (large repos)
- [ ] Comprehensive README
- [ ] Usage examples
- [ ] GIF demos
- [ ] npm package setup
- [ ] Installation instructions
- [ ] Changelog

### Phase 7: Todoist Integration (Week 4+, Optional)

**Goal:** Bridge to Todoist for shared tasks

- [ ] Todoist API client
- [ ] `md2do todoist add` command
- [ ] `md2do todoist list` command
- [ ] `md2do todoist import` - add [todoist:id] to markdown
- [ ] Todoist config (API token, project mapping)
- [ ] Future: bi-directional sync

### Phase 8: MCP Server (Future)

**Goal:** Expose md2do functionality via MCP

- [ ] MCP server setup
- [ ] Tool: `scan_todos` with filters
- [ ] Tool: `get_todo` by ID
- [ ] Tool: `stats` summary
- [ ] Tool: `search_tasks` with text search
- [ ] Integration with Claude.ai
- [ ] Documentation for MCP usage

## Testing Strategy

### Unit Tests

- Parser functions (extract assignees, dates, priorities, tags)
- Context extraction (projects, persons, heading dates)
- Date resolution (relative dates)
- Filter logic
- Sort logic
- Config loading and validation

### Integration Tests

- Full file scanning
- CLI command execution
- Output formatting
- Config file handling

### E2E Tests

- Validate against `examples/` directory
- Test all CLI commands with realistic data
- Verify filters, sorting, and output formats work end-to-end
- Ensures examples stay in sync with actual functionality

### Examples Directory

The `examples/` directory serves dual purposes:

1. **User Documentation**: Demonstrates real-world usage with complete, realistic markdown files
2. **E2E Test Fixtures**: Provides known data for end-to-end testing

**Structure:**

- `examples/projects/acme-app/` - Project with sprint planning, deadlines, team tasks
- `examples/projects/widget-co/` - Second project demonstrating multi-project support
- `examples/1-1s/jane-doe.md` - 1-on-1 meeting notes with action items
- `examples/1-1s/alex-chen.md` - Another 1-on-1 for variety
- `examples/personal/travel.md` - Personal tasks with various metadata
- `examples/personal/home.md` - Mix of simple and complex tasks

**Each file demonstrates:**

- All priority levels (!, !!, !!!)
- Multiple assignees (@nick, @jane, @alex)
- Due dates (absolute, relative with context)
- Tags for categorization
- Completed tasks with timestamps
- Heading dates for context extraction
- Edge cases (unassigned tasks, no priority, etc.)

### Fixtures

```
tests/fixtures/
├── simple.md              # Basic task syntax
├── with-dates.md          # Various date formats
├── with-context.md        # Heading dates, file structure
├── complex.md             # All features combined
└── edge-cases.md          # Empty files, malformed syntax
```

### Test Data Structure

```
tests/fixtures/
└── sample-markdown/
    ├── projects/
    │   ├── acme-app/
    │   │   └── sprint-notes.md
    │   └── widget-co/
    │       └── planning.md
    ├── 1-1s/
    │   ├── jane-doe.md
    │   └── alex-chen.md
    └── personal/
        └── travel.md
```

## Tech Stack

- **Language:** TypeScript
- **Package Manager:** pnpm
- **Monorepo:** Turborepo
- **CLI Framework:** commander or yargs
- **Testing:** Vitest
- **Markdown Parsing:** remark / unified (or custom regex)
- **Date Parsing:** date-fns
- **Config:** cosmiconfig
- **Output Formatting:** chalk, cli-table3
- **Future Todoist:** @doist/todoist-api-typescript
- **Future MCP:** @modelcontextprotocol/sdk

## Code Quality

- **Linting:** ESLint with TypeScript
- **Formatting:** Prettier
- **Type Checking:** Strict TypeScript
- **Git Hooks:** Husky + lint-staged
- **CI:** GitHub Actions (lint, test, type-check)

## Future Enhancements

### v2.0 Features

- [ ] Task modification via CLI (`md2do done`, `md2do update`)
- [ ] Stable task IDs (hash-based)
- [ ] Git-aware modification (don't modify uncommitted files)
- [ ] Watch mode (live updates)
- [ ] Task dependencies (`@depends-on(task-id)`)
- [ ] Recurring tasks (`@recurring(weekly)`)
- [ ] Task templates
- [ ] Export to other formats (GitHub Issues, Jira, etc.)

### MCP Integration Ideas

- Expose todos via MCP for Claude.ai conversations
- "What am I overdue on?"
- "Show me todos for my 1-1 with Jane tomorrow"
- Natural language task creation
- Smart suggestions based on task history

### Advanced Features

- Text search across task descriptions
- Full-text search in surrounding markdown context
- Time tracking integration
- Task archival (move completed tasks to archive files)
- Bulk operations
- Task reports (velocity, completion rates)
- Integration with calendar apps

## Success Metrics

**v1.0 is successful when:**

- [x] Accurately parses all tasks from markdown files
- [x] Correctly extracts context (projects, persons, dates)
- [x] Supports all documented filters and sorts
- [x] Produces VSCode-clickable output
- [x] Has comprehensive test coverage (>80%)
- [x] Has clear documentation
- [x] Is fast enough for repos with 1000+ tasks (<1 second)

## Resources

- **Markdown Spec:** https://spec.commonmark.org/
- **GFM Spec:** https://github.github.com/gfm/
- **Todoist API:** https://developer.todoist.com/
- **MCP Spec:** https://modelcontextprotocol.io/
- **Date-fns:** https://date-fns.org/

## Questions to Resolve

- [ ] Should we support custom task markers beyond `- [ ]`? (e.g., `* [ ]`, `+ [ ]`)
- [ ] How to handle tasks split across multiple lines?
- [ ] Should tags be case-sensitive? (#Divvy vs #divvy)
- [ ] Date format preference for short dates? (MM/DD vs DD/MM)
- [ ] Should we auto-create config file on first run?
- [ ] Default sort order for `md2do list`?
- [ ] Should stats command include completed tasks by default?

## Notes

- Keep the core library pure (no I/O) for testability and future MCP use
- CLI should be thin wrapper around core logic
- Prioritize correct parsing over performance initially
- Document all regex patterns thoroughly
- Use fixtures for all test scenarios
- Design for extensibility (easy to add new filters, formats, integrations)
