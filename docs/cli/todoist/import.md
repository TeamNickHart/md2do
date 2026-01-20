# todoist import

Import a markdown task to Todoist.

## Usage

```bash
md2do todoist import <file:line> [options]
```

## Options

- `--project <name>` - Target Todoist project (default: configured default project)

## Examples

```bash
# Import specific task
md2do todoist import tasks.md:15

# Import to specific project
md2do todoist import notes.md:42 --project Personal

# Import from different directory
md2do todoist import ./work/tasks.md:8 --project Work
```

## How It Works

1. Reads the task from the specified line in your markdown file
2. Extracts metadata (priority, tags, due date)
3. Creates the task in Todoist
4. Adds `[todoist:ID]` marker to your markdown for future syncs

## Related

- [Todoist Integration](/integrations/todoist) - Setup guide
- [Todoist Sync](/cli/todoist/sync) - Bidirectional sync
- [Todoist Commands](/cli/todoist/overview) - All todoist commands
