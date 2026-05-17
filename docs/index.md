---
layout: home

hero:
  name: md2do
  text: Markdown Task Management
  tagline: A powerful CLI tool for scanning, filtering, and managing TODO tasks in markdown files. Built with TypeScript, designed for developers who love markdown.
  image:
    light: /logo-light.svg
    dark: /logo-dark.svg
    alt: md2do logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/TeamNickHart/md2do

features:
  - icon: 📝
    title: Markdown-Native
    details: Works directly with your existing markdown files. No database, no lock-in.
  - icon: 🔍
    title: Smart Parsing
    details: Extracts TODOs with rich metadata - assignees, priorities, due dates, and tags.
  - icon: 💻
    title: VSCode Extension
    details: Task explorer with grouping/filtering/sorting, CodeLens inline actions, interactive dashboard, smart diagnostics, and auto-completion. Available on the VSCode Marketplace.
  - icon: 🟣
    title: Obsidian Plugin
    details: Native task list view, autocomplete, and completion tracking directly in Obsidian. Works on desktop and iPad.
  - icon: 🎯
    title: Powerful Filtering
    details: Filter by assignee, priority, project, tags, due dates, and more.
  - icon: 📊
    title: Rich Statistics
    details: View task breakdowns by priority, assignee, project, or any metadata.
  - icon: 🎨
    title: Beautiful Output
    details: Color-coded priorities, clickable file paths with VS Code integration.
  - icon: ⚡
    title: Fast
    details: Built with performance in mind using fast-glob and TypeScript.
  - icon: 🔄
    title: Todoist Integration
    details: Import tasks to Todoist and sync completion status. Official Todoist API integration.
  - icon: 🤖
    title: AI-Powered
    details: MCP server integration for Claude and other AI assistants.
---

## Quick Example

```bash
# Install globally
npm install -g @md2do/cli

# Add a task
md2do add "Fix login bug" --file tasks.md --assignee nick --priority high --due tomorrow

# Or print to stdout for previewing / piping
md2do add "Deploy hotfix" --due today --priority urgent

# List all tasks
md2do list

# Filter by assignee and priority
md2do list --assignee nick --priority urgent

# View statistics
md2do stats --by assignee
```

## Task Format

md2do recognizes standard markdown task syntax with rich metadata:

```markdown
- [ ] Implement user authentication @jane !!! #backend #auth #due/2026-01-20
- [x] Write documentation @nick !! #docs {completed:2026-01-15}
- [ ] Fix bug in parser @alex ! #bug #due/2026-01-18
```

**Supported metadata:**

- `@username` - Task assignee
- `!!!` / `!!` / `!` - Priority (urgent/high/normal)
- `#tag` - Tags
- `#due/YYYY-MM-DD` - Due date
- `{completed:YYYY-MM-DD}` - Completion date
- `{todoist:ID}` - Todoist sync ID

> Legacy bracket syntax (`[due: ...]`, `[completed: ...]`, `[todoist: ...]`) is still parsed for backward compatibility.

## What Makes md2do Special?

### 🎯 Context-Aware

md2do automatically extracts context from your file structure when run from the repository root:

```
# Run from repository root to extract context
md2do list

# File structure:
projects/
  acme-app/              # Project: acme-app
    sprint-planning.md
  widget-co/             # Project: widget-co
    roadmap.md
1-1s/
  nick.md                # Person: nick
  jane.md                # Person: jane
```

::: tip Context Extraction
Context extraction works when running `md2do list` from the repository root directory. The `--path` option currently doesn't preserve project/person context.
:::

### 🔄 Todoist Integration

Import tasks to [Todoist](https://www.todoist.com) and sync completion status:

```bash
# Import markdown task to Todoist
md2do todoist import tasks.md:15

# Sync completion status from Todoist
md2do todoist sync --dry-run
md2do todoist sync --direction pull
```

### 🤖 AI Integration

Use Claude Code or other AI assistants to query your tasks:

> "What urgent tasks does @nick have?"

> "Show me task breakdown by project"

> "Generate my daily standup report"

## Next Steps

<div class="vp-doc" style="margin-top: 2rem;">

**📚 [Get Started](/guide/getting-started)** - Install and configure md2do

**📖 [Read the Guide](/guide/task-format)** - Learn about task format and features

**💻 [VSCode Extension](/integrations/vscode)** - Install the VSCode extension

**🟣 [Obsidian Plugin](/integrations/obsidian)** - Install the Obsidian plugin

**🔌 [Todoist Setup](/integrations/todoist)** - Set up [Todoist](https://www.todoist.com) integration

**🤖 [MCP Integration](/integrations/mcp)** - Connect with Claude Code

**📋 [CLI Reference](/cli/overview)** - Complete command documentation

</div>

---

<div class="vp-doc" style="text-align: center; margin-top: 3rem; opacity: 0.7;">

Made with ❤️ by [Nick Hart](https://github.com/TeamNickHart)

[MIT License](https://github.com/TeamNickHart/md2do/blob/main/LICENSE) • [Report Bug](https://github.com/TeamNickHart/md2do/issues) • [Request Feature](https://github.com/TeamNickHart/md2do/issues)

</div>
