# todoist sync

Bidirectional sync between markdown and Todoist.

## Usage

```bash
md2do todoist sync [options]
```

## Options

- `--dry-run` - Preview changes without applying them
- `--direction <mode>` - Sync direction: `push`, `pull`, or `both` (default: `both`)
- `--path <dir>` - Directory to sync (default: current directory)

## Sync Modes

### Both (default)

Syncs changes in both directions:

- Markdown → Todoist (push new/updated tasks)
- Todoist → Markdown (pull completion status, updates)

```bash
md2do todoist sync
```

### Pull

Update markdown from Todoist changes:

```bash
md2do todoist sync --direction pull
```

### Push

Update Todoist from markdown changes:

```bash
md2do todoist sync --direction push
```

## Examples

```bash
# Dry run to see what would change
md2do todoist sync --dry-run

# Pull updates from Todoist
md2do todoist sync --direction pull

# Push markdown changes to Todoist
md2do todoist sync --direction push

# Sync specific directory
md2do todoist sync --path ./work-notes

# Full sync with preview
md2do todoist sync --dry-run
md2do todoist sync
```

## How It Works

1. Scans markdown files for tasks with `[todoist:ID]` markers
2. Queries Todoist for those tasks
3. Compares and identifies changes
4. Applies updates based on sync direction

## Related

- [Todoist Integration](/integrations/todoist) - Complete guide
- [Todoist Import](/cli/todoist/import) - Import individual tasks
- [Todoist Commands](/cli/todoist/overview) - All todoist commands
