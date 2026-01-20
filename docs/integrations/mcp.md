# MCP Integration (AI-Powered)

Connect md2do to Claude Code and other AI assistants via the Model Context Protocol (MCP).

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard that lets AI assistants interact with your tools and data.

With md2do's MCP server, you can ask Claude:

```
"What urgent tasks does @nick have?"
"Show me task breakdown by assignee"
"Generate my daily standup report"
"Find all overdue backend tasks"
```

Claude queries your markdown files directly and gives you intelligent answers.

## Quick Start

### 1. Build the MCP Server

```bash
cd /path/to/md2do
pnpm --filter @md2do/mcp build
```

This creates `packages/mcp/dist/index.js`.

### 2. Configure Claude Code

Add md2do to Claude Code's MCP servers:

**macOS/Linux:** Edit `~/.config/claude-code/settings.json`

**Windows:** Edit `%APPDATA%\claude-code\settings.json`

Add this configuration:

```json
{
  "mcpServers": {
    "md2do": {
      "command": "node",
      "args": ["/absolute/path/to/md2do/packages/mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

**Important:** Use the **absolute path** to `index.js`.

### 3. Restart Claude Code

Close and reopen Claude Code. The md2do server will start automatically.

### 4. Test It

Ask Claude in a conversation:

```
"List my incomplete tasks"
```

If Claude responds with your tasks, it's working! 🎉

## What You Can Ask

### List Tasks

```
"Show me all urgent tasks"
"What tasks are assigned to @alice?"
"List backend tasks due this week"
"Show incomplete tasks sorted by priority"
```

Claude calls the `list_tasks` tool with appropriate filters.

### Get Statistics

```
"How many tasks do I have?"
"Show task breakdown by assignee"
"What's my completion rate by project?"
"Give me priority distribution"
```

Claude calls the `get_task_stats` tool with grouping options.

### Search Tasks

```
"Find tasks about authentication"
"Search for 'API' in task descriptions"
"What tasks mention the login flow?"
```

Claude performs full-text search across all tasks.

### Generate Reports

```
"Generate my daily standup"
"Create a sprint summary"
"Review overdue tasks"
```

Claude uses built-in prompts to create formatted reports.

## Example Conversations

### Daily Standup

```
You: "Generate my daily standup"

Claude: "📋 Daily Standup Report

**Completed Yesterday:**
✅ Set up PostgreSQL database schema (tasks.md:12)
✅ Configure CI/CD pipeline (devops.md:8)

**Today's Plan:**
🔲 Fix memory leak in WebSocket (bugs.md:15) - HIGH PRIORITY
🔲 Implement user authentication API (features.md:22)
🔲 Code review for mobile app (reviews.md:5)

**Blockers:**
- Need design approval for login forms
- Waiting on staging environment access"
```

### Team Overview

```
You: "Show team task distribution"

Claude: "👥 Team Task Overview

**@alice:** 12 tasks (3 urgent, 5 high, 4 normal)
- Focus: Backend API development
- Top priority: Database migration (due tomorrow)

**@bob:** 8 tasks (1 urgent, 4 high, 3 normal)
- Focus: Frontend UI components
- Top priority: Mobile responsive design

**@charlie:** 15 tasks (2 urgent, 6 high, 7 normal)
- Focus: Infrastructure & DevOps
- Top priority: Production deployment pipeline"
```

### Project Status

```
You: "What's the status of the acme-corp project?"

Claude: "📊 Project: acme-corp

**Summary:**
- Total tasks: 47
- Completed: 12 (26%)
- In progress: 35
- Overdue: 3 ⚠️

**By Priority:**
- Urgent: 5 tasks
- High: 18 tasks
- Normal: 24 tasks

**Overdue Tasks:**
1. API authentication (due Jan 15) - @alice
2. Mobile testing (due Jan 17) - @bob
3. Documentation update (due Jan 16) - @charlie

**Completion Trend:** On track for Feb 1 delivery"
```

## Available Tools

Claude has access to these tools:

### `list_tasks`

Filter and query tasks:

- **By assignee:** `--assignee alice`
- **By priority:** `--priority urgent`
- **By tag:** `--tag backend`
- **By due date:** `--overdue`, `--due-today`, `--due-this-week`
- **By project:** `--project acme-corp`
- **By completion:** `--completed` / `--incomplete`

### `get_task_stats`

Aggregate statistics:

- **Group by:** assignee, project, priority, tag, person
- **Metrics:** total, completed, incomplete, overdue counts
- **Completion rates** and **priority distribution**

### `search_tasks`

Full-text search:

- **Query:** any text in task descriptions
- **Case-insensitive** option
- **Limit results**

### `get_task_by_id`

Retrieve a specific task by its unique ID.

## Built-in Prompts

### Daily Standup

```
Claude: Use the daily_standup prompt
```

Generates:

- Completed tasks (yesterday)
- Today's plan (incomplete tasks)
- Blockers and priorities

### Sprint Summary

```
Claude: Use the sprint_summary prompt
```

Generates:

- Sprint goals
- Completion stats
- Task breakdown by assignee
- Burndown projections

### Overdue Review

```
Claude: Use the overdue_review prompt
```

Generates:

- All overdue tasks
- Prioritized by urgency
- Suggestions for re-scheduling

## Resources

Claude can access task data via URIs:

- `task://all` - All tasks
- `task://project/acme-corp` - Project-specific tasks
- `task://person/alice` - Person-specific tasks
- `task://file/notes.md` - File-specific tasks

Example:

```
You: "Show me all tasks for the backend project"

Claude accesses: task://project/backend
```

## Natural Language Queries

Ask naturally - Claude translates to md2do filters:

