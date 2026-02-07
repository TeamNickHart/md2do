# CLI Reference

Complete command-line interface reference for md2do.

## Global Options

Available for all commands:

```bash
md2do [command] [options]
```

**Common Options:**

- `--help` - Show help for any command
- `--version` - Show md2do version
- `--path <dir>` - Root directory to scan (default: current directory)
- `--format <type>` - Output format: `pretty`, `table`, `json` (default: `pretty`)

## Core Commands

### `list`

List and filter tasks.

```bash
md2do list [options]
```

**Options:**

- `--assignee <name>` - Filter by assignee
- `--priority <level>` - Filter by priority (urgent, high, normal, low)
- `--tag <tag>` - Filter by tag
- `--project <name>` - Filter by project
- `--person <name>` - Filter by person (1-1s)
- `--completed` - Show completed tasks
- `--incomplete` - Show incomplete tasks (default)
- `--all` - Show all tasks
- `--overdue` - Show overdue tasks
- `--due-today` - Show tasks due today
- `--due-this-week` - Show tasks due this week
- `--due-before <date>` - Show tasks due before date
- `--due-after <date>` - Show tasks due after date
- `--sort <field>` - Sort by: due, priority, assignee, project, file
- `--limit <n>` - Limit results

**Examples:**

```bash
# All incomplete tasks
md2do list

# Urgent tasks for @alice
md2do list --assignee alice --priority urgent

# Overdue backend work
md2do list --tag backend --overdue

# Tasks due this week, sorted by priority
md2do list --due-this-week --sort priority
```

See [list command](/cli/list) for details.

### `stats`

Show aggregated statistics.

```bash
md2do stats [options]
```

**Options:**

- `--by <field>` - Group by: assignee, project, priority, tag
- `--completed` - Count only completed tasks
- `--incomplete` - Count only incomplete tasks
- All filter options from `list` command

**Examples:**

```bash
# Overall statistics
md2do stats

# Breakdown by assignee
md2do stats --by assignee

# Priority distribution for backend
md2do stats --tag backend --by priority
```

See [stats command](/cli/stats) for details.

### `config`

Manage md2do configuration.

```bash
md2do config <subcommand> [options]
```

**Subcommands:**

- `init` - Initialize configuration with interactive wizard
- `set <key> <value>` - Set a configuration value
- `get <key>` - Get a configuration value
- `list` - Show all configuration values
- `edit` - Open config file in editor
- `validate` - Validate configuration

**Examples:**

```bash
# Interactive setup
md2do config init

# Set specific value
md2do config set workday.startTime "09:00"

# View current config
md2do config list

# Edit in $EDITOR
md2do config edit
```

See [config command](/cli/config) for details.

## Todoist Commands

