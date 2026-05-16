# md2do Obsidian Plugin

Intelligent markdown task management for [Obsidian](https://obsidian.md), powered by [md2do](https://md2do.com).

## Features

### Task List View

A dedicated sidebar that displays all tasks across your vault:

- Click any task to jump to its location
- Tasks show metadata inline (due date, priority, assignee, tags)
- Completed tasks can be shown or hidden

**Grouping Modes:**

- **By File** - Default view, grouped by source file
- **By Assignee** - See who has what tasks
- **By Due Date** - Overdue, today, this week, later, no date
- **By Priority** - Urgent, high, normal, low
- **By Tag** - Organized by task tags

**Sorting Options:**

- Sort by due date
- Sort by priority
- Sort alphabetically

### Auto-Completion

Type trigger characters on a task line to get suggestions:

- `#due/` - Date shortcuts (today, tomorrow, monday...) and progressive date entry
- `{completed:` - Date suggestions for completion dates
- `@` - Assignee suggestions from your vault
- `#` - Tag suggestions from your vault
- `!` - Priority levels (!, !!, !!!)

Legacy bracket syntax (`[due:`, `[completed:`) also triggers suggestions.

### Completion Tracking

Toggle task completion from the command palette or task list:

- Completing a task adds `{completed:YYYY-MM-DD}` automatically
- Uncompleting removes the completion date (handles both new and legacy syntax)

### Diagnostics

- Show overdue task count
- Show diagnostics summary (errors, warnings, info)
- Show task statistics (total, completed, incomplete, overdue)

## Installation

### From GitHub Releases (Current)

1. Download the latest release from [GitHub Releases](https://github.com/TeamNickHart/md2do/releases)
2. Extract `main.js`, `manifest.json`, and `styles.css` into your vault's `.obsidian/plugins/md2do/` directory
3. Open Obsidian Settings > Community Plugins
4. Enable "md2do"

### From Community Plugins (Coming Soon)

1. Open Obsidian Settings > Community Plugins > Browse
2. Search for "md2do"
3. Click Install, then Enable

### Development Install

```bash
git clone https://github.com/TeamNickHart/md2do.git
cd md2do
pnpm install && pnpm build

# Symlink into your vault
ln -s "$(pwd)/packages/obsidian" "/path/to/vault/.obsidian/plugins/md2do"
```

## Task Format

md2do uses standard markdown checkboxes with rich metadata:

```markdown
- [ ] Basic task
- [ ] Task with due date #due/2026-02-01
- [ ] Urgent task @alice !!! #backend
- [x] Done task {completed:2026-01-15}
- [ ] Synced task {todoist:123456}
```

**Metadata:**

| Syntax                   | Meaning                           |
| ------------------------ | --------------------------------- |
| `@username`              | Assignee                          |
| `!!!` / `!!` / `!`       | Priority (urgent / high / normal) |
| `#tag`                   | Tag                               |
| `#due/YYYY-MM-DD`        | Due date (Obsidian nested tag)    |
| `{completed:YYYY-MM-DD}` | Completion date                   |
| `{todoist:ID}`           | Todoist sync ID                   |

> Legacy bracket syntax (`[due: ...]`, `[completed: ...]`, `[todoist: ...]`) is still parsed for backward compatibility.

### Why `#due/` instead of `#due:`?

Obsidian doesn't allow colons in tags. Using slash (`#due/2026-05-15`) creates a real Obsidian nested tag — `tag:#due` finds all due-dated tasks, and dates appear as children in the Tags view.

## Commands

Open the Command Palette (`Cmd+P` / `Ctrl+P`) and search for:

| Command                         | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| md2do: Show Task List           | Open the task list sidebar                     |
| md2do: Refresh Task List        | Rescan vault and update task list              |
| md2do: Toggle Task Completion   | Toggle `[ ]` / `[x]` on current line           |
| md2do: Show Overdue Tasks       | Notify overdue task count                      |
| md2do: Show Diagnostics Summary | Show error/warning/info counts                 |
| md2do: Show Task Statistics     | Show total/completed/incomplete/overdue counts |

Grouping and sorting are available via toolbar buttons in the task list sidebar.

## Settings

Configure in Obsidian Settings > md2do:

| Setting              | Description                          | Default   |
| -------------------- | ------------------------------------ | --------- |
| Scan Pattern         | Glob pattern for files to scan       | `**/*.md` |
| Exclude Folders      | Folders to skip during scanning      | `[]`      |
| Warnings Enabled     | Show parsing warnings                | `true`    |
| Default Group Mode   | Initial grouping mode                | `file`    |
| Default Sort Mode    | Initial sort mode                    | `dueDate` |
| Show Completed Tasks | Display completed tasks in sidebar   | `false`   |
| Auto Scan            | Rescan automatically on file changes | `true`    |

## Related Packages

- [@md2do/cli](https://md2do.com/cli/overview) - Command-line interface
- [@md2do/core](https://npmjs.com/package/@md2do/core) - Core task parsing and scanning
- [md2do VSCode](https://marketplace.visualstudio.com/items?itemName=md2do.md2do-vscode) - VS Code extension
- [@md2do/mcp](https://md2do.com/integrations/mcp) - Model Context Protocol server

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/TeamNickHart/md2do/issues).

## License

MIT © Nicholas Hart
