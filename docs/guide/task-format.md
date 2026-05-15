# Task Format

md2do uses standard markdown task syntax with optional metadata for rich task management.

::: tip Validation Warnings
md2do validates your task syntax and shows helpful warnings for common formatting issues. See [Warning Configuration](/guide/configuration#warning-settings) to customize validation behavior.
:::

## Basic Tasks

The simplest task format:

```markdown
- [ ] Incomplete task
- [x] Completed task
```

md2do recognizes any markdown checkbox as a task.

**Important:** Use dashes (`-`) for task list bullets. Asterisks (`*`) and plus signs (`+`) will trigger a validation warning.

## Task Metadata

Enhance tasks with metadata using inline annotations:

### Assignees

Assign tasks to people using `@username`:

```markdown
- [ ] Review pull request @alice
- [ ] Update documentation @bob
```

### Priorities

Mark task priority with exclamation marks:

```markdown
- [ ] Critical bug fix !!! # Urgent (priority 4)
- [ ] Important feature !! # High (priority 3)
- [ ] Regular task ! # Normal (priority 2)
- [ ] Nice to have # Low (priority 1, default)
```

**Priority Levels:**

- `!!!` - **Urgent** (do immediately)
- `!!` - **High** (do soon)
- `!` - **Normal** (regular priority)
- No marker - **Low** (when you get to it)

### Tags

Organize with hashtags:

```markdown
- [ ] Fix login bug #backend #security
- [ ] Design mockups #frontend #ui
```

### Due Dates

Add deadlines using the `#due:` tag syntax:

```markdown
- [ ] Submit proposal #due:2026-01-25
- [ ] Team meeting prep #due:2026-01-20
```

::: tip Supported Format
The new `#due:` syntax accepts **ISO dates only** (YYYY-MM-DD), with no space after the colon:

```markdown
- [ ] Task with due date #due:2026-01-25
```

Relative dates (`today`, `tomorrow`, `next week`, `next month`), time components (`14:30`), and short date formats (`1/25/26`) are **not supported** in the new syntax. These are recognized only in the legacy `[due: ...]` bracket syntax for backward compatibility.
:::

::: details Legacy Syntax (Backward Compatible)
md2do still parses the older bracket-based due date syntax during the transition period:

```markdown
- [ ] Task [due: 2026-01-25] # ISO date
- [ ] Task [due: 2026-01-25 14:30] # With time (time is ignored)
- [ ] Task [due: 1/25/26] # Short format
- [ ] Task [due: today] # Relative date
- [ ] Task [due: tomorrow] # Relative date
- [ ] Task [due: next week] # Relative date
- [ ] Task [due: next month] # Relative date
```

Both `[due: ...]` (with space) and `[due:...]` (without space) are accepted. Use `md2do migrate` to convert legacy syntax to the new format.
:::

### Completion Dates

When a task is completed, md2do tracks the completion date using `{completed:}` brace syntax:

```markdown
- [x] Finished report {completed:2026-01-20}
```

::: details Legacy Syntax (Backward Compatible)
The older bracket syntax is still parsed:

```markdown
- [x] Finished report [completed: 2026-01-20]
```

:::

### Todoist Integration

When syncing with [Todoist](https://www.todoist.com), md2do links tasks using `{todoist:}` brace syntax:

```markdown
- [ ] Review pull request #due:2026-01-25 {todoist:123456789}
```

The `{todoist:ID}` marker links the task to Todoist for sync.

::: details Legacy Syntax (Backward Compatible)
The older bracket syntax is still parsed:

```markdown
- [ ] Review pull request [todoist: 123456789]
```

:::

## Complete Example

Combine all metadata:

```markdown
- [ ] API authentication audit @alice !!! #backend #security #due:2026-01-25
```

This task:

- Assigned to **alice**
- **Urgent** priority
- Tagged with **backend** and **security**
- Due **January 25, 2026**

## File Structure as Projects

Organize tasks in files and folders:

```
projects/
  acme-corp/
    roadmap.md       # Project: acme-corp
    bugs.md
  internal/
    team-ops.md      # Project: internal

1-1s/
  alice.md           # Person: alice
  bob.md             # Person: bob
```

md2do automatically extracts:

- **Projects** from directory names
- **People** from file names in 1-1 directories

## Parsing Rules

md2do recognizes metadata in this order on each line:

1. **Checkbox**: `- [ ]` or `- [x]`
2. **Text**: The main task description
3. **Assignee**: `@username` (first match)
4. **Priority**: `!`, `!!`, or `!!!` (first match)
5. **Tags**: All `#hashtags` found
6. **Due date**: `#due:YYYY-MM-DD` tag syntax
7. **Completion date**: `{completed:YYYY-MM-DD}` (if checked)
8. **Todoist ID**: `{todoist:ID}` (if present)

Both new and legacy syntax are parsed during the transition period. See [Syntax Migration](#syntax-migration) for details.

**Example parsing:**

```markdown
- [ ] Fix bug @nick !!! #backend #urgent #due:2026-01-25 {todoist:123}
```

Extracts:

- Text: `"Fix bug"`
- Assignee: `"nick"`
- Priority: `"urgent"`
- Tags: `["backend", "urgent"]`
- Due: `2026-01-25`
- Todoist ID: `"123"`

## Syntax Migration

md2do has migrated from bracket syntax to a hybrid tag/brace syntax. Both old and new syntax are parsed during the transition, but the new syntax is recommended for all new tasks.

| Metadata   | New Syntax               | Legacy Syntax             |
| ---------- | ------------------------ | ------------------------- |
| Due date   | `#due:2026-01-25`        | `[due: 2026-01-25]`       |
| Completion | `{completed:2026-01-25}` | `[completed: 2026-01-25]` |
| Todoist ID | `{todoist:123}`          | `[todoist: 123]`          |

**What changed:**

- **Due dates** use the `#due:` tag prefix (no space after the colon). This integrates naturally with the existing `#tag` syntax.
- **Completion dates** and **Todoist IDs** use `{braces}` (no space after the colon). Braces indicate system-managed metadata that users typically don't edit by hand.
- **Relative dates** (`today`, `tomorrow`, `next week`, `next month`), **time components** (`14:30`), and **short date formats** (`1/25/26`) are legacy-only and not supported in the new syntax.

**Migrating existing files:**

Use the CLI migration command to convert legacy syntax automatically:

```bash
md2do migrate --path ./my-notes        # convert in place
md2do migrate --path ./my-notes --dry-run  # preview changes
```

## Best Practices

### Keep It Simple

Start with basic checkboxes, add metadata as needed:

```markdown
- [ ] Basic task
- [ ] Important task !!
- [ ] Assigned task @alice
```

### Be Consistent

Use consistent naming:

```markdown
Good - consistent naming

- [ ] Task 1 @alice
- [ ] Task 2 @alice
- [ ] Task 3 @bob

Avoid - inconsistent naming

- [ ] Task 1 @alice
- [ ] Task 2 @Alice
- [ ] Task 3 @ALICE
```

### Use Tags Strategically

Create a simple tag taxonomy:

```markdown
# Type tags

#bug #feature #docs #refactor

# Area tags

#frontend #backend #api #database

# Status tags (if not using checkboxes)

#blocked #in-review #ready
```

### Date Format

Use the `#due:` syntax with ISO dates:

```markdown
Correct

- [ ] Meeting #due:2026-01-25

Wrong

- [ ] Meeting (2026-01-25)
- [ ] Meeting 2026-01-25
- [ ] Meeting Jan 25
```

## Next Steps

- [Filtering & Sorting](/guide/filtering) - Query your tasks
- [Configuration](/guide/configuration) - Customize md2do
- [Todoist Integration](/integrations/todoist) - Sync with Todoist
- [Examples](/guide/examples) - Real-world usage patterns
