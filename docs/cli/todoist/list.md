# todoist list

List tasks from your Todoist account.

## Usage

```bash
md2do todoist list [options]
```

## Options

- `--project <name>` - Filter by Todoist project
- `--limit <n>` - Limit number of results
- `--format <type>` - Output format (pretty, table, json)

## Examples

```bash
# List all tasks
md2do todoist list

# List from specific project
md2do todoist list --project Work

# Limit results
md2do todoist list --limit 10

# JSON output
md2do todoist list --format json
```

## Related

- [Todoist Integration](/integrations/todoist) - Setup guide
- [Todoist Commands](/cli/todoist/overview) - All todoist commands
