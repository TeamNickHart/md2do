---
layout: home

hero:
  name: md2do
  text: Markdown Task Management
  tagline: A powerful CLI tool for scanning, filtering, and managing TODO tasks in markdown files. Built with TypeScript, designed for developers who love markdown.
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
    details: Task explorer, smart diagnostics, hover tooltips, and auto-completion in VSCode.
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
    details: Bidirectional sync foundation with official Todoist API.
  - icon: 🤖
    title: AI-Powered
    details: MCP server integration for Claude and other AI assistants.
---

## Quick Example

```bash
# Install globally
npm install -g @md2do/cli

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
- [ ] Implement user authentication @nick !!! #backend #auth (2026-01-20)
- [x] Write documentation @jane !! #docs (2026-01-15)
- [ ] Fix bug in parser @alex ! #bug (2026-01-18)
```

**Supported metadata:**

- `@username` - Task assignee
- `!!!` / `!!` / `!` - Priority (urgent/high/normal)
- `#tag` - Tags
- `(YYYY-MM-DD)` - Due date
- `[todoist:ID]` - Todoist sync ID

## What Makes md2do Special?

### 🎯 Context-Aware

md2do automatically extracts context from your file structure:

```
projects/
  acme-app/              # Project: acme-app
    sprint-planning.md
  widget-co/             # Project: widget-co
    roadmap.md
1-1s/
  nick.md                # Person: nick
  jane.md                # Person: jane
```

### 🔄 Todoist Sync

Keep your markdown in sync with Todoist:

```bash
# Import markdown task to Todoist
md2do todoist import tasks.md:15

# Sync completion status bidirectionally
md2do todoist sync --dry-run
md2do todoist sync
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

**🔌 [Todoist Setup](/integrations/todoist)** - Set up Todoist integration

**🤖 [MCP Integration](/integrations/mcp)** - Connect with Claude Code

**📋 [CLI Reference](/cli/overview)** - Complete command documentation

</div>

---

<div class="vp-doc" style="text-align: center; margin-top: 3rem; opacity: 0.7;">

Made with ❤️ by [Nick Hart](https://github.com/TeamNickHart)

[MIT License](https://github.com/TeamNickHart/md2do/blob/main/LICENSE) • [Report Bug](https://github.com/TeamNickHart/md2do/issues) • [Request Feature](https://github.com/TeamNickHart/md2do/issues)

</div>
