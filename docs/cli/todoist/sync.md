# todoist sync

Sync completion status from [Todoist](https://www.todoist.com) to markdown.

## Usage

```bash
md2do todoist sync [options]
```

## Options

- `--dry-run` - Preview changes without applying them
- `--direction <mode>` - Sync direction: `pull` (default)
- `--path <dir>` - Directory to sync (default: current directory)

::: info Current Implementation
md2do currently supports **one-way sync** (Todoist → markdown only). This updates completion status and metadata in your markdown files based on changes in Todoist.

**Coming Soon:** Push sync (markdown → Todoist) for bidirectional updates is planned for a future release.
:::

## Sync Mode

### Pull (Current)

Update markdown from Todoist changes:

```bash
md2do todoist sync --direction pull
# or simply
md2do todoist sync
```

## Examples

```bash
# Dry run to see what would change
md2do todoist sync --dry-run

# Pull updates from Todoist
md2do todoist sync --direction pull

# Sync specific directory
md2do todoist sync --path ./work-notes

# Preview then apply
md2do todoist sync --dry-run
md2do todoist sync
```

## How It Works

1. Scans markdown files for tasks with `[todoist:ID]` markers
2. Queries Todoist API for those tasks
3. Compares completion status and metadata
4. Updates markdown files with changes from Todoist

## Related

- [Todoist Integration](/integrations/todoist) - Complete guide
- [Todoist Import](/cli/todoist/import) - Import individual tasks
- [Todoist Commands](/cli/todoist/overview) - All todoist commands
