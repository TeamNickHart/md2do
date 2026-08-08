# What is md2do?

md2do is a powerful CLI tool for managing TODO tasks in markdown files. It helps you organize, filter, and track tasks using the markdown format you already love.

## Why md2do?

### Markdown-First Philosophy

Your tasks live in markdown files - no proprietary formats, no databases, no lock-in. Just plain text files you can:

- Edit in any text editor
- Version control with git
- Share with your team
- Backup easily
- Read 10 years from now

### Rich Metadata Support

md2do understands markdown task syntax and extends it with rich metadata:

```markdown
- [ ] Task description @assignee !!! #tag #due/2026-01-20
```

Extract:

- **Assignees** - `@username`
- **Priorities** - `!!!` (urgent), `!!` (high), `!` (normal)
- **Tags** - `#tag`
- **Due dates** - `#due/YYYY-MM-DD`
- **Completion dates** - `{completed:YYYY-MM-DD}`
- **Completion status** - `[x]` vs `[ ]`

::: tip Legacy Syntax
The older bracket syntax (`[due: YYYY-MM-DD]`, `[completed: YYYY-MM-DD]`, `[todoist: NNN]`) is still parsed for backward compatibility.
:::

### Context-Aware

md2do automatically extracts context from your file structure:

```
projects/
  acme-corp/          # Project: acme-corp
    roadmap.md
    bugs.md
1-1s/
  alice.md            # Person: alice
  bob.md              # Person: bob
```

::: tip Context Extraction
Run `md2do list` from your repository root directory for context extraction to work. The `--path` option currently doesn't preserve project/person context.
:::

### Powerful Filtering

Find exactly what you need:

```bash
# Urgent tasks for @nick
md2do list --assignee nick --priority urgent

# Overdue tasks
md2do list --overdue

# Tasks due this week in the backend project
md2do list --due-this-week --project backend
```

## Key Features

### 📝 Native Markdown Support

- Works with existing markdown files
- No special format required
- Standard task syntax: `- [ ]` and `- [x]`
- VS Code integration via file:// URLs

### 🔍 Smart Parsing

- Extracts assignees, priorities, tags, dates
- Preserves markdown formatting
- Context from file structure (projects, 1-1s)
- Heading-based organization

### 🎯 Advanced Filtering

- Filter by any metadata field
- Combine multiple filters
- Date-based filtering (overdue, due today, this week)
- Sort by priority, due date, project, assignee

### 📊 Statistics & Reporting

- Aggregated statistics
- Group by assignee, priority, project, tag
- Completion rates
- Custom breakdowns

### 🔌 Multi-Source Ingestion

Bring tasks from any external system into your vault via a simple JSONL pipeline — no hardcoded integrations required:

- **Any source** — Teams, Outlook, Slack, Google Calendar, or anything that can emit JSON
- **Open format** — one JSON record per line, four required fields
- **Source links** — `{slug:ID}` tokens link vault tasks back to their origin
- **Unified view** — all sources queryable with the same `md2do list` filters

```bash
md2do ingest /tmp/teams-mentions.jsonl --vault ~/notes
# Creates: ~/notes/teams/teams-mentions.md
```

### 🔄 Todoist Integration

- Import markdown tasks to [Todoist](https://www.todoist.com)
- Sync completion status from Todoist to markdown
- Preserve all metadata
- Official Todoist API integration — full two-way sync

### 🤖 AI-Powered (MCP)

- Claude Code integration via MCP server
- Natural language queries across all your tasks
- AI-generated reports (standup, sprint summary, overdue review)
- **`build_integration` prompt** — ask Claude to fetch tasks from any source and write ingest files automatically

### ⚡ Performance

- Fast glob-based file scanning
- Efficient filtering algorithms
- Handles thousands of tasks
- Instant results

## Use Cases

### Personal Task Management

Manage your personal TODOs in markdown notes:

```bash
# Quick daily review
md2do list --incomplete --sort due

# See what's overdue
md2do list --overdue
```

### Team Project Management

Track team tasks in a shared repository:

```markdown
## Sprint 23

- [ ] API endpoints @alice !! #backend #due/2026-01-25
- [ ] UI mockups @bob ! #design #due/2026-01-22
- [ ] Database migration @charlie !!! #backend #due/2026-01-20
```

```bash
# Team standup report
md2do stats --by assignee

# Sprint progress
md2do list --project sprint-23
```

### 1-on-1 Meeting Notes

Keep action items in 1-1 notes:

```markdown
# 1-1 with Alice - 2026-01-15

## Action Items

- [ ] Review performance doc @alice ! #due/2026-01-20
- [ ] Schedule team offsite @nick !! #due/2026-01-18
```

```bash
# Before next meeting
md2do list --person alice
```

### Engineering Documentation

Track TODOs in technical docs:

```markdown
## API Documentation

- [ ] Document authentication @backend !!! #docs #due/2026-01-25
- [ ] Add code examples @docs-team ! #examples
- [x] API reference @alice !! #api-docs
```

### Hybrid Workflows

Use markdown as source of truth, sync with Todoist for mobile access, and pull in tasks from other tools:

```bash
# Import important tasks to Todoist
md2do todoist import roadmap.md:15

# Sync completion status
md2do todoist sync

# Ingest from Teams mentions or Outlook flags
md2do ingest /tmp/teams.jsonl --vault ~/notes
```

## How It Works

1. **Scan** - md2do finds all `.md` files in your directory
2. **Parse** - Extracts tasks with metadata
3. **Filter** - Applies your filters and sorting
4. **Display** - Shows results in beautiful format

```bash
md2do list --assignee nick --priority urgent --sort due
```

Under the hood:

- Uses [fast-glob](https://github.com/mrmlnc/fast-glob) for file scanning
- Regex-based parsing for metadata extraction
- Functional filtering pipeline
- VS Code-compatible file:// URLs

## Philosophy

md2do is built on these principles:

**📝 Markdown First** - Your tasks should be readable without md2do

**🔓 No Lock-In** - Plain text files you own forever

**⚡ Fast & Lightweight** - No database, no server, just a CLI

**🎯 Developer-Friendly** - TypeScript, well-tested, extensible

**🤝 Open Source** - MIT licensed, community-driven

## Next Steps

Ready to get started?

- **[Install md2do](/guide/getting-started)** - Get up and running in minutes
- **[Task Format Guide](/guide/task-format)** - Learn the syntax
- **[CLI Reference](/cli/overview)** - Explore all commands
- **[Multi-Source Ingestion](/integrations/ingest)** - Bring in tasks from any source
- **[Examples](/guide/examples)** - See real-world usage
