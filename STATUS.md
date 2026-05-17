# md2do Status

**Current Version:** 0.5.1
**Last Updated:** 2026-02-06

This document provides a quick overview of md2do's current implementation status. For detailed plans and roadmap, see [ROADMAP.md](./ROADMAP.md).

## ✅ Implemented Features

### Core Functionality

- [x] Markdown task parsing with rich metadata extraction
- [x] Filtering by assignee, priority, tags, due dates, project, person
- [x] Sorting by priority, due date, file, assignee, project
- [x] Statistics and aggregation with grouping
- [x] Multiple output formats (pretty, table, JSON)
- [x] Context extraction from file structure (projects, 1-1s)
- [x] Heading-based context (dates, organization)

### Configuration System

- [x] Hierarchical configuration (`.md2do.json`/`.yaml`)
- [x] Environment variable support
- [x] Config presets (project, global, env)
- [x] Schema validation with Zod
- [x] CLI commands: `init`, `set`, `get`, `list`, `edit`, `validate`

### Todoist Integration

- [x] Official Todoist API client wrapper
- [x] Task format mapping (md2do ↔ Todoist)
- [x] Priority conversion (md2do ↔ Todoist)
- [x] Label management with auto-creation
- [x] CLI commands:
  - [x] `todoist list` - List Todoist tasks
  - [x] `todoist add` - Create tasks in Todoist
  - [x] `todoist import` - Import markdown task to Todoist
  - [x] `todoist sync` - Bidirectional sync (completion status)

### AI Integration (MCP)

- [x] Model Context Protocol server
- [x] Tools: `list_tasks`, `get_task_stats`, `search_tasks`, `get_task_by_id`
- [x] Resources: `task://all`, `task://project/{name}`, `task://person/{name}`, `task://file/{path}`
- [x] Prompts: `daily_standup`, `sprint_summary`, `overdue_review`
- [x] Claude Code integration guide

### VSCode Extension

- [x] Task explorer sidebar with grouping modes (file, assignee, due date, priority, tag, flat)
- [x] Filtering: incomplete only, overdue only, assigned only
- [x] Sorting options (due date, priority, alphabetically, line number)
- [x] CodeLens inline actions
- [x] Interactive dashboard with drill-down
- [x] Smart diagnostics in Problems panel
- [x] Quick task actions (toggle completion with Cmd+K Enter)
- [x] Status bar integration
- [x] Published to VSCode Marketplace (v0.2.2)

### Metadata Syntax

- [x] Due dates: `#due/2026-01-25` (tag-style)
- [x] Completion dates: `{completed:2026-01-25}` (brace-style)
- [x] Todoist IDs: `{todoist:123456}` (brace-style)
- [x] Legacy bracket syntax still parsed for backward compatibility (`[due: ...]`, `[completed: ...]`, `[todoist: ...]`)
- [x] CLI migration command: `md2do migrate --dry-run --path <dir>`
- [x] Heading date extraction (ISO, slash, natural formats)

### Publishing & CI/CD

- [x] Automated npm publishing with OIDC trusted publishing
- [x] Automated VSCode Marketplace publishing
- [x] Smart CI with conditional job execution (3x faster for docs-only changes)
- [x] GitHub Actions workflows for quality gates
- [x] Changesets for version management
- [x] Automated GitHub Releases

## 🚧 In Progress

- [ ] Advanced Todoist conflict detection (modification timestamps, content changes)
- [ ] Interactive token setup wizard (`md2do todoist setup`)
- [ ] Conflict resolution strategies

## 📋 Planned Features

See [ROADMAP.md](./ROADMAP.md) for details on upcoming features:

### Near-Term

- [ ] Watch mode for real-time monitoring
- [ ] Custom output templates (Handlebars)
- [ ] Open VSX Registry publishing (optional)

### Mid-Term

- [ ] GitHub Issues integration
- [ ] Enhanced MCP + Todoist integration
- [ ] Multiple assignees support
- [ ] Enhanced date format support (natural language, times)

### Long-Term

- [ ] Web dashboard
- [ ] Linear/Jira integrations
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Time tracking

## 📖 Documentation Status

- [x] Public website (https://md2do.com) - VitePress
- [x] Getting started guide
- [x] Complete task format reference (all date formats documented)
- [x] CLI reference (`--help` commands)
- [x] Integration guides (Todoist, MCP, VSCode)
- [x] Examples and use cases
- [x] API reference for `@md2do/core`
- [ ] Video tutorials (planned)
- [ ] Blog for announcements (planned)

## 🐛 Known Issues

- **VSCode extension accidentally published to npm** - Fixed in this commit by adding `"private": true`
- See [GitHub Issues](https://github.com/TeamNickHart/md2do/issues) for active bugs and feature requests

## 📦 Published Packages

### npm (Published with OIDC Trusted Publishing)

- `@md2do/cli` - v0.5.1 [![npm](https://img.shields.io/npm/v/@md2do/cli)](https://www.npmjs.com/package/@md2do/cli)
- `@md2do/core` - v0.5.0 [![npm](https://img.shields.io/npm/v/@md2do/core)](https://www.npmjs.com/package/@md2do/core)
- `@md2do/config` - v0.5.0 [![npm](https://img.shields.io/npm/v/@md2do/config)](https://www.npmjs.com/package/@md2do/config)
- `@md2do/todoist` - v0.5.0 [![npm](https://img.shields.io/npm/v/@md2do/todoist)](https://www.npmjs.com/package/@md2do/todoist)
- `@md2do/mcp` - v0.5.0 [![npm](https://img.shields.io/npm/v/@md2do/mcp)](https://www.npmjs.com/package/@md2do/mcp)

### VSCode Extension (Published Automatically)

- `md2do-vscode` - v0.2.2 ([VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=md2do.md2do-vscode))
- Also available via .vsix from GitHub Releases

## 🎯 Current Focus

**🎉 LIVE AND PUBLISHED!** - All packages and extensions are now published and available to the public.

1. ✅ **Documentation fixes** - Correcting date syntax examples across all docs
2. ✅ **VSCode Marketplace** - Extension published and available
3. ✅ **Automated publishing** - GitHub Actions workflows with OIDC trusted publishing
4. ✅ **Smart CI optimization** - Conditional checks for faster docs-only PRs

**Next priorities:**

- Community engagement and user feedback
- Bug fixes and stability improvements
- Feature development based on user requests

## 🤝 Contributing

Contributions are welcome! See [docs/development/contributing.md](./docs/development/contributing.md) for guidelines.

## 📝 Version History

- **0.5.1** (2026-02-06) - Published to npm and VSCode Marketplace with automated workflows
- **0.5.0** (2026-02-06) - Interactive config command, documentation improvements, smart CI
- **0.4.0** (2026-01-28) - Todoist integration complete
- **0.3.0** (2026-01-25) - MCP server for AI integration
- **0.2.0** (2026-01-20) - VSCode extension
- **0.1.0** (2026-01-15) - Initial release

---

For detailed implementation plans and feature roadmap, see [ROADMAP.md](./ROADMAP.md).