| You ask                           | Claude translates to                                          |
| --------------------------------- | ------------------------------------------------------------- |
| "My urgent tasks"                 | `list_tasks({assignee: "me", priority: "urgent"})`            |
| "Overdue backend work"            | `list_tasks({tag: "backend", overdue: true})`                 |
| "Alice's tasks this week"         | `list_tasks({assignee: "alice", dueThisWeek: true})`          |
| "How many bugs are open?"         | `get_task_stats({tag: "bug", completed: false})`              |
| "Sprint progress by person"       | `get_task_stats({groupBy: "assignee"})`                       |
| "Find tasks about authentication" | `search_tasks({query: "authentication", caseInsensitive: t})` |
| "What's blocking me?"             | `search_tasks({query: "blocked", assignee: "me"})`            |
| "Tasks I finished yesterday"      | `list_tasks({assignee: "me", completed: true})`               |
| "All P1 tasks across projects"    | `list_tasks({priority: "urgent"})`                            |
| "Tasks without assignees"         | `list_tasks({assignee: null})`                                |
| "Show me the roadmap file"        | `task://file/roadmap.md`                                      |
| "What's in the 1-1 with Bob?"     | `task://person/bob`                                           |
| "Generate my standup"             | Uses `daily_standup` prompt                                   |
| "Summarize this sprint"           | Uses `sprint_summary` prompt                                  |
| "Help me prioritize overdue work" | Uses `overdue_review` prompt                                  |

## Advanced Usage

### Combining with Todoist

If you have Todoist integration enabled, Claude can help sync:

```
You: "Which tasks should I sync to Todoist?"

Claude: "Here are incomplete tasks without Todoist IDs:

1. Review API docs (features.md:15) - urgent
2. Update mobile tests (testing.md:8) - high
3. Fix login redirect (bugs.md:12) - urgent

Recommended command:
md2do todoist import features.md:15
md2do todoist import bugs.md:12"
```

### Code Analysis

```
You: "What tasks are related to the authentication codebase?"

Claude: "Found 8 tasks mentioning authentication:

**High Priority:**
- Implement OAuth flow (features.md:22) @alice
- Add JWT token validation (api.md:15) @alice
- Test 2FA on mobile (testing.md:31) @bob

**Normal Priority:**
- Document auth endpoints (docs.md:8) @charlie
- Refactor auth middleware (refactor.md:12) @alice
..."
```

### Custom Workflows

```
You: "Show me what I need to review today"

Claude: "📝 Code Review Queue

**Urgent Reviews:**
1. PR #145: User authentication (1-1s/alice.md:12)
2. PR #152: Payment flow (reviews.md:8)

**This Week:**
1. PR #148: Dark mode UI
2. PR #151: API pagination
3. PR #153: Mobile navigation

All tasks tagged #code-review and due by Friday"
```

## Configuration

### Custom Working Directory

Specify a different root for scanning:

```json
{
  "mcpServers": {
    "md2do": {
      "command": "node",
      "args": ["/path/to/md2do/packages/mcp/dist/index.js"],
      "env": {
        "MD2DO_ROOT": "/path/to/your/notes"
      }
    }
  }
}
```

### Multiple Workspaces

Run separate MCP servers for different workspaces:

```json
{
  "mcpServers": {
    "md2do-work": {
      "command": "node",
      "args": ["/path/to/md2do/packages/mcp/dist/index.js"],
      "env": {
        "MD2DO_ROOT": "~/work/notes"
      }
    },
    "md2do-personal": {
      "command": "node",
      "args": ["/path/to/md2do/packages/mcp/dist/index.js"],
      "env": {
        "MD2DO_ROOT": "~/personal/notes"
      }
    }
  }
}
```

## Troubleshooting

### Server not found

**Problem:** Claude says "No MCP servers available"

**Solutions:**

1. Check the path to `index.js` is absolute (not relative)
2. Verify you built the MCP package: `pnpm --filter @md2do/mcp build`
3. Restart Claude Code after editing settings

### Permission denied

**Problem:** "EACCES: permission denied"

**Solution (Unix):**

```bash
chmod +x /path/to/md2do/packages/mcp/dist/index.js
```

### Node.js version

**Problem:** Server fails to start

**Solution:** Ensure Node.js >= 18.0.0:

```bash
node --version
# Should show v18.0.0 or higher
```

### Verify server manually

Test the server outside Claude Code:

```bash
node /path/to/md2do/packages/mcp/dist/index.js
# Server should start (you won't see output, that's normal)
```

### Debug with MCP Inspector

Use the official MCP Inspector tool:

```bash
npx @modelcontextprotocol/inspector node /path/to/md2do/packages/mcp/dist/index.js
```

This opens a web UI to test the MCP server interactively.

## Performance

The MCP server is lightweight:

- **Memory:** ~10-50MB
- **CPU:** Only active when Claude queries
- **Startup:** < 100ms
- **Network:** None (local stdio only)

## Privacy & Security

**Everything runs locally:**

- No data sent to external servers
- No internet connection required
- Tasks never leave your machine
- Claude Code communicates via stdio only

Your markdown files remain private and secure.

## Limitations

- Server must be rebuilt after md2do updates
- Only one working directory per server instance
- No real-time file watching (tasks cached per query)

See [Roadmap](/development/roadmap) for planned improvements.

## Next Steps

- [Task Format](/guide/task-format) - Learn the task syntax
- [Filtering](/guide/filtering) - Understand query options
- [Todoist Integration](/integrations/todoist) - Combine MCP with Todoist
- [Examples](/guide/examples) - More usage patterns

## Resources

- [MCP Specification](https://modelcontextprotocol.io) - Official MCP docs
- [Claude Code](https://claude.com/claude-code) - Get Claude Code
- [GitHub Issues](https://github.com/TeamNickHart/md2do/issues) - Report bugs
