# Todoist CLI Commands

Interact with Todoist from the command line.

## Commands

- [`todoist list`](/cli/todoist/list) - List tasks from Todoist
- [`todoist add`](/cli/todoist/add) - Create tasks in Todoist
- [`todoist import`](/cli/todoist/import) - Import markdown tasks to Todoist
- [`todoist sync`](/cli/todoist/sync) - Bidirectional sync

## Requirements

All Todoist commands require an API token. See [Todoist Integration](/integrations/todoist) for setup.

## Quick Examples

```bash
# List Todoist tasks
md2do todoist list --project Work

# Create a task
md2do todoist add "Review PR" --priority high --due tomorrow

# Import from markdown
md2do todoist import tasks.md:15

# Sync everything
md2do todoist sync
```

## Related

- [Todoist Integration](/integrations/todoist) - Complete guide
- [CLI Overview](/cli/overview) - All commands
