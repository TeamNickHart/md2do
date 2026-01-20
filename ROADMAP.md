# md2do Roadmap

This document outlines planned features and enhancements for md2do.

## Current Status (v0.1.0)

✅ **Core Features**

- Markdown task parsing with rich metadata
- Powerful filtering and sorting
- Statistics and aggregation
- MCP server for AI integration
- Todoist integration (API client, task mapping, CLI commands)
- Hierarchical configuration system
- Atomic file writing for safe markdown updates

## In Progress

### Phase 5: Advanced Sync Logic

**Status**: Basic sync implemented, advanced features pending

- [x] Basic bidirectional sync (completion status)
- [ ] Advanced conflict detection
  - [ ] Compare modification timestamps (file mtime vs Todoist updated)
  - [ ] Detect task content changes
  - [ ] Detect due date conflicts
- [ ] Conflict resolution strategies
  - [ ] Interactive conflict resolution (prompt user)
  - [ ] Configurable auto-resolution rules
  - [ ] Merge strategies for different field types
- [ ] Optimistic locking / version tracking
- [ ] Bulk sync operations with progress indicators

### Phase 6: Enhanced User Experience

**Status**: Documentation complete, interactive features pending

- [x] Comprehensive documentation
- [x] Setup guides for Todoist and MCP
- [ ] Interactive token setup wizard
  - [ ] `md2do todoist setup` command
  - [ ] Open browser to Todoist settings
  - [ ] Guide user through token generation
  - [ ] Validate token and save to config
- [ ] First-run experience improvements
- [ ] Better error messages with actionable suggestions

## Near-Term (Next 3-6 Months)

### Watch Mode

**Priority**: High

Real-time monitoring and auto-sync:

- [ ] `md2do watch` command
- [ ] File system watcher for markdown changes
- [ ] Auto-sync on file save (if configured)
- [ ] Desktop notifications for sync events
- [ ] Configurable watch patterns and debouncing

### Custom Output Templates

**Priority**: Medium

User-defined output formatting:

- [ ] Template syntax (Handlebars or similar)
- [ ] Built-in templates (kanban, timeline, calendar)
- [ ] Save custom templates to config
- [ ] Template variables for all task fields
- [ ] Export templates (HTML, PDF, CSV)

### Website & Documentation

**Priority**: High

Public-facing website at md2do.com:

- [ ] VitePress documentation site
- [ ] Getting started guides
- [ ] Interactive examples
- [ ] API reference
- [ ] Video tutorials
- [ ] Blog for announcements

### Repository Polish

**Priority**: Medium

Open source best practices:

- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] Issue templates (bug, feature, question)
- [ ] Pull request template
- [ ] GitHub Actions CI/CD
- [ ] Automated npm publishing
- [ ] Semantic versioning automation
- [ ] Automated changelog generation

## Mid-Term (6-12 Months)

### MCP + Todoist Integration

**Priority**: Medium

AI-powered workflows combining markdown and Todoist:

- [ ] MCP tools for Todoist operations
  - [ ] `todoist_import_task` - Import markdown task to Todoist via AI
  - [ ] `todoist_sync` - AI-triggered sync
  - [ ] `todoist_list_tasks` - Query Todoist from AI
  - [ ] `todoist_get_sync_status` - Show sync state
- [ ] Unified AI queries across markdown + Todoist
- [ ] Smart sync suggestions from AI
- [ ] AI-powered conflict resolution

### GitHub Issues Integration

**Priority**: Medium

Sync tasks with GitHub Issues:

- [ ] GitHub API client
- [ ] Issue → markdown task mapping
- [ ] `md2do github import` command
- [ ] `md2do github sync` command
- [ ] Link markdown tasks to issues with `[github:#123]`
- [ ] Bidirectional sync (similar to Todoist)

### VS Code Extension

**Priority**: High

Native VS Code integration:

- [ ] Task tree view in sidebar
- [ ] Inline task decorations (priorities, due dates)
- [ ] Quick task creation
- [ ] Task completion shortcuts
- [ ] Sync status indicators
- [ ] Command palette integration
- [ ] Hover previews with task details

## Long-Term (12+ Months)

### Web Dashboard

**Priority**: Low

Browser-based task management:

- [ ] Real-time task visualization
- [ ] Kanban board view
- [ ] Calendar view
- [ ] Timeline/Gantt view
- [ ] Drag-and-drop task organization
- [ ] Multi-user collaboration features
- [ ] WebSocket-based live updates
- [ ] Mobile-responsive design

### Advanced Features

**Priority**: Various

- [ ] Task dependencies and relationships
- [ ] Recurring task patterns
- [ ] Time tracking integration
- [ ] Custom fields and metadata
- [ ] Task templates
- [ ] Workspaces / multi-repo support
- [ ] Advanced reporting and analytics
- [ ] Export to various formats (JIRA, Linear, etc.)

## Community Requests

Features requested by users (add via GitHub Issues):

- _None yet - project launching soon!_

## Completed

### Phase 1: Configuration System ✅

- [x] Zod schema validation
- [x] cosmiconfig integration
- [x] Hierarchical config (env → global → project)
- [x] Environment variable support
- [x] YAML and JSON support

### Phase 2: Todoist API Integration ✅

- [x] Official SDK wrapper (@doist/todoist-api-typescript)
- [x] TodoistClient with error handling
- [x] Task format mapping (md2do ↔ Todoist)
- [x] Priority conversion
- [x] Label management (auto-creation)
- [x] Comprehensive test coverage

### Phase 3: File Writer Module ✅

- [x] Atomic file updates
- [x] Task completion toggling
- [x] Add Todoist IDs to tasks
- [x] Preserve formatting and content
- [x] Batch update support
- [x] Safety checks and validation

### Phase 4: Todoist CLI Commands ✅

- [x] `md2do todoist list` - List Todoist tasks
- [x] `md2do todoist add` - Create tasks in Todoist
- [x] `md2do todoist import` - Import markdown task to Todoist
- [x] `md2do todoist sync` - Bidirectional sync

### Phase 5: MCP Server ✅

- [x] Model Context Protocol server
- [x] Tools: list_tasks, get_task_stats, search_tasks
- [x] Resources: task://all, task://project/{name}
- [x] Prompts: daily_standup, sprint_summary
- [x] Claude Code integration guide

## Contributing

Want to help build md2do? Check out our [Contributing Guide](CONTRIBUTING.md) (coming soon) or open an issue on GitHub to discuss new features!

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major** (x.0.0): Breaking changes
- **Minor** (0.x.0): New features, backward compatible
- **Patch** (0.0.x): Bug fixes, backward compatible

---

_Last updated: January 19, 2025_
