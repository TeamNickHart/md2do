# md2do stats

Show aggregated task statistics.

## Usage

```bash
md2do stats [options]
```

## Description

The `stats` command provides summaries and breakdowns of your tasks. Group by assignee, project, priority, or tags to understand your task distribution.

## Options

See [CLI Overview](/cli/overview#stats) for complete options and examples.

## Examples

```bash
# Overall statistics
md2do stats

# Breakdown by assignee
md2do stats --by assignee

# Priority distribution for backend tasks
md2do stats --tag backend --by priority
```

## Related

- [CLI Overview](/cli/overview) - All commands
- [Examples](/guide/examples) - Real-world usage
