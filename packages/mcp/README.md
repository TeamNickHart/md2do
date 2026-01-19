# @md2do/mcp

MCP (Model Context Protocol) server for md2do task manager. This allows AI assistants like Claude Code to directly query and analyze your markdown tasks.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to interact with external tools and data sources. This MCP server exposes md2do's task management capabilities to any MCP-compatible client.

## Features

### Tools (AI-Callable Functions)

- **`list_tasks`** - Query tasks with filters (assignee, priority, tags, due dates) and sorting
- **`get_task_stats`** - Get aggregated statistics grouped by assignee, project, priority, etc.
- **`search_tasks`** - Full-text search in task descriptions
- **`get_task_by_id`** - Retrieve a single task by its ID

### Resources (Contextual Data)

- **`task://all`** - All tasks in workspace
- **`task://project/{name}`** - Tasks for a specific project
- **`task://person/{name}`** - Tasks for a specific person
- **`task://file/{path}`** - Tasks from a specific file

### Prompts (Templates)

- **`daily_standup`** - Generate daily standup report
- **`sprint_summary`** - Summarize sprint progress
- **`overdue_review`** - Review and prioritize overdue tasks

## Installation

The MCP server is included in the md2do monorepo. Build it with:

```bash
pnpm --filter @md2do/mcp build
```

## Configuration for Claude Code

Add the MCP server to your Claude Code settings:

### macOS/Linux

Edit `~/.config/claude-code/settings.json` and add:

```json
{
  "mcpServers": {
    "md2do": {
      "command": "node",
      "args": ["/path/to/md2do/packages/mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

### Windows

Edit `%APPDATA%\claude-code\settings.json` and add:

```json
{
  "mcpServers": {
    "md2do": {
      "command": "node",
      "args": ["C:\\path\\to\\md2do\\packages\\mcp\\dist\\index.js"],
      "env": {}
    }
  }
}
```

## Usage Examples

Once configured, you can ask Claude to query your tasks:

### List Tasks

```
You: "What urgent tasks does @nick have?"

Claude calls: list_tasks({assignee: "nick", priority: "urgent"})

Claude: "Nick has 3 urgent tasks:
- Fix memory leak in WebSocket connection (due Jan 18)
- Implement user authentication API (due Jan 20)
- Set up staging environment (due Jan 18)"
```

### Get Statistics

```
You: "Show me task breakdown by assignee"

Claude calls: get_task_stats({groupBy: "assignee"})

Claude: "Here's the task breakdown:
- @nick: 19 tasks (4 completed, 15 incomplete)
- @jane: 19 tasks (4 completed, 15 incomplete)
- @alex: 9 tasks (1 completed, 8 incomplete)
..."
```

### Search Tasks

```
You: "Find all tasks mentioning authentication"

Claude calls: search_tasks({query: "authentication", caseInsensitive: true})

Claude: "Found 5 tasks mentioning authentication:
1. Implement user authentication API
2. Add OAuth authentication flow
3. Test authentication on mobile
..."
```

### Use Prompts

```
You: "Generate my daily standup"

Claude uses: daily_standup prompt

Claude: "Daily Standup Report

**Yesterday:**
- ✅ Set up PostgreSQL database schema
- ✅ Configure CI/CD pipeline

**Today:**
- 🔲 Fix memory leak in WebSocket connection (HIGH PRIORITY)
- 🔲 Implement user authentication API

**Blockers:**
- Need design approval for login forms"
```

## Resources

Access task data via URIs:

```
Claude: "Show me all tasks for the acme-app project"

Uses resource: task://project/acme-app

Claude displays all tasks filtered by project
```

## Development

### Run in Development Mode

```bash
# Watch mode
pnpm --filter @md2do/mcp dev

# Test the server with MCP Inspector
npx @modelcontextprotocol/inspector node packages/mcp/dist/index.js
```

### Testing

```bash
# Run tests
pnpm --filter @md2do/mcp test

# Run tests in watch mode
pnpm --filter @md2do/mcp test
```

## Architecture

The MCP server runs as a local process and communicates via stdio (standard input/output):

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Claude Code   │ ◄─────► │   md2do-mcp      │ ◄─────► │  Your markdown  │
│  (MCP Client)   │  stdio  │  (MCP Server)    │         │     files       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

**Resource Usage:**

- Memory: ~10-50MB
- CPU: Negligible (only active when queried)
- Network: None (local stdio only)

## Troubleshooting

### Server not starting

1. Check that Node.js >= 18.0.0 is installed:

   ```bash
   node --version
   ```

2. Verify the build was successful:

   ```bash
   ls -la packages/mcp/dist/index.js
   ```

3. Test the server manually:
   ```bash
   node packages/mcp/dist/index.js
   ```

### Claude Code not finding the server

1. Check your settings.json path is correct
2. Verify the absolute path to dist/index.js
3. Restart Claude Code after changing settings

### Permission errors

On Unix systems, ensure the file is executable:

```bash
chmod +x packages/mcp/dist/index.js
```

## API Reference

### Tool: `list_tasks`

**Input:**

```typescript
{
  path?: string;            // Path to scan (defaults to cwd)
  assignee?: string;        // Filter by assignee
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  project?: string;         // Filter by project
  person?: string;          // Filter by person
  tag?: string;             // Filter by tag
  completed?: boolean;      // Filter by completion status
  overdue?: boolean;        // Show only overdue tasks
  dueToday?: boolean;       // Show tasks due today
  dueThisWeek?: boolean;    // Show tasks due this week
  dueWithin?: number;       // Show tasks due within N days
  sort?: 'due' | 'priority' | 'created' | 'file' | 'project' | 'assignee';
  reverse?: boolean;        // Reverse sort order
  limit?: number;           // Limit results
}
```

**Output:**

```json
{
  "tasks": [...],
  "metadata": {
    "total": 113,
    "completed": 21,
    "incomplete": 92
  }
}
```

### Tool: `get_task_stats`

**Input:**

```typescript
{
  path?: string;
  groupBy?: 'assignee' | 'project' | 'person' | 'priority' | 'tag';
  assignee?: string;        // Pre-filter
  project?: string;         // Pre-filter
}
```

**Output:**

```json
{
  "overall": {
    "filesScanned": 8,
    "totalTasks": 113,
    "completed": 21,
    "incomplete": 92,
    "overdue": 5
  },
  "byPriority": {...},
  "byAssignee": {...},
  "byProject": {...}
}
```

### Tool: `search_tasks`

**Input:**

```typescript
{
  path?: string;
  query: string;            // Required
  caseInsensitive?: boolean;
  limit?: number;
}
```

### Tool: `get_task_by_id`

**Input:**

```typescript
{
  path?: string;
  id: string;               // Required
}
```

## License

MIT - See root LICENSE file
