# Test Cases

This directory contains comprehensive test cases for validating all documented features of md2do.

## Overview

These markdown files serve dual purposes:

1. **Example files** demonstrating various md2do features
2. **Test fixtures** for automated E2E testing

## Test Files

### `date-filtering.md`

Tests date-based filtering functionality:

- Overdue tasks (before today)
- Due today tasks
- Due this week tasks
- Due next week tasks
- Future dated tasks
- Tasks without due dates

**Features Tested:**

- `--overdue` flag
- `--due-today` flag
- `--due-this-week` flag
- Date parsing (YYYY-MM-DD format)

### `priorities.md`

Tests all priority levels and combinations:

- Urgent (!!!) with various metadata
- High (!!) with various metadata
- Normal (!) with various metadata
- Low (no marker) with various metadata

**Features Tested:**

- `--priority urgent` filter
- `--priority high` filter
- `--priority normal` filter
- Priority parsing in task text
- Completion status with priorities

### `assignees.md`

Tests assignee-based filtering:

- Tasks assigned to specific users (@alice, @bob, @charlie)
- Unassigned tasks (no @assignee)
- Multiple tags per assignee
- Completed tasks with assignees

**Features Tested:**

- `--assignee <name>` filter
- `@username` parsing
- Assignee + other metadata combinations

### `todoist-sync.md`

Tests Todoist integration markers:

- Tasks with Todoist IDs `[todoist:123]`
- Tasks pending sync
- Various ID formats (short, long, medium)
- Mixed sync status

**Features Tested:**

- Todoist ID parsing
- Sync marker preservation
- Integration workflows

### `tags.md`

Tests tag-based filtering:

- Single tag filtering
- Multiple tag filtering
- Tag combinations
- Various tag categories (backend, frontend, bug, feature, docs, testing)

**Features Tested:**

- `--tag <tag>` filter
- `#hashtag` parsing
- Multiple tags per task
- Tag + other filter combinations

### `edge-cases.md`

Tests edge cases and special scenarios:

- Special characters in task text (parentheses, brackets, quotes)
- Very long task descriptions
- URLs and file paths in tasks
- Code references with backticks
- Empty or minimal tasks
- Tasks with emoji
- Nested list tasks
- Mixed completion status

**Features Tested:**

- Parser robustness
- Special character handling
- Long text wrapping
- Unusual formatting

## Running Tests

### Run All E2E Tests

```bash
pnpm test:e2e
```

### Run Example Validation

```bash
pnpm test:examples
```

### Test Specific Features

Test date filtering:

```bash
pnpm cli -- list --path examples/test-cases/date-filtering.md --overdue
pnpm cli -- list --path examples/test-cases/date-filtering.md --due-today
```

Test priorities:

```bash
pnpm cli -- list --path examples/test-cases/priorities.md --priority urgent
pnpm cli -- list --path examples/test-cases/priorities.md --priority high
```

Test assignees:

```bash
pnpm cli -- list --path examples/test-cases/assignees.md --assignee alice
pnpm cli -- list --path examples/test-cases/assignees.md --assignee bob
```

Test tags:

```bash
pnpm cli -- list --path examples/test-cases/tags.md --tag backend
pnpm cli -- list --path examples/test-cases/tags.md --tag bug
```

## Coverage Matrix

| Feature            | File                | Command Example                               |
| ------------------ | ------------------- | --------------------------------------------- |
| Date filtering     | `date-filtering.md` | `--overdue`, `--due-today`, `--due-this-week` |
| Priority levels    | `priorities.md`     | `--priority urgent\|high\|normal\|low`        |
| Assignee filtering | `assignees.md`      | `--assignee alice`                            |
| Tag filtering      | `tags.md`           | `--tag backend`                               |
| Todoist sync       | `todoist-sync.md`   | Check `[todoist:ID]` markers                  |
| Edge cases         | `edge-cases.md`     | Various special scenarios                     |

## Adding New Test Cases

To add new test cases:

1. **Choose the appropriate file** based on the feature category
2. **Add tasks following the pattern:**
   ```markdown
   - [ ] Description of test case @assignee !! #tag (2026-01-20)
   ```
3. **Include edge cases** that might break the parser
4. **Document the expected behavior** in comments if needed
5. **Run tests** to validate: `pnpm test:e2e`

## Test Data Guidelines

### Dates

Use realistic dates relative to 2026-01-19 (current test date):

- **Overdue:** Before 2026-01-19
- **Due today:** 2026-01-19
- **Due this week:** 2026-01-19 to 2026-01-25
- **Future:** After 2026-01-26

### Assignees

Use consistent names across files:

- Primary: `alice`, `bob`, `charlie`
- Secondary: `dana`, `eve`, `frank`, `grace`, `henry`
- Test specific: `test`, `user`, `docs-team`

### Tags

Use semantic, consistent tags:

- **Type:** `#bug`, `#feature`, `#docs`, `#refactor`
- **Area:** `#backend`, `#frontend`, `#api`, `#database`
- **Priority:** `#critical`, `#urgent`, `#important`
- **Status:** `#blocked`, `#in-review`, `#ready`

### Priorities

- `!!!` - Urgent (use sparingly)
- `!!` - High (important work)
- `!` - Normal (regular tasks)
- (none) - Low (when time permits)

## Maintenance

These test files should be:

- ✅ Updated when new features are added
- ✅ Kept in sync with documentation
- ✅ Reviewed during PR reviews
- ✅ Used for regression testing

## See Also

- `/scripts/e2e-test.sh` - E2E test runner
- `/scripts/validate-examples.sh` - Example validator
- `/QA-REPORT.md` - Full QA report
- `/docs/` - Project documentation
