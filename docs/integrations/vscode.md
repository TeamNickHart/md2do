# VSCode Extension

Intelligent markdown task management directly in Visual Studio Code, powered by [md2do](https://md2do.com).

## What is it?

The md2do VSCode extension brings powerful task management features to your markdown editor:

- **Task Explorer** - Browse all tasks in a hierarchical tree view
- **Smart Diagnostics** - Validation warnings in Problems panel
- **Hover Tooltips** - Rich metadata display on hover
- **Smart Completion** - Auto-complete dates, assignees, tags, priorities
- **Quick Actions** - Toggle, copy, edit, delete tasks with one click

## Installation

### Beta Release (Recommended)

1. **Download** the latest `.vsix` file from [GitHub Releases](https://github.com/TeamNickHart/md2do/releases/latest)
2. **Open VSCode**
3. **Go to Extensions** sidebar (`Cmd+Shift+X` / `Ctrl+Shift+X`)
4. Click the **`...` menu** (top-right of Extensions sidebar)
5. Select **"Install from VSIX..."**
6. Choose the downloaded `md2do-vscode-X.X.X.vsix` file
7. **Reload VSCode** when prompted

### Command Line Install

```bash
# Download the .vsix file first, then:
code --install-extension md2do-vscode-0.1.1.vsix
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

## Features

### 📋 Task Explorer Sidebar

Browse all tasks across your workspace in an organized tree view:

- **Grouped by file** for easy navigation
- **Shows completion status** with counts (e.g., "3/10 completed")
- **Rich tooltips** with full task metadata on hover
- **Click any task** to jump to its location in the file
- **Context menu actions** for quick task management

**Location:** Appears in the Explorer sidebar panel

**Keyboard Shortcut:** `Cmd+Shift+E` / `Ctrl+Shift+E` to focus Explorer, then scroll to "md2do Tasks"

### ⚠️ Smart Diagnostics

md2do validation warnings appear directly in VSCode's Problems panel:

- **Malformed checkboxes** - Detects `[-]`, `[X]`, `[*]` instead of `[ ]` or `[x]`
- **Formatting issues** - Missing spaces after checkbox or before metadata
- **Missing metadata** - Optional warnings for tasks without due dates or completion dates
- **Duplicate Todoist IDs** - Prevents sync conflicts
- **File read errors** - Reports files that couldn't be scanned

**Location:** View → Problems (`Cmd+Shift+M` / `Ctrl+Shift+M`)

**Configuration:** Respects your `.md2do.json` warning rules

### ⌨️ Quick Task Actions

#### Toggle Completion

Press `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Win/Linux) to toggle task completion:

- `[ ]` → `[x]` - Marks complete and adds `[completed: 2026-01-27]`
- `[x]` → `[ ]` - Marks incomplete and removes completion date

Works on any line with a checkbox when cursor is positioned on that line.

#### Tree View Context Menu

Right-click any task in the Task Explorer:

- **Toggle Completion** - Check/uncheck task (inline button)
- **Edit Task** - Jump to task location in file
- **Copy as Markdown** - Copy task text with all metadata to clipboard
- **Delete Task** - Remove task from file (with confirmation)

### 💡 Hover Tooltips

Hover over any task line to see rich metadata:

- ✅ **Status** - Completed or incomplete
- 📅 **Due Date** - Shows date and overdue warning if applicable
- 👤 **Assignee** - Who's responsible
- ⚡ **Priority** - Urgent, high, normal, or low
- 🏷️ **Tags** - All tags on the task
- 📄 **Location** - File path and line number

**Usage:** Simply hover your mouse over a task line

### ⚡ Smart Completion

Auto-complete for task metadata as you type:

#### Date Completion

Trigger: Type `[due:` or `[completed:` and press `Space`

Suggestions:

- `today` → Today's date
- `tomorrow` → Tomorrow's date
- `monday`, `tuesday`, etc. → Next occurrence of that weekday
- `next week` → 7 days from today
- `next month` → 30 days from today

**Example:**

```markdown
- [ ] Review PR [due: t|]
```

Type `t` and select `today` → `- [ ] Review PR [due: 2026-01-27]`

#### Assignee Completion

Trigger: Type `@` followed by a character

Suggestions:

- Configured assignees from `md2do.defaultAssignees` setting
- Learned assignees from existing tasks in workspace
- Sorted alphabetically

**Example:**

```markdown
- [ ] Fix bug @a|
```

Type `@a` and select `alice` → `- [ ] Fix bug @alice`

#### Tag Completion

Trigger: Type `#` followed by a character

Suggestions:

- All tags found in workspace tasks
- Sorted by frequency (most common first)

**Example:**

```markdown
- [ ] Update docs #b|
```

Type `#b` and select `backend` → `- [ ] Update docs #backend`

#### Priority Completion

Trigger: Type `!` after a space

Suggestions:

- `!` → Normal priority
- `!!` → High priority
- `!!!` → Urgent priority

**Example:**

```markdown
- [ ] Critical bug !|
```

Type `!` and select `!!!` → `- [ ] Critical bug !!!`

### 📊 Status Bar Integration

See task overview at a glance in the status bar:

- **Total task count** - Shows number of tasks in workspace
- **Overdue warnings** - Highlights overdue task count in red
- **Click to refresh** - Manually rescan all tasks

**Location:** Bottom-right of VSCode window

## Task Format

md2do supports rich metadata in your markdown tasks:

```markdown
- [ ] Basic task
- [ ] Task with due date [due: 2026-02-01]
- [ ] Urgent task [due: tomorrow] !!!
- [ ] Assigned task @alice #bug
- [x] Completed task [completed: 2026-01-27]
- [ ] Full metadata task [due: 2026-02-15] @bob #feature #urgent !! [todoist: 123456]
```

See [Task Format](/guide/task-format) for complete syntax reference.

## Keyboard Shortcuts

| Command                | Shortcut (Mac) | Shortcut (Win/Linux) | Description           |
| ---------------------- | -------------- | -------------------- | --------------------- |
| Toggle Task Completion | `Cmd+Shift+C`  | `Ctrl+Shift+C`       | Toggle `[ ]` ↔ `[x]`  |
| Open Explorer          | `Cmd+Shift+E`  | `Ctrl+Shift+E`       | View Task Explorer    |
| Open Problems          | `Cmd+Shift+M`  | `Ctrl+Shift+M`       | View Diagnostics      |
| Command Palette        | `Cmd+Shift+P`  | `Ctrl+Shift+P`       | Access md2do commands |

## Commands

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for:

- `md2do: Toggle Task Completion` - Toggle task at cursor
- `md2do: Refresh Tasks` - Refresh all tasks and diagnostics

## Extension Settings

Configure md2do through VSCode settings (`Cmd+,` / `Ctrl+,`):

```json
{
  // Enable/disable automatic workspace scanning
  "md2do.autoScan": true,

  // Show validation warnings in Problems panel
  "md2do.warnings.enabled": true,

  // Default assignees for auto-completion
  "md2do.defaultAssignees": ["@alice", "@bob", "@charlie"]
}
```

### Settings Reference

#### `md2do.autoScan`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Automatically scan workspace for tasks on startup and file changes

#### `md2do.warnings.enabled`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Show md2do validation warnings in Problems panel

#### `md2do.defaultAssignees`

- **Type:** `string[]`
- **Default:** `[]`
- **Description:** List of default assignees for auto-completion (e.g., `["@alice", "@bob"]`)

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

See [Configuration Guide](/guide/configuration) for full options.

### Common Configurations

#### Strict Validation

Require due dates and completion dates:

```json
{
  "warnings": {
    "rules": {
      "missing-due-date": "warn",
      "missing-completed-date": "warn"
    }
  }
}
```

#### Minimal Warnings

Only show critical errors:

```json
{
  "warnings": {
    "rules": {
      "unsupported-bullet": "off",
      "missing-space-after": "off",
      "missing-space-before": "off",
      "duplicate-todoist-id": "error",
      "file-read-error": "error"
    }
  }
}
```

#### Custom File Patterns

Scan only specific directories:

```json
{
  "markdown": {
    "pattern": "{docs,notes,tasks}/**/*.md",
    "exclude": ["archive/**"]
  }
}
```

## Example Workflows

### Daily Task Review

1. Open VSCode in your workspace
2. View Task Explorer in sidebar
3. See all tasks grouped by file
4. Click overdue tasks to jump to location
5. Toggle completion with `Cmd+Shift+C`

### Creating New Tasks

1. Open any markdown file
2. Type `- [ ] ` to start a task
3. Add description
4. Type `[due:` and press `Space`
5. Select date from auto-complete
6. Type `@` and select assignee
7. Type `#` and select tags
8. Add priority with `!`, `!!`, or `!!!`

### Fixing Validation Issues

1. Open Problems panel (`Cmd+Shift+M`)
2. See all validation warnings
3. Click warning to jump to location
4. Fix the issue (e.g., change `[-]` to `[ ]`)
5. Warning disappears automatically

### Team Task Management

1. Configure default assignees in settings
2. Create tasks with assignee auto-completion
3. Use tags for categorization (#bug, #feature, etc.)
4. Filter tasks in CLI: `md2do list --assignee alice`
5. Sync selected tasks to Todoist

## Combining with CLI

The VSCode extension works seamlessly with the md2do CLI:

```bash
# List all tasks in VSCode workspace
md2do list

# Filter by assignee (from VSCode auto-completion)
md2do list --assignee @alice

# Show statistics
md2do stats --group-by priority

# Sync to Todoist
md2do todoist sync
```

See [CLI Reference](/cli/overview) for full command documentation.

## Troubleshooting

### Tasks not appearing in Explorer

**Problem:** Task Explorer is empty but you have tasks in markdown files

**Solutions:**

1. Check file patterns in `.md2do.json` - ensure your markdown files match the pattern
2. Refresh tasks manually: Command Palette → "md2do: Refresh Tasks"
3. Check VSCode settings: ensure `md2do.autoScan` is `true`
4. Verify task format: must be `- [ ]` or `- [x]` (GitHub-style checkboxes)

### Diagnostics not showing

**Problem:** No warnings appear in Problems panel

**Solutions:**

1. Check VSCode setting: `md2do.warnings.enabled` should be `true`
2. Check `.md2do.json` warning rules: ensure rules aren't all set to `"off"`
3. Verify file format: warnings only appear for detected issues
4. Open Problems panel: `Cmd+Shift+M` / `Ctrl+Shift+M`

### Auto-completion not working

**Problem:** Date/assignee/tag completion doesn't trigger

**Solutions:**

1. Ensure you're on a task line starting with `- [ ]` or `- [x]`
2. For dates: type `[due:` or `[completed:` followed by `Space`
3. For assignees: type `@` followed by a character
4. For tags: type `#` followed by a character
5. For priorities: type `!` after a space character

### Keyboard shortcut conflicts

**Problem:** `Cmd+Shift+C` doesn't toggle task completion

**Solutions:**

1. Check for keyboard shortcut conflicts: VSCode → Preferences → Keyboard Shortcuts
2. Search for "md2do.toggleComplete"
3. Reassign to a different shortcut if needed
4. Alternative: Use Command Palette → "md2do: Toggle Task Completion"

### Performance with large workspaces

**Problem:** Extension is slow with thousands of markdown files

**Solutions:**

1. Exclude large directories in `.md2do.json`:
   ```json
   {
     "markdown": {
       "exclude": ["node_modules/**", "vendor/**", "archive/**"]
     }
   }
   ```
2. Use specific file patterns instead of `**/*.md`:
   ```json
   {
     "markdown": {
       "pattern": "tasks/**/*.md"
     }
   }
   ```
3. Disable auto-scan and refresh manually: set `md2do.autoScan` to `false`

## Roadmap

### Phase 1 (Current - v0.1.0) ✅

- ✅ Task Explorer sidebar
- ✅ Diagnostics integration
- ✅ Toggle completion command
- ✅ Hover tooltips
- ✅ Context menu actions
- ✅ Smart auto-completion

### Phase 2 (Planned)

- CodeLens inline actions (toggle, edit, delete above each task)
- Task filtering in sidebar (by assignee, priority, tags)
- Bulk operations (mark multiple tasks complete)
- Task dependencies visualization

### Phase 3 (Planned)

- Dashboard webview with task visualization and charts
- Todoist bidirectional sync from within VSCode
- Custom task grouping options (by priority, assignee, tag)
- Task time tracking integration

See [Roadmap](/development/roadmap) for the full project roadmap.

## Related Packages

- [@md2do/cli](../cli/overview) - Command-line interface
- [@md2do/core](https://npmjs.com/package/@md2do/core) - Core task parsing and scanning
- [@md2do/mcp](mcp) - Model Context Protocol server for AI integration

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/TeamNickHart/md2do/issues).

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/TeamNickHart/md2do.git
   cd md2do
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the extension:

   ```bash
   pnpm --filter md2do-vscode build
   ```

4. Open in VSCode:

   ```bash
   code packages/vscode
   ```

5. Press `F5` to launch Extension Development Host

6. Test your changes in the new VSCode window

See [Contributing Guide](/development/contributing) for full development workflow.

## Privacy & Security

**Everything runs locally:**

- No data sent to external servers
- No internet connection required
- Tasks never leave your machine
- Extension only reads/writes markdown files you explicitly open

Your markdown files remain private and secure.

## Requirements

- Visual Studio Code 1.85.0 or higher
- Markdown files with task checkboxes (GitHub-flavored Markdown format)

## Resources

- [GitHub Repository](https://github.com/TeamNickHart/md2do) - Source code and issues
- [GitHub Releases](https://github.com/TeamNickHart/md2do/releases) - Download .vsix files
- [Task Format Guide](/guide/task-format) - Learn the task syntax
- [Configuration Guide](/guide/configuration) - Customize behavior
- [Examples](/guide/examples) - More usage patterns

## Next Steps

- [Getting Started](/guide/getting-started) - Set up md2do CLI
- [Task Format](/guide/task-format) - Learn the task syntax
- [Configuration](/guide/configuration) - Customize your setup
- [MCP Integration](/integrations/mcp) - Connect to AI assistants
- [Todoist Integration](/integrations/todoist) - Sync with Todoist

## License

MIT © Nicholas Hart
