# todoist add

Create a new task in Todoist.

## Usage

```bash
md2do todoist add <content> [options]
```

## Options

- `--priority <level>` - Task priority (urgent, high, normal, low)
- `--labels <tags>` - Comma-separated labels
- `--due <date>` - Due date (YYYY-MM-DD or natural language)
- `--project <name>` - Todoist project name

## Examples

```bash
# Simple task
md2do todoist add "Review pull request"

# With priority and labels
md2do todoist add "Fix bug" --priority urgent --labels bug,backend

# With due date
md2do todoist add "Meeting prep" --due tomorrow --project Work

# Natural language dates
md2do todoist add "Weekly review" --due "next friday"
```

## Related

- [Todoist Integration](/integrations/todoist) - Setup guide
- [Todoist Commands](/cli/todoist/overview) - All todoist commands
