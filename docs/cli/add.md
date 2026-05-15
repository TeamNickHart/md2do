# add

Add a task to a markdown file, or print to stdout.

## Usage

```bash
md2do add <text> [options]
```

## Options

| Option                   | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `-f, --file <path>`      | Target markdown file (omit to print to stdout)     |
| `-a, --assignee <name>`  | Assignee (`@name`)                                 |
| `-p, --priority <level>` | Priority: `urgent`, `high`, `normal`, `low`        |
| `-d, --due <date>`       | Due date (see [Date Formats](#date-formats))       |
| `-t, --tag <tags...>`    | Tags (`#tag`)                                      |
| `--completed`            | Create as completed task (`- [x]`)                 |
| `--line <n>`             | Insert at specific line number (requires `--file`) |

## Date Formats

The `--due` option accepts:

| Input               | Resolves to                 |
| ------------------- | --------------------------- |
| `YYYY-MM-DD`        | Exact date (passed through) |
| `today`             | Today's date                |
| `tomorrow`          | Tomorrow's date             |
| `monday` – `sunday` | Next occurrence of that day |
| `next week`         | Next Monday                 |

Dates are resolved using local time.

## Stdout Mode

When `--file` is omitted, the formatted task line is printed to stdout instead of being written to a file. This is useful for:

- **Dry-run testing** — preview what would be written
- **Piping** — append to a file or feed into other tools
- **Scripting** — compose tasks programmatically

::: warning
`--line` requires `--file`. Using `--line` without `--file` will produce an error.
:::

## Examples

### Basic task

```bash
md2do add "Buy milk" --file tasks.md
```

Output: `- [ ] Buy milk` (appended to `tasks.md`)

### Task with metadata

```bash
md2do add "Fix login bug" --file tasks.md \
  --assignee nick --priority high \
  --due tomorrow --tag backend
```

Output: `- [ ] Fix login bug @nick !! #backend #due:2026-01-21`

### Relative due dates

```bash
md2do add "Weekly review" --file tasks.md --due "next week"
md2do add "Friday deploy" --file tasks.md --due friday
md2do add "Urgent fix" --file tasks.md --due today
```

### Insert at a specific line

```bash
md2do add "Urgent fix" --file tasks.md --line 3 --priority urgent
```

### Completed task

```bash
md2do add "Already done" --file tasks.md --completed
```

Output: `- [x] Already done`

### Print to stdout (no file)

```bash
# Preview a task
md2do add "Review PR" --due tomorrow --priority high

# Pipe to a file
md2do add "New task" --due tomorrow >> tasks.md

# Use in a script
TASK=$(md2do add "Deploy v2" --due friday --tag release)
echo "$TASK" >> deploy-tasks.md
```

## See Also

- [Task Format](/guide/task-format) — Metadata syntax reference
- [CLI Overview](/cli/overview) — All commands
