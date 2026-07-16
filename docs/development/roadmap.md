# Roadmap

See the complete roadmap at [ROADMAP.md](https://github.com/TeamNickHart/md2do/blob/main/ROADMAP.md) in the repository.

This page highlights the major upcoming features and their current status.

## Current Version: v0.8.x

### Completed

- Core task parsing and filtering
- CLI commands (list, stats, config, migrate, add, ingest)
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
- **`build_integration` MCP prompt** — Ask Claude to fetch tasks from any external source and write valid ingest files; `mode=provider` appends a TypeScript `SourceProvider` skeleton
- **`sources` in MCP output** — `list_tasks` includes source IDs so Claude can correlate tasks with external systems
- **CI/CD** — GitHub Actions with coverage, type check, lint; npm Trusted Publishing via OIDC (no token)
- **`todoist push`** — One-way push of a markdown file to Todoist as a project with sections and tasks; writes `{todoist:ID}` back to headings

## In Progress

### Obsidian Plugin Polish

- [ ] Community plugin submission
- [x] Auto-completion for `#due/`, `@`, `#`

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

- [x] `build_integration` prompt for any source
- [ ] Scheduled agent runs (cron + MCP)
- [ ] Merge strategy for re-ingested vault files (preserve hand-edits)

### Watch Mode

Real-time monitoring and auto-sync

- File system watcher
- Auto-sync on save
- Desktop notifications

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
