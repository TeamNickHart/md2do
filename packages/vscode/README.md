# md2do VSCode Extension

Intelligent markdown task management for Visual Studio Code, powered by [md2do](https://md2do.com).

## Features

### 📋 Task Explorer Sidebar

Browse all tasks across your workspace in an organized tree view:

- Grouped by file for easy navigation
- Shows completion status and counts
- Rich tooltips with full task metadata
- Click any task to jump to its location

### ⚠️ Smart Diagnostics

md2do validation warnings appear directly in VSCode's Problems panel:

- Malformed checkboxes and formatting issues
- Missing required metadata
- Duplicate Todoist IDs
- Respects your `.md2do.json` configuration

### ⌨️ Quick Task Actions

- **Toggle Completion**: Press `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Win/Linux) to toggle task completion
- Auto-adds completion date when checking tasks
- Removes completion date when unchecking

### 📊 Status Bar Integration

See task overview at a glance:

- Total task count
- Overdue task warnings
- Click to refresh all tasks

## Installation

### Beta Release (Recommended)

1. **Download** the latest `.vsix` file from [GitHub Releases](https://github.com/TeamNickHart/md2do/releases/latest)
2. **Open VSCode**
3. **Go to Extensions** sidebar (`Cmd+Shift+X` / `Ctrl+Shift+X`)
4. Click the **`...` menu** (top-right of Extensions sidebar)
5. Select **"Install from VSIX..."**
6. Choose the downloaded `md2do-vscode-0.1.0.vsix` file
7. **Reload VSCode** when prompted

### Command Line Install

```bash
# Download the .vsix file first, then:
code --install-extension md2do-vscode-0.1.0.vsix
```

### Updates

Beta releases do not auto-update. To get new features:

1. Check [Releases](https://github.com/TeamNickHart/md2do/releases) for updates
2. Download the new `.vsix` file
3. Reinstall using the same process

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
| Toggle Task Completion | `Cmd+Shift+C`  | `Ctrl+Shift+C`       | Toggle `[ ]` ↔ `[x]` |

### Commands

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for:

- `md2do: Toggle Task Completion` - Toggle task at cursor
- `md2do: Refresh Tasks` - Refresh all tasks and diagnostics

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

Phase 1 (Current):

- ✅ Task Explorer sidebar
- ✅ Diagnostics integration
- ✅ Toggle completion command

Phase 2 (Planned):

- Auto-completion for dates, assignees, tags
- Hover provider with rich task details
- CodeLens inline actions

Phase 3 (Planned):

- Dashboard webview with task visualization
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
