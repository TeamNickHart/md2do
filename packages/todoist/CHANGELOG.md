# @md2do/todoist

## 0.7.0

### Minor Changes

- feat: Obsidian community plugin, #due/ syntax migration, and improved task parsing

### Patch Changes

- Updated dependencies []:
  - @md2do/core@0.7.0

## 0.6.0

### Minor Changes

- feat: add `md2do add` CLI command with stdout mode and syntax migration
  - New `md2do add` command for creating tasks from the CLI
  - `--file` is optional — omit to print to stdout for dry-run or piping
  - Supports `--assignee`, `--priority`, `--due` (relative dates), `--tag`, `--completed`, `--line`
  - Breaking: metadata syntax migrated to hybrid tag/brace format (`#due/`, `{completed:}`, `{todoist:}`)
  - Legacy bracket syntax still parsed for backward compatibility
  - New `md2do migrate` command to convert files to new syntax

### Patch Changes

- Updated dependencies []:
  - @md2do/core@0.6.0

## 0.5.1

### Patch Changes

- [#47](https://github.com/TeamNickHart/md2do/pull/47) [`ce65eaf`](https://github.com/TeamNickHart/md2do/commit/ce65eaf588c702254fb564f748a5841241cc5c97) Thanks [@nickhart](https://github.com/nickhart)! - Documentation improvements and standardization
  - Standardized bracket syntax across all docs (use space after colon: `[due: ...]`)
  - Marked semantic/relative dates as experimental with clear warnings
  - Clarified Todoist sync is one-way (pull only), not bidirectional
  - Documented context extraction limitation (must run from repo root)
  - Updated code examples in READMEs to match best practices
  - Removed unhelpful parentheses syntax warning

- Updated dependencies [[`ce65eaf`](https://github.com/TeamNickHart/md2do/commit/ce65eaf588c702254fb564f748a5841241cc5c97)]:
  - @md2do/core@0.5.1

## 0.4.0

### Patch Changes

- 8e0f80a: Add time support to due dates with workday configuration

  **New Features:**
  - Support optional time component in due dates: `[due: 2026-02-06 17:00]`
  - Parse both 24-hour format times (H:MM and HH:MM)
  - Added `parseTime()` utility for time validation
  - New workday config schema with `startTime`, `endTime`, and `defaultDueTime`
  - When no time specified in due date, applies default from config (defaults to 17:00 end of workday)
  - Prevents "due 8 hours ago" issues for dates without explicit times

  **Configuration:**

  ```json
  {
    "workday": {
      "startTime": "08:00",
      "endTime": "17:00",
      "defaultDueTime": "end"
    }
  }
  ```

- Updated dependencies [8e0f80a]
  - @md2do/core@0.4.0

## 0.3.0

### Minor Changes

- Add comprehensive warning system for markdown validation and VSCode extension
  - Add warning configuration system with customizable rules
  - Add VSCode extension with task explorer, diagnostics, hover tooltips, and smart completion
  - Support for validating malformed checkboxes, missing metadata, duplicate IDs, and more
  - Add .vsix distribution for beta testing

### Patch Changes

- Updated dependencies []:
  - @md2do/core@0.3.0

## 0.2.3

### Patch Changes

- [#17](https://github.com/TeamNickHart/md2do/pull/17) [`c12adb3`](https://github.com/TeamNickHart/md2do/commit/c12adb32b2b50ca89bf22cdab57ca63498ba3dee) Thanks [@nickhart](https://github.com/nickhart)! - ## Security & Tooling Updates

  ### Security Fixes
  - Fix esbuild security vulnerability (GHSA-67mh-4wv8-2f99) via pnpm override forcing esbuild >= 0.25.0

  ### Developer Experience
  - Add @vitest/coverage-v8 dependency to enable code coverage reporting
  - Update prettier to latest patch version (3.1.0 → 3.8.1)
  - Update @modelcontextprotocol/sdk (1.25.2 → 1.25.3)

  ### Testing
  - All 401 unit tests passing
  - All 35 E2E tests passing
  - Coverage reporting now enabled across all packages

  No breaking changes or API changes in this release.

- Updated dependencies [[`c12adb3`](https://github.com/TeamNickHart/md2do/commit/c12adb32b2b50ca89bf22cdab57ca63498ba3dee)]:
  - @md2do/core@0.2.3

## 0.2.2

### Patch Changes

- [#12](https://github.com/TeamNickHart/md2do/pull/12) [`f07ba4c`](https://github.com/TeamNickHart/md2do/commit/f07ba4c4f6f46b43129e1ebd2b8ea67800e21dee) Thanks [@nickhart](https://github.com/nickhart)! - Enhance npm package discoverability with comprehensive READMEs and improved keywords
  - Add conversion-focused README for @md2do/cli with Quick Start and common use cases
  - Add developer-focused README for @md2do/core with complete API reference
  - Add npm badges (version, downloads, license) to all package READMEs
  - Expand keywords across all packages for better npm search discoverability
  - Update root README tagline and add npm badges

- Updated dependencies [[`f07ba4c`](https://github.com/TeamNickHart/md2do/commit/f07ba4c4f6f46b43129e1ebd2b8ea67800e21dee)]:
  - @md2do/core@0.2.2

## 0.2.0

### Minor Changes

- [#9](https://github.com/TeamNickHart/md2do/pull/9) [`8a2550b`](https://github.com/TeamNickHart/md2do/commit/8a2550bd23ce247bab3129e45b09a46b3c17d3c1) Thanks [@nickhart](https://github.com/nickhart)! - Initial release of md2do - a powerful CLI tool for managing TODO tasks in markdown files.

  **Features:**
  - 📝 Markdown-native task parsing with rich metadata (assignees, priorities, due dates, tags)
  - 🔍 Powerful filtering and sorting capabilities
  - 📊 Rich statistics and aggregation
  - 🔄 Todoist integration with bidirectional sync
  - 🤖 MCP (Model Context Protocol) server for AI integration
  - ⚙️ Hierarchical configuration system
  - 🎨 Beautiful CLI output with multiple formats (pretty, table, JSON)

  **Packages:**
  - `@md2do/cli` - Main CLI interface (install this one!)
  - `@md2do/core` - Core parsing, filtering, and file operations
  - `@md2do/config` - Configuration management
  - `@md2do/todoist` - Todoist API integration
  - `@md2do/mcp` - MCP server for AI assistants

### Patch Changes

- Updated dependencies [[`8a2550b`](https://github.com/TeamNickHart/md2do/commit/8a2550bd23ce247bab3129e45b09a46b3c17d3c1)]:
  - @md2do/core@0.2.0