Sync with [Todoist](https://www.todoist.com). Requires API token configuration.

### `todoist list`

List tasks from Todoist.

```bash
md2do todoist list [options]
```

**Options:**

- `--project <name>` - Filter by Todoist project
- `--limit <n>` - Limit results
- `--format <type>` - Output format

**Example:**

```bash
md2do todoist list --project Work --limit 10
```

See [todoist list](/cli/todoist/list) for details.

### `todoist add`

Create a task in Todoist.

```bash
md2do todoist add <content> [options]
```

**Options:**

- `--priority <level>` - Task priority (urgent, high, normal, low)
- `--labels <tags>` - Comma-separated labels
- `--due <date>` - Due date (YYYY-MM-DD or "tomorrow", "next week")
- `--project <name>` - Todoist project name

**Example:**

```bash
md2do todoist add "Review pull request" --priority high --labels code-review,backend --due tomorrow
```

See [todoist add](/cli/todoist/add) for details.

### `todoist import`

Import a markdown task to Todoist.

```bash
md2do todoist import <file:line> [options]
```

**Options:**

- `--project <name>` - Target Todoist project

**Example:**

```bash
md2do todoist import tasks.md:15 --project Personal
```

See [todoist import](/cli/todoist/import) for details.

### `todoist sync`

Sync completion status from Todoist to markdown.

```bash
md2do todoist sync [options]
```

**Options:**

- `--dry-run` - Preview changes without applying
- `--direction <mode>` - Sync direction: pull (default)
- `--path <dir>` - Directory to sync

**Examples:**

```bash
# Dry run to see what would change
md2do todoist sync --dry-run

# Pull updates from Todoist
md2do todoist sync --direction pull

# Sync specific directory
md2do todoist sync --path ./work-notes
```

::: info Note
Currently supports one-way sync (Todoist → markdown). Bidirectional sync is planned for a future release.
:::

See [todoist sync](/cli/todoist/sync) for details.

## Configuration

md2do uses hierarchical configuration from multiple sources. Use the `config` command to manage settings interactively.

### Quick Setup

```bash
# Interactive wizard
md2do config init

# Set specific values
md2do config set workday.startTime "09:00"
md2do config set defaultAssignee "alice"

# View current config
md2do config list
```

### Config File Locations

- **Global:** `~/.md2do.json`
- **Project:** `./.md2do.json`
- **Environment:** `TODOIST_API_TOKEN`, `MD2DO_DEFAULT_ASSIGNEE`

### Basic Config

`.md2do.json`:

```json
{
  "defaultAssignee": "yourname",
  "workday": {
    "startTime": "09:00",
    "endTime": "18:00",
    "defaultDueTime": "end"
  },
  "todoist": {
    "apiToken": "your-api-token",
    "defaultProject": "Inbox"
  },
  "output": {
    "format": "pretty",
    "colors": true
  }
}
```

See [config command](/cli/config) and [Configuration Guide](/guide/configuration) for details.

## Exit Codes

md2do uses standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Configuration error (missing token, invalid config)
- `3` - Network error (Todoist API unreachable)

## Output Formats

### Pretty (default)

Human-readable format with colors and icons:

```bash
md2do list
```

```
📋 Tasks (5 found)

🔴 Fix memory leak in WebSocket
   @alice !!! #backend (due: 2026-01-19)
   bugs.md:12

🟡 Implement OAuth flow
   @alice !! #backend #auth (due: 2026-01-25)
   sprint-24.md:15
...
```

### Table

Compact table format:

```bash
md2do list --format table
```

```
╔═══════════════════════════╦══════════╦═════════╦═══════════╗
║ Task                      ║ Assignee ║ Priority║ Due       ║
╠═══════════════════════════╬══════════╬═════════╬═══════════╣
║ Fix memory leak          ║ alice    ║ urgent  ║ 2026-01-19║
║ Implement OAuth          ║ alice    ║ high    ║ 2026-01-25║
╚═══════════════════════════╩══════════╩═════════╩═══════════╝
```

### JSON

Machine-readable format for scripts:

```bash
md2do list --format json
```

```json
{
  "tasks": [
    {
      "id": "abc123",
      "text": "Fix memory leak in WebSocket",
      "assignee": "alice",
      "priority": "urgent",
      "tags": ["backend"],
      "dueDate": "2026-01-19",
      "completed": false,
      "file": "bugs.md",
      "line": 12
    }
  ],
  "metadata": {
    "total": 5,
    "completed": 0,
    "incomplete": 5
  }
}
```

## Environment Variables

Configure via environment:

```bash
# Todoist API token (most common)
export TODOIST_API_TOKEN="your-token"

# Default assignee
export MD2DO_DEFAULT_ASSIGNEE="yourname"

# Markdown root directory
export MD2DO_ROOT="/path/to/notes"

# Output format
export MD2DO_FORMAT="json"
```

## Piping and Composition

Combine with Unix tools:

```bash
# Count urgent tasks
md2do list --priority urgent | wc -l

# Get JSON and process with jq
md2do list --format json | jq '.tasks[] | select(.priority == "urgent")'

# Search task content
md2do list --format json | jq -r '.tasks[].text' | grep "API"

# Export to CSV
md2do list --format json | jq -r '.tasks[] | [.text, .assignee, .priority] | @csv'
```

## Tips & Tricks

### Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias mtd='md2do'
alias mtl='md2do list'
alias mts='md2do stats'
alias mtdo='md2do list --overdue'
alias mtdt='md2do list --due-today'

# My tasks
alias mywork='md2do list --assignee nick --incomplete'
```

### Scripts

Create custom workflows:

```bash
#!/bin/bash
# daily.sh - Morning routine

echo "📋 Good morning! Here's your day:"
echo ""
echo "🔴 URGENT:"
md2do list --assignee me --priority urgent --incomplete
echo ""
echo "📅 DUE TODAY:"
md2do list --assignee me --due-today
echo ""
echo "📊 OVERALL:"
md2do stats --assignee me
```

### Watch for Changes

Auto-refresh task list:

```bash
watch -n 60 md2do list --assignee me --incomplete
```

## Common Workflows

### Daily Review

```bash
# What's due today?
md2do list --due-today --sort priority

# What's overdue?
md2do list --overdue

# What did I finish yesterday?
md2do list --completed --assignee me
```

### Sprint Planning

```bash
# Overall sprint status
md2do stats --by assignee

# High priority work
md2do list --priority high,urgent --incomplete

# Overdue items
md2do list --overdue --sort priority
```

### Bug Triage

```bash
# Critical bugs
md2do list --tag bug --priority urgent

# All bugs by priority
md2do list --tag bug --sort priority

# Unassigned bugs
md2do list --tag bug --no-assignee
```

## Getting Help

```bash
# General help
md2do --help

# Command help
md2do list --help
md2do todoist --help
md2do todoist sync --help
```

## Next Steps

- [Task Format](/guide/task-format) - Learn task syntax
- [Filtering](/guide/filtering) - Advanced filtering
- [Configuration](/guide/configuration) - Set up config files
- [Todoist Integration](/integrations/todoist) - Sync with Todoist
- [Examples](/guide/examples) - Real-world usage
