# Roadmap

See the complete roadmap at [ROADMAP.md](https://github.com/TeamNickHart/md2do/blob/main/ROADMAP.md) in the repository.

This page highlights the major upcoming features and their current status.

## Current Version: v0.7.x

### Completed

- Core task parsing and filtering
- CLI commands (list, stats, config, migrate)
- **Todoist integration** (native — import, sync, list, add with full two-way sync)
- MCP server for AI assistants
- Hierarchical configuration
- VitePress docs site at [md2do.com](https://md2do.com)
- **Syntax migration** — New `#due/YYYY-MM-DD`, `{completed:YYYY-MM-DD}`, `{slug:NNN}` format with backward-compatible legacy parsing
- **`md2do migrate` command** — Automated migration from legacy bracket syntax
- **VS Code extension** — Task Explorer, CodeLens, diagnostics, dashboard, smart `#due/` autocomplete
- **Obsidian plugin** — Task list view, grouping, sorting, commands, autocomplete
- **Pluggable multi-source ingestion** — Open `{slug:ID}` source link pattern; `md2do ingest` command for JSONL-based import from any source (Teams, Outlook, Slack, etc.)
- **`SourceProvider` interface** — Typed contract for native integrations (Todoist implements this today)

## In Progress

### Obsidian Plugin Polish

- [ ] Community plugin submission
- [ ] Auto-completion for `#due/`, `@`, `#`

### Advanced Todoist Sync

- [x] Basic bidirectional sync
- [ ] Advanced conflict detection
- [ ] Interactive conflict resolution
- [ ] Bulk sync with progress

### Enhanced UX

- [x] Comprehensive documentation
- [ ] Interactive token setup wizard
- [ ] Better error messages
- [ ] First-run experience

## Near-Term

### MCP Agent Workflows

AI-powered task ingestion from M365 and more

- Claude + M365 MCP tools → JSONL → `md2do ingest`
- Prompt templates for Teams, Outlook, calendar
- Scheduled agent runs (cron + MCP)

### Watch Mode

Real-time monitoring and auto-sync

- File system watcher
- Auto-sync on save
- Desktop notifications

### Repository Polish

- [ ] Issue/PR templates
- [ ] GitHub Actions CI/CD
- [ ] Automated releases

## Mid-Term

### Native Integrations (via `SourceProvider`)

Additional first-class integrations built on the same interface as Todoist:

- **GitHub Issues** — bidirectional sync, issue linking
- **Linear** — issue sync with priority and cycle mapping
- **Jira** — ticket sync

### Multi-Source Unified View

- Filter tasks by source (`--source teams`, `--source todoist`)
- Cross-source stats (`md2do stats --by source`)
- Conflict detection across sources (same task imported twice)

## Long-Term

### Web Dashboard

Browser-based task management

- Kanban board
- Calendar view
- Real-time collaboration

### Advanced Features

- Task dependencies
- Recurring tasks
- Time tracking
- Custom fields

## Contributing

Want to help? Check [GitHub Issues](https://github.com/TeamNickHart/md2do/issues) or propose new features!
