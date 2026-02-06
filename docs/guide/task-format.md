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

Add deadlines using the `[due: ...]` format:

**Absolute Dates:**

```markdown
- [ ] Submit proposal [due: 2026-01-25]
- [ ] Team meeting prep [due: 2026-01-20]
- [ ] Afternoon meeting [due: 2026-01-20 14:30]
- [ ] Quick format [due: 1/25/26]
```

**Relative Dates:**

```markdown
- [ ] Review PR [due: today]
- [ ] Follow up [due: tomorrow]
- [ ] Sprint planning [due: next week]
- [ ] Quarterly review [due: next month]
```

::: tip Supported Formats

- `[due: 2026-01-25]` - ISO format (YYYY-MM-DD)
- `[due: 2026-01-25 14:30]` - With time (24-hour format)
- `[due: 1/25/26]` or `[due: 1/25]` - Short format (M/D/YY or M/D)
- `[due: today]`, `[due: tomorrow]` - Relative dates
- `[due: next week]`, `[due: next month]` - Future dates
  :::

::: warning Important
The parentheses syntax `(2026-01-25)` is **not** supported. Always use brackets: `[due: 2026-01-25]`
:::

## Complete Example

Combine all metadata:

```markdown
- [ ] API authentication audit @alice !!! #backend #security [due: 2026-01-25]
```

This task:

- Assigned to **alice**
- **Urgent** priority
- Tagged with **backend** and **security**
- Due **January 25, 2026**

## Todoist Integration

When syncing with Todoist, md2do adds task IDs:

```markdown
- [ ] Review pull request [due: 2026-01-25] [todoist:123456789]
```

The `[todoist:ID]` marker links the task to Todoist for bidirectional sync.

## Headings as Context

md2do extracts context from markdown headings:

```markdown
## Sprint 24

- [ ] Implement dark mode @bob !! #frontend [due: 2026-02-01]
- [ ] Database migration @alice !!! #backend [due: 2026-01-28]

## Bugs

- [ ] Fix navbar on mobile @bob ! #ui [due: 2026-01-26]
```

Tasks inherit their heading as context for filtering.

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
6. **Due date**: `[due: YYYY-MM-DD]` format
7. **Completion date**: `[completed: YYYY-MM-DD]` (if checked)
8. **Todoist ID**: `[todoist:ID]` (if present)

**Example parsing:**

```markdown
- [ ] Fix bug @nick !!! #backend #urgent [due: 2026-01-25] [todoist:123]
```

Extracts:

- Text: `"Fix bug"`
- Assignee: `"nick"`
- Priority: `"urgent"`
- Tags: `["backend", "urgent"]`
- Due: `2026-01-25`
- Todoist ID: `"123"`

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
✅ Good - consistent naming

- [ ] Task 1 @alice
- [ ] Task 2 @alice
- [ ] Task 3 @bob

❌ Avoid - inconsistent naming

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

Use the `[due: ...]` format with supported date styles:

```markdown
✅ Correct

- [ ] Meeting [due: 2026-01-25]
- [ ] Meeting [due: 1/25/26]
- [ ] Meeting [due: tomorrow]

❌ Wrong

- [ ] Meeting (2026-01-25)
- [ ] Meeting 2026-01-25
- [ ] Meeting Jan 25
```

## Next Steps

- [Filtering & Sorting](/guide/filtering) - Query your tasks
- [Configuration](/guide/configuration) - Customize md2do
- [Todoist Integration](/integrations/todoist) - Sync with Todoist
- [Examples](/guide/examples) - Real-world usage patterns
