# Filtering & Sorting

md2do provides powerful filtering and sorting to find exactly what you need.

## Basic Filtering

### By Completion Status

```bash
# Only incomplete tasks (default)
md2do list --incomplete

# Only completed tasks
md2do list --completed

# All tasks (complete and incomplete)
md2do list --all
```

### By Assignee

```bash
# Tasks assigned to alice
md2do list --assignee alice

# Multiple assignees ⚠️ Coming soon
md2do list --assignee alice,bob

# Unassigned tasks ⚠️ Coming soon
md2do list --no-assignee
```

### By Priority

```bash
# Urgent tasks only
md2do list --priority urgent

# High or urgent ⚠️ Coming soon
md2do list --priority high,urgent

# Everything except low ⚠️ Coming soon
md2do list --priority normal,high,urgent
```

**Priority values:** `urgent`, `high`, `normal`, `low`

### By Tags

```bash
# Tasks tagged #backend
md2do list --tag backend

# Multiple tags (OR - tasks with any tag) ⚠️ Coming soon
md2do list --tag backend,frontend

# Tasks with specific tag combinations
md2do list --tag bug --tag urgent
```

### By Project

```bash
# Tasks in acme-corp project
md2do list --project acme-corp

# Multiple projects ⚠️ Coming soon
md2do list --project acme-corp,internal
```

Projects are extracted from directory structure.

### By Person (1-1s)

```bash
# Tasks in alice's 1-1 file
md2do list --person alice
```

## Date Filtering

### Due Date Filters

```bash
# Overdue tasks
md2do list --overdue

# Due today
md2do list --due-today

# Due this week
md2do list --due-this-week

# Due before specific date ⚠️ Coming soon
md2do list --due-before 2026-02-01

# Due after specific date ⚠️ Coming soon
md2do list --due-after 2026-01-20
```

### Date Range

⚠️ **Coming soon**

```bash
# Tasks due between two dates
md2do list --due-after 2026-01-20 --due-before 2026-02-01
```

## Combining Filters

All filters can be combined - they act as AND conditions:

```bash
# Urgent backend tasks assigned to alice
md2do list --assignee alice --priority urgent --tag backend

# Overdue high-priority tasks ⚠️ Coming soon (comma-separated values)
md2do list --overdue --priority high,urgent

# Incomplete tasks for bob in acme-corp project
md2do list --incomplete --assignee bob --project acme-corp

# Frontend bugs due this week ⚠️ Coming soon (comma-separated values)
md2do list --tag frontend,bug --due-this-week
```

## Sorting

Control the output order with `--sort`:

```bash
# Sort by due date (earliest first)
md2do list --sort due

# Sort by priority (highest first)
md2do list --sort priority

# Sort by assignee (alphabetical)
md2do list --sort assignee

# Sort by project
md2do list --sort project

# Sort by file path
md2do list --sort file
```

**Available sort fields:**

- `due` - Due date (ascending)
- `priority` - Priority (urgent → low)
- `assignee` - Assignee name (A-Z)
- `project` - Project name (A-Z)
- `file` - File path (A-Z)

### Multiple Sort Keys

Sort by multiple fields (not yet implemented):

```bash
# Coming soon: sort by priority, then due date
md2do list --sort priority,due
```

## Output Formatting

### Limit Results

⚠️ **Coming soon**

```bash
# Show only first 10 tasks
md2do list --limit 10

# Top 5 urgent tasks
md2do list --priority urgent --sort due --limit 5
```

### Output Formats

```bash
# Human-readable format (default)
md2do list

# Table format
md2do list --format table

# JSON format (pretty-printed by default)
md2do list --format json
```

## Common Workflows

### Daily Standup

What's on my plate today?

```bash
md2do list --assignee nick --incomplete --sort priority
```

### Overdue Review

What needs attention?

```bash
md2do list --overdue --sort due
```

### Sprint Planning

What's coming up this week?

```bash
md2do list --due-this-week --incomplete --sort priority
```

### Project Status

How's the acme-corp project doing?

```bash
md2do list --project acme-corp --incomplete --sort assignee
```

### Bug Triage

Critical bugs to fix:

```bash
# ⚠️ Coming soon (comma-separated priorities)
md2do list --tag bug --priority urgent,high --incomplete --sort due

# Working alternative - use multiple tag filters:
md2do list --tag bug --tag urgent --incomplete --sort due
```

### Team Overview

Who's working on what?

```bash
md2do stats --by assignee --incomplete
```

## Filtering in MCP (AI)

When using md2do with Claude Code via MCP, you can query naturally:

```
"Show me all urgent backend tasks assigned to alice"
"What bugs are overdue?"
"List tasks due this week sorted by priority"
```

The AI translates your request to md2do filters automatically.

See [MCP Integration](/integrations/mcp) for details.

## Advanced Examples

### Focus Mode

Today's critical work:

```bash
# ⚠️ Coming soon (comma-separated values and --limit)
md2do list \
  --assignee nick \
  --priority urgent,high \
  --due-today \
  --sort priority \
  --limit 5

# Working alternative:
md2do list \
  --assignee nick \
  --priority urgent \
  --due-today \
  --sort priority
```

### Team Burndown

Track team progress:

```bash
# Total tasks by assignee
md2do stats --by assignee

# Completion rate
md2do stats --by assignee --completed
md2do stats --by assignee --incomplete
```

### Release Checklist

Tasks for upcoming release:

```bash
md2do list \
  --tag release \
  --tag v2.0 \
  --incomplete \
  --sort priority
```

### Context Switching

Quick project context:

```bash
# ⚠️ Coming soon (--limit not yet implemented)
# What's happening in frontend?
md2do list --tag frontend --incomplete --limit 10

# Switch to backend
md2do list --tag backend --incomplete --limit 10

# Working alternative (no limit):
md2do list --tag frontend --incomplete
md2do list --tag backend --incomplete
```

## Filter Negation (Future)

Coming soon - exclude with `--not-*`:

```bash
# Everything except low priority
md2do list --not-priority low

# Tasks without specific tags
md2do list --not-tag archived,wontfix
```

## Search (Future)

Coming soon - text search:

```bash
# Search in task content
md2do list --search "authentication"

# Case-insensitive regex
md2do list --search "api.*endpoint" --regex
```

## Next Steps

- [Task Format](/guide/task-format) - Learn the task syntax
- [Configuration](/guide/configuration) - Set default filters
- [CLI Reference](/cli/overview) - Full command documentation
- [Examples](/guide/examples) - More real-world patterns
