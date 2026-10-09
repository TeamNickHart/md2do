# todoist push

Push a markdown file to Todoist as a new project with sections and tasks.

## Usage

```bash
md2do todoist push <file> [options]
```

## Arguments

| Argument | Description           |
| -------- | --------------------- |
| `<file>` | Markdown file to push |

## Options

| Option      | Description                                     |
| ----------- | ----------------------------------------------- |
| `--dry-run` | Preview what would be created, without doing it |
| `--force`   | Skip confirmation prompt; re-push if ID exists  |

## How It Works

The command reads your markdown file's heading structure and maps it to Todoist:

| Markdown        | Todoist      |
| --------------- | ------------ |
| H1 heading      | Project name |
| H2+ headings    | Sections     |
| `- [ ] tasks`   | Tasks        |
| Completed tasks | Skipped      |

After pushing, it writes `{todoist:ID}` back to each heading so the file records the Todoist IDs:

```markdown
# Q3 Planning {todoist:12345}

## Backend {todoist:67890}

- [ ] Fix auth bug !!
- [ ] Add rate limiting #backend #due/2026-08-01

## Frontend {todoist:11111}

- [ ] Update dashboard
```

Task metadata (priority, tags, due dates) is sent to Todoist automatically.

## Examples

```bash
# Preview without creating anything
md2do todoist push planning.md --dry-run

# Push with confirmation prompt
md2do todoist push planning.md

# Push without prompting
md2do todoist push planning.md --force
```

## Notes

- The file must have an H1 heading (`# Project Name`) — this becomes the Todoist project name
- If the file already has a `{todoist:ID}` on the H1, the command will error unless you pass `--force` (which creates a new project)
- Completed tasks (`- [x]`) are skipped
- All H2, H3, and deeper headings are treated as flat sections (Todoist does not support nested sections)
- This is a **one-time, one-way push** — it does not sync changes back

## Related

- [`todoist import`](/cli/todoist/import) - Import a single task to Todoist
- [`todoist sync`](/cli/todoist/sync) - Pull completion status from Todoist
- [Todoist Integration](/integrations/todoist) - Full guide
