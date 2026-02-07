# md2do VSCode Extension

Intelligent markdown task management for Visual Studio Code, powered by [md2do](https://md2do.com).

## Features

### 📋 Task Explorer Sidebar

Browse all tasks across your workspace with powerful organization options:

**Grouping Modes:**

- 📁 **By File** - Default view, grouped by file location
- 👤 **By Assignee** - See who has what tasks
- 📅 **By Due Date** - Overdue, today, this week, later, no date
- ⚡ **By Priority** - Urgent, high, normal, low
- 🏷️ **By Tag** - Organized by task tags
- 📋 **Flat List** - All tasks in a sorted list without grouping

**Filters:**

- ☑️ **Show Incomplete Only** - Hide completed tasks
- ⚠️ **Show Overdue Only** - Focus on overdue tasks
- 👥 **Show Assigned Only** - Hide unassigned tasks

**Sorting Options:**

- 📅 Sort by Due Date
- ⚡ Sort by Priority
- 🔤 Sort Alphabetically
- 📍 Sort by Line Number

**Features:**

- Shows completion status and counts for each group
- Rich tooltips with full task metadata
- Click any task to jump to its location
- Right-click for quick actions (toggle, edit, delete)

### ⚠️ Smart Diagnostics

md2do validation warnings appear directly in VSCode's Problems panel:

- Malformed checkboxes and formatting issues
- Missing required metadata
- Duplicate Todoist IDs
- Respects your `.md2do.json` configuration

### ⌨️ Quick Task Actions

- **Toggle Completion**: Press `Cmd+K Enter` (Mac) or `Ctrl+K Enter` (Win/Linux) to toggle task completion
- Auto-adds completion date when checking tasks
- Removes completion date when unchecking

### 🔍 CodeLens Inline Actions

Actionable links appear above each task for quick access:

- **✅ Mark Complete / ⬜ Mark Incomplete** - Toggle task completion with one click
- **📅 Due Date Info** - Shows due date with countdown or overdue warnings
- **🔴/🟠/🟡 Priority** - Visual priority indicators
- **🔄 Synced** - Todoist sync status
- **🗑️ Delete** - Quick delete action

### 📊 Interactive Dashboard

Visual overview of all incomplete tasks with smart grouping:

- **Task Statistics** - Total, complete, incomplete, overdue, and due today counts
- **By Assignee** - See who has what tasks assigned
- **By Due Date** - Overdue, today, this week, later, no date
- **By Priority** - Urgent, high, normal, low
- **Click to Drill Down** - Click any group to see detailed task list with sorting options
- **Navigate to Tasks** - Click tasks to jump to file location
- **Auto-refresh** - Updates automatically when you edit markdown files

Open with: `Cmd+Shift+P` → `md2do: Open Dashboard`

### 📊 Status Bar Integration

See task overview at a glance:

- Total task count
- Overdue task warnings
- Click to refresh all tasks

## Installation

### VSCode Marketplace (Recommended)

1. **Open VSCode**
2. **Go to Extensions** sidebar (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. **Search for "md2do"**
4. Click **Install**

Or [install directly from the marketplace](https://marketplace.visualstudio.com/items?itemName=md2do.md2do-vscode).

### Command Line Install

```bash
code --install-extension md2do.md2do-vscode
```

### Manual Install (Alternative)

If you prefer to install manually:

1. **Download** the latest `.vsix` file from [GitHub Releases](https://github.com/TeamNickHart/md2do/releases/latest)
2. **Open VSCode**
3. **Go to Extensions** sidebar (`Cmd+Shift+X` / `Ctrl+Shift+X`)
4. Click the **`...` menu** (top-right of Extensions sidebar)
5. Select **"Install from VSIX..."**
6. Choose the downloaded `md2do-vscode-X.X.X.vsix` file
7. **Reload VSCode** when prompted

### Updates

Extensions installed from the marketplace auto-update automatically. Manual installations require reinstalling from GitHub Releases.

### Uninstall

1. Go to Extensions sidebar
2. Find "md2do"
3. Click gear icon → **Uninstall**

## Requirements

- Visual Studio Code 1.85.0 or higher
- Markdown files with task checkboxes (GitHub-flavored Markdown format)

## Usage

### Task Format

md2do supports rich metadata in your markdown tasks:

```markdown
- [ ] Basic task
- [ ] Task with due date [due: 2026-02-01]
- [ ] Urgent task [due: tomorrow] !!!
- [ ] Assigned task @alice #bug
- [x] Completed task [completed: 2026-01-27]
```

### Keyboard Shortcuts

| Command                | Shortcut (Mac) | Shortcut (Win/Linux) | Description          |
| ---------------------- | -------------- | -------------------- | -------------------- |
| Toggle Task Completion | `Cmd+K Enter`  | `Ctrl+K Enter`       | Toggle `[ ]` ↔ `[x]` |

### Commands

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for:

**Dashboard:**

- `md2do: Open Dashboard` - Open interactive task dashboard

**Task Actions:**

- `md2do: Toggle Task Completion` - Toggle task at cursor
- `md2do: Refresh Tasks` - Refresh all tasks and diagnostics

**Grouping:**

- `md2do: Group by File` - Group tasks by file
- `md2do: Group by Assignee` - Group tasks by assignee
- `md2do: Group by Due Date` - Group tasks by due date
- `md2do: Group by Priority` - Group tasks by priority
- `md2do: Group by Tag` - Group tasks by tag
- `md2do: Flat List (No Grouping)` - Show all tasks in a flat list

**Filters:**

- `md2do: Toggle: Show Incomplete Only` - Show/hide completed tasks
- `md2do: Toggle: Show Overdue Only` - Show/hide non-overdue tasks
- `md2do: Toggle: Show Assigned Only` - Show/hide unassigned tasks

**Sorting:**

- `md2do: Sort by Due Date` - Sort tasks by due date
- `md2do: Sort by Priority` - Sort tasks by priority
- `md2do: Sort Alphabetically` - Sort tasks alphabetically
- `md2do: Sort by Line Number` - Sort tasks by line number

**Tip:** Use the toolbar buttons in the Task Explorer for quick access to grouping, filtering, and sorting options!

## Extension Settings

Configure md2do through VSCode settings:

```json
{
  // Enable/disable automatic workspace scanning
  "md2do.autoScan": true,

  // Show validation warnings in Problems panel
  "md2do.warnings.enabled": true
}
```

## Configuration File

Create a `.md2do.json` file in your workspace root to customize behavior:

```json
{
  "markdown": {
    "pattern": "**/*.md",
    "exclude": ["node_modules/**", ".git/**", "dist/**"]
  },
  "warnings": {
    "enabled": true,
    "rules": {
      "unsupported-bullet": "warn",
      "malformed-checkbox": "warn",
      "missing-space-after": "warn",
      "missing-space-before": "warn",
      "relative-date-no-context": "warn",
      "missing-due-date": "off",
      "missing-completed-date": "off",
      "duplicate-todoist-id": "error",
      "file-read-error": "error"
    }
  }
}
```

See [Configuration Guide](https://md2do.com/guide/configuration) for full options.

## Roadmap

Phase 1 (Complete):

- ✅ Task Explorer sidebar
- ✅ Diagnostics integration
- ✅ Toggle completion command

Phase 2 (Complete):

- ✅ Auto-completion for dates, assignees, tags
- ✅ Hover provider with rich task details
- ✅ CodeLens inline actions

Phase 3 (In Progress):

- ✅ Dashboard webview with task visualization
- Todoist bidirectional sync
- Custom task grouping options

## Related Packages

- [@md2do/cli](https://md2do.com/cli/overview) - Command-line interface
- [@md2do/core](https://npmjs.com/package/@md2do/core) - Core task parsing and scanning
- [@md2do/mcp](https://md2do.com/integrations/mcp) - Model Context Protocol server

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/TeamNickHart/md2do/issues).

## License

MIT © Nicholas Hart
