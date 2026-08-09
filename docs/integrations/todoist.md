# Todoist Integration

Sync your markdown tasks with Todoist for mobile access, notifications, and cross-device task management.

## Overview

md2do integrates with Todoist for task management:

- **Import** - Send a single markdown task to Todoist and link it with `{todoist:ID}`
- **Push** - Push an entire markdown file to Todoist as a project with sections and tasks
- **Sync** - Pull updates from Todoist back to markdown (completion status)

::: info Current Implementation
md2do supports **task-level import** and **document-level push** (markdown → Todoist), plus **one-way sync** pulling completion status back from Todoist.

Full bidirectional sync (pushing markdown edits back to linked Todoist tasks) is planned for a future release.
:::

Your markdown files remain the source of truth, while Todoist provides mobile apps and notifications.

## Quick Start

### 1. Get Your Todoist API Token

1. Log in to [Todoist](https://app.todoist.com)
2. Go to **Settings** → **Integrations**
   - Direct link: [Todoist Integrations Settings](https://app.todoist.com/app/settings/integrations/developer)
3. Copy your **API token**
4. Keep it secure! This token has full access to your Todoist account

### 2. Configure md2do

**Option A: Environment Variable** (recommended)

```bash
export TODOIST_API_TOKEN="your-api-token-here"
```

**Option B: Config File**

Create `.md2do.json`:

```json
{
  "todoist": {
    "apiToken": "your-api-token-here",
    "defaultProject": "Inbox"
  }
}
```

**Important:** Add `.md2do.json` to `.gitignore` if using this method!

### 3. Test Connection

```bash
md2do todoist list
```

If you see your Todoist tasks, you're connected! 🎉

## Basic Usage

### List Todoist Tasks

```bash
# List all tasks from default project
md2do todoist list

# List from specific project
md2do todoist list --project Work

# Limit results
md2do todoist list --limit 10

# JSON output
md2do todoist list --format json
```

### Create Tasks in Todoist

```bash
# Simple task
md2do todoist add "Review pull request"

# With priority and labels
md2do todoist add "Fix bug" --priority urgent --labels bug,backend

# With due date
md2do todoist add "Meeting prep" --due tomorrow --project Work
```

### Import Markdown Tasks to Todoist

```bash
# Import a specific task (by file:line)
md2do todoist import tasks.md:15

# Specify target project
md2do todoist import notes.md:42 --project Personal
```

### Push a Markdown File as a Todoist Project

```bash
# Preview what would be created
md2do todoist push planning.md --dry-run

# Push (will prompt for confirmation)
md2do todoist push planning.md

# Push without confirmation
md2do todoist push planning.md --force
```

The `push` command reads the H1 heading as the project name, H2+ headings as sections, and tasks under each heading as section tasks. After pushing, it writes `{todoist:ID}` back to each heading so the file records where it was sent.

```markdown
# Q3 Planning {todoist:12345}

## Backend {todoist:67890}

- [ ] Fix auth bug
- [ ] Add rate limiting
```

## Sync Workflow

### How Sync Works

md2do links tasks using source link tokens:

```markdown
- [ ] Review PR #due/2026-01-25 {todoist:123456789}
```

The `{todoist:ID}` marker connects your markdown task to Todoist. This uses md2do's general
`{slug:ID}` source link syntax — `todoist` is the slug for the native Todoist integration.

> **Note:** Legacy bracket syntax (`[todoist: ID]`, `[due: ...]`) is still parsed for backward compatibility.

::: tip Other integrations
Need to bring in tasks from Teams, Outlook, or Slack? md2do's `ingest` command supports any
source via a simple JSONL format. See [Multi-Source Ingestion](/integrations/ingest).
:::

### Sync Commands

```bash
# Dry run - see what would change
md2do todoist sync --dry-run

# Pull updates from Todoist
md2do todoist sync --direction pull

# Sync specific directory
md2do todoist sync --path ./work-notes
```

### What Gets Synced

**From Todoist → Markdown (Current):**

- Completion status (checked/unchecked)
- Task updates and metadata

**From Markdown → Todoist (Coming Soon):**

- Task text updates
- Completion status changes
- Priority updates
- Tag/label changes
- Due date changes

## Priority Mapping

md2do maps priorities to Todoist's system:

| Markdown | Todoist | Description |
| -------- | ------- | ----------- |
| `!!!`    | P1      | Urgent      |
| `!!`     | P2      | High        |
| `!`      | P3      | Normal      |
| (none)   | P4      | Low         |

Example:

```markdown
- [ ] Critical bug !!! #backend
```

Syncs to Todoist as P1 priority with "backend" label.

## Labels & Tags

Tags in markdown become labels in Todoist:

```markdown
- [ ] Fix authentication #backend #security #urgent
```

Becomes a Todoist task with 3 labels: `backend`, `security`, `urgent`.

**Label Auto-Creation:** md2do creates missing labels automatically in Todoist.

## Projects

### Default Project

Set in config:

```json
{
  "todoist": {
    "defaultProject": "Inbox"
  }
}
```

All synced tasks go here unless specified otherwise.

### Project-Specific Sync

```bash
# Sync to specific project
md2do todoist import tasks.md:10 --project "Work Tasks"
```

## Common Workflows

### Mobile Task Capture

Use Todoist mobile app to capture tasks, then pull to markdown:

```bash
# Pull new tasks from Todoist
md2do todoist sync --direction pull
```

### Daily Review

Review markdown locally, sync completion status:

```bash
# Check markdown tasks
md2do list --assignee me --incomplete

# Pull completion updates from Todoist
md2do todoist sync --direction pull
```

### Team Collaboration

Keep markdown in git, sync with personal Todoist:

```bash
# Work on tasks locally (in markdown)
md2do list --project acme-corp

# Sync your subset to Todoist for mobile
md2do todoist sync --path ./projects/acme-corp
```

## Configuration

Complete Todoist configuration options:

```json
{
  "todoist": {
    "apiToken": "your-token",
    "defaultProject": "Inbox"
  }
}
```

**Options:**

- `apiToken` - Your Todoist API token
- `defaultProject` - Default project name for new tasks

See [Configuration Guide](/guide/configuration) for details.

## Troubleshooting

### "Invalid token" error

```bash
# Verify token is set
echo $TODOIST_API_TOKEN

# Test connection
md2do todoist list
```

Make sure you copied the full token from Todoist settings.

### Tasks not syncing

Check for Todoist ID markers:

```bash
# Find tasks without Todoist IDs
md2do list --incomplete | grep -v "todoist:"

# Import missing tasks
md2do todoist import tasks.md:15
```

### Duplicate tasks

If a task appears twice after sync:

1. Delete the duplicate in Todoist
2. Run `md2do todoist sync` again
3. The markdown version (with `{todoist:ID}`) is preserved

### Different completion status

If you mark a task complete in Todoist, run sync to update your markdown:

```bash
md2do todoist sync --dry-run  # Preview
md2do todoist sync            # Apply
```

To mark tasks complete in markdown and sync to Todoist, use the import command for now (bidirectional sync coming soon).

## Advanced Usage

### Multiple Todoist Accounts

Use different configs per directory:

**Personal** (`~/personal/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "personal-token",
    "defaultProject": "Personal"
  }
}
```

**Work** (`~/work/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "work-token",
    "defaultProject": "Work"
  }
}
```

### Selective Sync

Only sync specific tags:

```bash
# Import only tasks tagged #todoist
md2do list --tag todoist | while read line; do
  md2do todoist import "$line"
done
```

_(Better filtering coming soon)_

### Watch Mode (Future)

Auto-sync on file changes:

```bash
# Coming soon
md2do watch --sync todoist
```

## Security

### Protect Your Token

1. **Never commit tokens** - Add `.md2do.json` to `.gitignore`
2. **Use environment variables** - Especially for shared projects
3. **Restrict permissions**:
   ```bash
   chmod 600 ~/.md2do.json
   ```

### Token Scope

Todoist API tokens have **full account access**. Keep them secure like passwords.

### Revoke Tokens

If compromised, regenerate in [Todoist Settings](https://app.todoist.com/app/settings/integrations/developer).

## Limitations

Current limitations (may be addressed in future versions):

- `push` creates sections from H2+ headings, but subtask nesting is not yet supported
- Tasks pushed via `push` are not linked individually — only headings get `{todoist:ID}`
- No support for recurring tasks
- No support for task comments
- Subtasks sync as separate tasks
- No conflict resolution UI (last-modified wins)

See [Roadmap](/development/roadmap) for planned features.

## FAQ

### Can I use md2do without Todoist?

Yes! md2do works standalone. Todoist integration is completely optional.

### Will syncing modify my markdown files?

Yes, when pulling from Todoist. Always commit your markdown to git first.

### Can multiple people sync the same markdown files?

Not recommended. md2do is designed for personal task management. For teams, keep markdown in git and sync individually to personal Todoist accounts.

### What happens if I delete a task in Todoist?

It stays in your markdown. md2do only syncs updates and completions, not deletions.

### Can I sync to multiple Todoist projects?

Not automatically. Use `--project` flag when importing tasks to specify the destination.

## Next Steps

- [Task Format](/guide/task-format) - Learn task metadata syntax
- [Configuration](/guide/configuration) - Advanced config options
- [MCP Integration](/integrations/mcp) - Use with Claude Code AI
- [CLI Reference](/cli/todoist/overview) - Complete command reference
- [Multi-Source Ingestion](/integrations/ingest) - Import from Teams, Outlook, Slack, and more

## Get Help

- [GitHub Issues](https://github.com/TeamNickHart/md2do/issues) - Report bugs
- [Discussions](https://github.com/TeamNickHart/md2do/discussions) - Ask questions
- [Todoist API Docs](https://developer.todoist.com/rest/v2/) - Official API reference
