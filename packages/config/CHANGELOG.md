# @md2do/config

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

## 0.2.2

### Patch Changes

- [#12](https://github.com/TeamNickHart/md2do/pull/12) [`f07ba4c`](https://github.com/TeamNickHart/md2do/commit/f07ba4c4f6f46b43129e1ebd2b8ea67800e21dee) Thanks [@nickhart](https://github.com/nickhart)! - Enhance npm package discoverability with comprehensive READMEs and improved keywords
  - Add conversion-focused README for @md2do/cli with Quick Start and common use cases
  - Add developer-focused README for @md2do/core with complete API reference
  - Add npm badges (version, downloads, license) to all package READMEs
  - Expand keywords across all packages for better npm search discoverability
  - Update root README tagline and add npm badges

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
