# md2do

[![npm version](https://badge.fury.io/js/%40md2do%2Fcli.svg)](https://www.npmjs.com/package/@md2do/cli)
[![npm downloads](https://img.shields.io/npm/dm/@md2do/cli.svg)](https://www.npmjs.com/package/@md2do/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Turn your markdown files into a powerful task management system.**

md2do scans your markdown notes for TODO items and gives you a CLI to filter, sort, and sync them with [Todoist](https://www.todoist.com).
Perfect for developers who live in plain text but want the power of a real task manager.

## ⚡ Quick Start

```bash
# Try it instantly (no install required)
npx @md2do/cli list

# Or install globally
npm install -g @md2do/cli
md2do list
```

That's it! md2do will scan all `.md` files in your current directory and show you all your tasks.

## ✨ Features

- 📝 **Markdown-native** - Works with standard `- [ ]` task syntax
- 🔍 **Smart parsing** - Extracts assignees (@user), priorities (!!!), tags (#tag), due dates
- 🎯 **Powerful filtering** - Filter by any metadata, combine multiple filters
- 📊 **Rich statistics** - View task breakdowns by assignee, priority, project
- 🎨 **Beautiful output** - Color-coded, clickable file paths, multiple formats (pretty/table/JSON)
- 🔄 **Todoist sync** - Two-way sync foundation with Todoist API
- 🤖 **AI-powered** - MCP server for Claude Code integration
- ⚡ **Fast** - Built with TypeScript and fast-glob

## 📖 Task Format

md2do recognizes standard markdown tasks with optional metadata:

```markdown
- [ ] Implement user authentication @jane !!! #backend #auth #due/2026-01-20
- [x] Write documentation @nick !! #docs #due/2026-01-15
- [ ] Fix bug in parser @alex ! #bug #due/2026-01-18
```

**Metadata:**

- `@username` - Assignee
- `!!!` / `!!` / `!` - Priority (urgent/high/normal)
- `#tag` - Tags
- `#due/YYYY-MM-DD` - Due date
- `{todoist:ID}` - Todoist sync marker

## 🎯 Common Use Cases

### Add a task

```bash
# Basic task
md2do add "Buy milk" --file tasks.md

# With metadata
md2do add "Fix login bug" --file tasks.md --assignee nick --priority high --due tomorrow --tag backend

# Relative dates: today, tomorrow, monday-sunday, next week
md2do add "Weekly review" --file tasks.md --due "next week"

# Insert at a specific line
md2do add "Urgent fix" --file tasks.md --line 3 --priority urgent

# Omit --file to print to stdout (dry-run or piping)
md2do add "Task" --due tomorrow
md2do add "Task" --due tomorrow >> tasks.md
```

### Filter tasks by assignee

```bash
md2do list --assignee nick
```

### Show only urgent tasks

```bash
md2do list --priority urgent
```

### Find overdue tasks

```bash
md2do list --overdue
```

### Combine multiple filters

```bash
md2do list --assignee nick --priority urgent --tag backend
```

### View task statistics

```bash
# Overall stats
md2do stats

# Group by assignee
md2do stats --by assignee
```

### Different output formats

```bash
# Pretty format (default)
md2do list

# Table format
md2do list --format table

# JSON for scripting
md2do list --format json
```

## 📁 Context-Aware

md2do automatically extracts context from your folder structure:

```
projects/
  acme-app/              # Project: acme-app
    sprint-planning.md
    bugs.md
1-1s/
  nick.md                # Person: nick
  jane.md                # Person: jane
```

Then filter by context:

```bash
md2do list --project acme-app
md2do list --person jane
```

## ⚙️ Configuration

Set up md2do with an interactive wizard:

```bash
# Interactive setup
md2do config init

# Or configure specific values
md2do config set workday.startTime "09:00"
md2do config set defaultAssignee "alice"

# View current config
md2do config list
```

**Quick config for common settings:**

- Work hours (for time-based due dates)
- Default assignee (for filtering)
- Output preferences (format, colors)
- Warning levels (strict/recommended/off)

[Full configuration guide →](https://github.com/TeamNickHart/md2do/blob/main/docs/guide/configuration.md)

## 🔄 Todoist Integration

Sync your markdown tasks with Todoist:

```bash
# Import a specific task to Todoist
md2do todoist import tasks.md:15

# Sync completion status (dry run first)
md2do todoist sync --dry-run
md2do todoist sync
```

[Full Todoist setup guide →](https://github.com/TeamNickHart/md2do/blob/main/docs/integrations/todoist.md)

## 🤖 AI Integration (MCP)

Use Claude Code or other AI assistants to query your tasks through the Model Context Protocol:

```bash
# Build and configure the MCP server
npm install -g @md2do/mcp
```

Then ask Claude:

- "What urgent tasks does @nick have?"
- "Generate my daily standup report"
- "Show me task breakdown by project"

[Full MCP setup guide →](https://github.com/TeamNickHart/md2do/blob/main/packages/mcp/README.md)

## 📚 Full Documentation

This README covers the basics. For complete documentation:

- **[Full Documentation](https://md2do.com)** - Complete guide, examples, and tutorials
- **[GitHub Repository](https://github.com/TeamNickHart/md2do)** - Source code, issues, contributions
- **[CLI Reference](https://github.com/TeamNickHart/md2do/blob/main/docs/cli/overview.md)** - All commands and options
- **[Configuration Guide](https://github.com/TeamNickHart/md2do/blob/main/docs/guide/configuration.md)** - Config file setup

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/TeamNickHart/md2do/blob/main/docs/development/contributing.md).

## 📄 License

MIT © [Nick Hart](https://github.com/TeamNickHart)

---

**Made with ❤️ for developers who love markdown**

[Report Bug](https://github.com/TeamNickHart/md2do/issues) • [Request Feature](https://github.com/TeamNickHart/md2do/issues) • [Documentation](https://md2do.com)
