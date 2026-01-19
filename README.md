# md2do

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0%2B-orange)](https://pnpm.io/)

A powerful CLI tool for scanning, filtering, and managing TODO tasks in markdown files. Built with TypeScript,
designed for developers who love markdown.

## ✨ Features

- 📝 **Markdown-native** - Works directly with your existing markdown files
- 🔍 **Smart parsing** - Extracts TODOs with rich metadata (assignees, priorities, due dates, tags)
- 🎯 **Powerful filtering** - Filter by assignee, priority, project, tags, due dates, and more
- 📊 **Rich statistics** - View task breakdowns by priority, assignee, project, or any metadata
- 🎨 **Beautiful output** - Color-coded priorities, clickable file paths (VS Code integration)
- ⚡ **Fast** - Built with performance in mind using fast-glob
- 🔧 **Flexible** - Output in pretty, table, or JSON formats
- 📁 **Context-aware** - Automatically extracts project and person context from folder structure
- 🔄 **Todoist integration** - Bidirectional sync foundation with official Todoist API
- ⚙️ **Configurable** - Hierarchical config support (global, project, environment)
- 🤖 **AI-powered** - MCP server integration for Claude and other AI assistants

## 📦 Installation

### npm

```bash
npm install -g @md2do/cli
```

### pnpm

```bash
pnpm add -g @md2do/cli
```

### yarn

```bash
yarn global add @md2do/cli
```

### From source

```bash
git clone https://github.com/TeamNickHart/md2do.git
cd md2do
pnpm install
pnpm build
npm link packages/cli
```

## 🚀 Quick Start

1. Navigate to a directory with markdown files
2. List all tasks:

```bash
md2do list
```

3. View task statistics:

```bash
md2do stats
```

That's it! md2do will scan all `.md` files and extract your TODO items.

## 📖 Usage

### Task Format

md2do recognizes standard markdown task syntax with rich metadata:

```markdown
- [ ] Implement user authentication @nick !!! #backend #auth (2026-01-20)
- [x] Write documentation @jane !! #docs (2026-01-15)
- [ ] Fix bug in parser @alex ! #bug (2026-01-18)
```

**Supported metadata:**

- `@username` - Task assignee
- `!!!` / `!!` / `!` - Priority (urgent/high/normal)
- `#tag` - Tags
- `(YYYY-MM-DD)` - Due date
- `- [x]` - Completed task
- `- [ ]` - Incomplete task

### List Command

Display tasks with filtering and sorting:

```bash
# List all tasks
md2do list

# Filter by assignee
md2do list --assignee nick

# Filter by priority
md2do list --priority urgent

# Filter by tag
md2do list --tag backend

# Show only incomplete tasks
md2do list --incomplete

# Show overdue tasks
md2do list --overdue

# Sort by priority
md2do list --sort priority

# Combine filters
md2do list --assignee nick --priority urgent --sort due

# Output as JSON
md2do list --format json

# Output as table
md2do list --format table
```

**List Options:**

| Option                      | Description                                                |
| --------------------------- | ---------------------------------------------------------- |
| `-p, --path <path>`         | Path to scan (defaults to current directory)               |
| `--pattern <pattern>`       | Glob pattern for markdown files (default: `**/*.md`)       |
| `--exclude <patterns...>`   | Patterns to exclude from scanning                          |
| `--completed`               | Show only completed tasks                                  |
| `--incomplete`              | Show only incomplete tasks                                 |
| `-a, --assignee <username>` | Filter by assignee                                         |
| `--priority <level>`        | Filter by priority (urgent/high/normal/low)                |
| `--project <name>`          | Filter by project                                          |
| `--person <name>`           | Filter by person (from 1-1 files)                          |
| `-t, --tag <tag>`           | Filter by tag                                              |
| `--overdue`                 | Show only overdue tasks                                    |
| `--due-today`               | Show tasks due today                                       |
| `--due-this-week`           | Show tasks due this week                                   |
| `--due-within <days>`       | Show tasks due within N days                               |
| `-s, --sort <field>`        | Sort by field (due/priority/created/file/project/assignee) |
| `--reverse`                 | Reverse sort order                                         |
| `-f, --format <type>`       | Output format (pretty/table/json)                          |
| `--no-colors`               | Disable colors in output                                   |
| `--no-paths`                | Hide file paths                                            |
| `--context`                 | Show context information (project, person, heading)        |

### Stats Command

View aggregated statistics about your tasks:

```bash
# Overall statistics
md2do stats

# Group by assignee
md2do stats --by assignee

# Group by priority
md2do stats --by priority

# Group by project
md2do stats --by project

# Group by tag
md2do stats --by tag

# Filter before grouping
md2do stats --assignee nick --by priority
```

**Stats Options:**

| Option                      | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `-p, --path <path>`         | Path to scan (defaults to current directory)          |
| `--pattern <pattern>`       | Glob pattern for markdown files                       |
| `--exclude <patterns...>`   | Patterns to exclude from scanning                     |
| `--by <field>`              | Group by field (assignee/project/person/priority/tag) |
| `-a, --assignee <username>` | Filter by assignee                                    |
| `--project <name>`          | Filter by project                                     |
| `--no-colors`               | Disable colors in output                              |

## 🤖 AI Integration (MCP)

md2do includes a **Model Context Protocol (MCP)** server that enables AI assistants like Claude to interact with your
tasks. The MCP server exposes tools, resources, and prompts for task management through a standardized protocol.

**What is MCP?**

The Model Context Protocol is an open protocol developed by Anthropic that allows AI assistants to securely connect to
external data sources and tools. Think of it like a "Language Server Protocol" for AI assistants.

**Quick Setup for Claude Code:**

```bash
# Build the MCP server
pnpm --filter @md2do/mcp build

# Add to your Claude Code configuration
# See packages/mcp/README.md for detailed instructions
```

**Available Capabilities:**

- 🔧 **Tools**: `list_tasks`, `get_task_stats`, `search_tasks`, `get_task_by_id`
- 📚 **Resources**: Access tasks by project, person, file, or all tasks
- 📋 **Prompts**: Daily standup, sprint summary, overdue review templates

**Use Cases:**

- Generate daily standup reports automatically
- Ask Claude to analyze your task backlog
- Get AI-powered task prioritization recommendations
- Create sprint summaries and progress reports

👉 **[Full MCP Documentation](packages/mcp/README.md)** - Complete setup guide, API reference, and examples

## 📁 Project Structure & Context

md2do automatically extracts context from your file structure:

```
projects/
  acme-app/              # Project context: acme-app
    sprint-planning.md
    bugs.md
  widget-co/             # Project context: widget-co
    roadmap.md
1-1s/
  nick.md                # Person context: nick
  jane.md                # Person context: jane
personal/
  home.md
```

Tasks in `projects/acme-app/*.md` automatically get `project: acme-app`
Tasks in `1-1s/nick.md` automatically get `person: nick`

## 🎨 Output Examples

### Pretty Format (Default)

```
Found 113 tasks
  ✓ 21 completed | ○ 92 incomplete

  ○ !!! Fix memory leak in WebSocket connection (2026-01-18) @nick #bug #critical
    file:///path/to/bugs.md:7

  ○ !! Design dashboard wireframes (2026-01-25) @emma #design #analytics
    file:///path/to/roadmap.md:9
```

### Table Format

```
┌────────┬──────────┬──────────────────────────────┬──────────┬─────┬──────────────┐
│ Status │ Priority │ Task                         │ Assignee │ Due │ File         │
├────────┼──────────┼──────────────────────────────┼──────────┼─────┼──────────────┤
│ ○      │ !!!      │ Fix memory leak...           │ @nick    │     │ bugs.md:7    │
│ ○      │ !!       │ Design dashboard wireframes  │ @emma    │     │ roadmap.md:9 │
└────────┴──────────┴──────────────────────────────┴──────────┴─────┴──────────────┘
```

### JSON Format

```json
{
  "tasks": [
    {
      "id": "f777d4bd",
      "text": "Fix memory leak in WebSocket connection (2026-01-18)",
      "completed": false,
      "file": "bugs.md",
      "line": 7,
      "assignee": "nick",
      "priority": "urgent",
      "tags": ["bug", "critical"]
    }
  ],
  "metadata": {
    "total": 113,
    "completed": 21,
    "incomplete": 92
  }
}
```

## 🔧 Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/TeamNickHart/md2do.git
cd md2do

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Run all quality checks
pnpm validate
```

### Project Structure

```
md2do/
├── packages/
│   ├── core/          # Core parsing, filtering, and file writing
│   │   ├── src/
│   │   │   ├── parser/      # Markdown task parser
│   │   │   ├── scanner/     # File scanner
│   │   │   ├── filters/     # Task filtering
│   │   │   ├── sorting/     # Task sorting
│   │   │   ├── writer/      # File modification (atomic updates)
│   │   │   └── types/       # TypeScript types
│   │   └── tests/
│   ├── cli/           # CLI interface
│   │   ├── src/
│   │   │   ├── commands/    # List and stats commands
│   │   │   ├── formatters/  # Output formatters
│   │   │   └── scanner.ts   # File scanning
│   │   └── tests/
│   ├── config/        # Configuration management
│   │   ├── src/
│   │   │   ├── schema.ts    # Zod schemas for validation
│   │   │   └── loader.ts    # Hierarchical config loading
│   │   └── tests/
│   ├── todoist/       # Todoist API integration
│   │   ├── src/
│   │   │   ├── client.ts    # API client wrapper
│   │   │   └── mapper.ts    # Task format conversion
│   │   └── tests/
│   └── mcp/           # MCP server for AI integration
│       ├── src/
│       │   ├── tools/       # MCP tools (list, stats, search)
│       │   ├── resources/   # MCP resources (task URIs)
│       │   ├── prompts/     # MCP prompt templates
│       │   └── utils/       # Scanner utilities
│       └── tests/
├── docs/              # Documentation
│   ├── todoist-setup.md              # Todoist configuration guide
│   └── todoist-implementation-plan.md # Technical roadmap
├── examples/          # Example markdown files
└── .claude/          # Claude Code configuration
```

### Running Locally

```bash
# Build the project
pnpm build

# Link the CLI globally (choose one method)

# Method 1: Using convenience script (recommended)
pnpm link:cli

# Method 2: Run directly without global install
pnpm cli -- list --path examples
pnpm cli -- stats --path examples

# Method 3: Using pnpm filter directly
pnpm --filter @md2do/cli link --global

# Test it out (if using Method 1 or 3)
md2do list --path examples
md2do stats --path examples

# Unlink when done
pnpm unlink:cli
```

### Testing

We use Vitest for testing with high coverage:

```bash
# Run all tests
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests for a specific package
pnpm --filter @md2do/core test

# Run tests with UI
pnpm --filter @md2do/core test:ui
```

**Test Coverage:**

- 359 tests across 14 test suites
- Parser tests (70 tests)
- Scanner tests (43 tests)
- Filter tests (41 tests)
- Sorting tests (26 tests)
- Pattern matching tests (43 tests)
- Date utility tests (45 tests)
- Writer tests (15 tests)
- Config tests (26 tests)
- Todoist tests (31 tests)
- And more!

## 📖 Additional Documentation

- [Todoist Setup Guide](docs/todoist-setup.md) - Complete guide to configuring Todoist integration
- [Todoist Implementation Plan](docs/todoist-implementation-plan.md) - Technical roadmap and architecture
- [Config Package](packages/config/README.md) - Configuration management documentation
- [Todoist Package](packages/todoist/README.md) - Todoist API integration documentation
- [MCP Package](packages/mcp/README.md) - Model Context Protocol server documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and validation (`pnpm validate`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Quality

This project maintains high code quality standards:

- ✅ TypeScript with strict mode
- ✅ ESLint for code linting
- ✅ Prettier for code formatting
- ✅ Husky for git hooks
- ✅ lint-staged for pre-commit checks
- ✅ Comprehensive test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js) for CLI parsing
- Styled with [Chalk](https://github.com/chalk/chalk) for terminal colors
- Tables powered by [cli-table3](https://github.com/cli-table/cli-table3)
- File scanning with [fast-glob](https://github.com/mrmlnc/fast-glob)
- Date handling with [date-fns](https://github.com/date-fns/date-fns)
- AI integration powered by [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk) by Anthropic

## 🗺️ Roadmap

- [x] **MCP (Model Context Protocol) integration** - ✅ Complete! See [MCP docs](packages/mcp/README.md)
- [x] **Configuration file support** - ✅ Complete! Hierarchical config with `.md2do.json`/`.yaml`
- [x] **Todoist integration foundation** - ✅ Complete! API client, task mapping, file writer
  - [ ] CLI commands (`md2do todoist sync`, `md2do todoist push`, etc.)
  - [ ] Bidirectional sync logic
  - [ ] Interactive token setup
- [ ] Watch mode for continuous monitoring
- [ ] Custom output templates
- [ ] GitHub Issues integration
- [ ] Web dashboard
- [ ] VS Code extension

## 📞 Support

- 🐛 [Report bugs](https://github.com/TeamNickHart/md2do/issues)
- 💡 [Request features](https://github.com/TeamNickHart/md2do/issues)
- 📖 [Documentation](https://github.com/TeamNickHart/md2do/wiki)

---

Made with ❤️ by [Nick Hart](https://github.com/TeamNickHart)
