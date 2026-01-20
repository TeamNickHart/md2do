# md2do list

List and filter tasks from markdown files.

## Usage

```bash
md2do list [options]
```

## Description

The `list` command scans markdown files and displays tasks matching your filters. It's the primary way to query your tasks.

## Options

See [CLI Overview](/cli/overview#list) for complete options and examples.

## Examples

```bash
# All incomplete tasks
md2do list

# Urgent tasks for @alice
md2do list --assignee alice --priority urgent

# Overdue backend work
md2do list --tag backend --overdue --sort priority
```

## Related

- [Filtering Guide](/guide/filtering) - Advanced filtering techniques
- [CLI Overview](/cli/overview) - All commands
