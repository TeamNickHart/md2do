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

### Warning Options

- `--no-warnings` - Hide all validation warnings
- `--all-warnings` - Show all warnings (default shows first 5)

By default, `md2do list` shows the first 5 warnings encountered during scanning. Warnings help identify formatting issues in your markdown task syntax.

Configure warning behavior via `.md2do.json` (see [Configuration](/guide/configuration#warning-settings)).

## Examples

### Basic Usage

```bash
# All incomplete tasks
md2do list

# Urgent tasks for @alice
md2do list --assignee alice --priority urgent

# Overdue backend work
md2do list --tag backend --overdue --sort priority
```

### Warning Examples

```bash
# Hide all warnings
md2do list --no-warnings

# Show all warnings (not just first 5)
md2do list --all-warnings

# Warnings appear at the bottom of output:
# ⚠️  3 warnings encountered during scanning
#   tasks.md:12 - Unsupported bullet marker (* or +). Use dash (-) for task lists.
#   tasks.md:15 - Missing space after checkbox. Use "- [x] Task" format.
#   tasks.md:23 - Missing space before checkbox. Use "- [x] Task" format.
```

### Output Formatting

```bash
# Pretty format (default)
md2do list --format pretty

# Table format
md2do list --format table

# JSON for scripting
md2do list --format json

# Disable colors
md2do list --no-colors

# Hide file paths
md2do list --no-paths

# Show context (project, person, heading)
md2do list --context
```

## Common Warning Issues

### Unsupported Bullet Markers

**Problem:**

```markdown
- [ ] Task using asterisk

* [ ] Task using plus
```

**Solution:**

```markdown
- [ ] Task using dash (correct)
```

### Missing Spaces

**Problem:**

```markdown
- [ ]Task without space after checkbox -[x] Task without space before checkbox
```

**Solution:**

```markdown
- [ ] Task with proper spacing
- [x] Task with proper spacing
```

### Malformed Checkboxes

**Problem:**

```markdown
- [x ] Extra space inside checkbox
- [ x] Extra space inside checkbox
```

**Solution:**

```markdown
- [x] Correct checkbox format
- [ ] Correct checkbox format
```

## Related

- [Configuration](/guide/configuration#warning-settings) - Configure warning behavior
- [Filtering Guide](/guide/filtering) - Advanced filtering techniques
- [CLI Overview](/cli/overview) - All commands
- [Task Format](/guide/task-format) - Proper task syntax
