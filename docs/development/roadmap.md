# Roadmap

See the complete roadmap at [ROADMAP.md](https://github.com/TeamNickHart/md2do/blob/main/ROADMAP.md) in the repository.

This page highlights the major upcoming features and their current status.

## Current Version: v0.2.x

### Completed

- Core task parsing and filtering
- CLI commands (list, stats, config, migrate)
- Todoist integration (import, sync, list, add)
- MCP server for AI
- Hierarchical configuration
- VitePress docs site at [md2do.com](https://md2do.com)
- **Syntax migration** - New `#due/YYYY-MM-DD`, `{completed:YYYY-MM-DD}`, `{todoist:NNN}` format with backward-compatible legacy parsing
- **`md2do migrate` command** - Automated migration from legacy bracket syntax
- **VS Code extension** (v0.2.1) - Task Explorer, CodeLens, diagnostics, dashboard, smart `#due/` autocomplete
- **Obsidian plugin** (beta) - Task list view, grouping, sorting, commands

## In Progress

### Obsidian Plugin Polish

- [ ] Syntax migration updates (suggest provider, task writer)
- [ ] Community plugin submission
- [ ] Auto-completion for `#due/`, `@`, `#`

### Advanced Sync Logic

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

### MCP + Todoist

AI-powered hybrid workflows

- Todoist operations via MCP
- Unified queries
- Smart sync suggestions

### GitHub Issues

Sync with GitHub Issues

- Bidirectional sync
- Issue linking

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
