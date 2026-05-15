# Obsidian Plugin

Native task management for [Obsidian](https://obsidian.md), powered by the same `@md2do/core` engine as the CLI and VS Code extension.

::: warning Beta
The Obsidian plugin is in early release. Install via GitHub releases — community plugin submission is planned.
:::

## What is it?

The md2do Obsidian plugin brings task scanning, filtering, and organization directly into Obsidian:

- **Task List View** - Browse all tasks across your vault in a dedicated sidebar
- **Grouping & Sorting** - Organize by file, assignee, due date, priority, or tag
- **Commands** - Toggle task completion, refresh tasks, change view modes
- **Settings** - Configure scan patterns, excluded folders, and display preferences

## Installation

### From GitHub Releases (Current)

1. Download the latest release from [GitHub Releases](https://github.com/TeamNickHart/md2do/releases)
2. Extract `main.js`, `manifest.json`, and `styles.css` into your vault's `.obsidian/plugins/md2do/` directory
3. Open Obsidian Settings > Community Plugins
4. Enable "md2do"

### From Community Plugins (Coming Soon)

Once accepted into the Obsidian community plugin directory:

1. Open Obsidian Settings > Community Plugins > Browse
2. Search for "md2do"
3. Click Install, then Enable

## Features

### Task List View

A dedicated sidebar view that displays all tasks found across your vault:

- Click any task to jump to its location in the file
- Tasks show metadata inline (due date, priority, assignee, tags)
- Completed tasks can be shown or hidden

**Open with:** Command Palette > "md2do: Show Task List"

### Grouping Modes

Organize tasks in the sidebar by:

- **By File** - Default view, tasks grouped under their source file
- **By Assignee** - See tasks per person
- **By Due Date** - Overdue, today, this week, later, no date
- **By Priority** - Urgent, high, normal, low
- **By Tag** - Organized by task tags

### Sorting

Sort tasks within groups by:

- Due date
- Priority
- Alphabetical order

### Commands

Available from the Command Palette (`Cmd+P` / `Ctrl+P`):

| Command                       | Description                          |
| ----------------------------- | ------------------------------------ |
| md2do: Show Task List         | Open the task list sidebar           |
| md2do: Refresh Tasks          | Rescan vault and update task list    |
| md2do: Toggle Task Completion | Toggle `[ ]` / `[x]` on current line |
| md2do: Group by File          | Switch to file grouping              |
| md2do: Group by Assignee      | Switch to assignee grouping          |
| md2do: Group by Due Date      | Switch to due date grouping          |
| md2do: Group by Priority      | Switch to priority grouping          |
| md2do: Group by Tag           | Switch to tag grouping               |
| md2do: Sort by Due Date       | Sort tasks by due date               |
| md2do: Sort by Priority       | Sort tasks by priority               |
| md2do: Sort Alphabetically    | Sort tasks alphabetically            |

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

## Task Format

The Obsidian plugin uses the same task syntax as all md2do tools:

```markdown
- [ ] Basic task
- [ ] Task with due date #due:2026-02-01
- [ ] Urgent task @alice !!! #backend
- [x] Done task {completed:2026-01-15}
- [ ] Synced task {todoist:123456}
```

> Legacy bracket syntax (`[due: ...]`, `[completed: ...]`, `[todoist: ...]`) is still parsed for backward compatibility.

See [Task Format](/guide/task-format) for the complete syntax reference.

## Obsidian + iPad Workflow

md2do works well for mobile task management on iPad:

1. Create tasks in your daily notes or project files using standard markdown checkboxes
2. Add metadata (`#due:`, `@assignee`, `!!` priority, `#tags`) as you write
3. Use the Task List view to browse and filter across your vault
4. Toggle completion directly from the sidebar or with the command palette

## Differences from VS Code Extension

Both extensions are powered by `@md2do/core`, but optimized for their respective editors:

| Feature         | VS Code                         | Obsidian             |
| --------------- | ------------------------------- | -------------------- |
| Task sidebar    | Task Explorer in Explorer panel | Dedicated leaf view  |
| Diagnostics     | Problems panel integration      | Warnings in settings |
| CodeLens        | Inline actions above tasks      | Not available        |
| Dashboard       | Webview panel                   | Not available        |
| Auto-completion | `#due:`, `@`, `#`, `!` triggers | Planned              |
| Todoist sync    | Via CLI                         | Via CLI              |

## Troubleshooting

### Tasks not appearing

1. Check that your files match the configured scan pattern
2. Verify excluded folders don't include your task files
3. Run "md2do: Refresh Tasks" from the command palette
4. Ensure tasks use standard checkbox format: `- [ ]` or `- [x]`

### Plugin not loading

1. Verify all three files exist in `.obsidian/plugins/md2do/`: `main.js`, `manifest.json`, `styles.css`
2. Check that Community Plugins are enabled in Obsidian settings
3. Restart Obsidian after installation

## See Also

- [VS Code Extension](/integrations/vscode) - VS Code integration
- [Task Format](/guide/task-format) - Complete syntax reference
- [Getting Started](/guide/getting-started) - Set up md2do CLI
