# 🚨 URGENT BUGS - Priority Fixes Needed

These issues are blocking documented features and need immediate attention.

**📋 See also:** `DOCS-VS-IMPLEMENTATION.md` for full documentation audit and gap analysis

## Status: 🔴 Critical

---

## 1. Missing Filter Support

### `--no-assignee` Filter Not Working

**Status:** 🔴 Broken
**Documented:** Yes
**Command:** `md2do list --no-assignee`
**Expected:** Show tasks without an assignee
**Actual:** Unknown (likely not implemented or broken)
**Impact:** HIGH - Common use case for finding unassigned work

**Related:**

- Should also support `--no-priority`, `--no-tags`, `--no-project`, etc.

---

### Multiple Value Filters Not Working

**Status:** 🔴 Broken
**Documented:** Yes (possibly)
**Commands:**

```bash
md2do list --priority high,urgent
md2do list --tag backend,frontend
```

**Expected:** OR logic - show tasks matching ANY of the values
**Actual:** Unknown (likely not parsing comma-separated values)
**Impact:** HIGH - Common use case for viewing multiple categories

**Examples:**

- `--priority high,urgent` → Show high OR urgent tasks
- `--tag backend,frontend` → Show tasks tagged with backend OR frontend
- `--assignee nick,jane` → Show Nick's OR Jane's tasks

---

## 2. Date Filter Issues

### All Due Date Filters Broken

**Status:** 🔴 Broken
**Documentation:** https://md2do.com/guide/filtering.html#due-date-filters
**Impact:** HIGH - Core filtering feature

**Broken Filters:**

- `--overdue`
- `--due-today`
- `--due-this-week`
- `--due-within <days>`

**Investigation Needed:**

- Are these implemented?
- Is date comparison logic broken?
- Timezone issues?

---

### Date Range Filtering Not Working

**Status:** 🔴 Broken
**Documented:** Likely yes
**Commands:**

```bash
md2do list --due-after 2026-01-20
md2do list --due-before 2026-02-01
md2do list --due-after 2026-01-20 --due-before 2026-02-01
```

**Expected:** Filter tasks by date range
**Actual:** Unknown (likely not implemented)
**Impact:** HIGH - Critical for sprint planning, deadline tracking

---

## 3. Missing CLI Features

### Result Limiting Not Working

**Status:** 🔴 Broken
**Command:** `md2do list --limit 10`
**Expected:** Show only first 10 results
**Actual:** Unknown (likely not implemented)
**Impact:** MEDIUM - Useful for quick checks, performance

---

### Config Inspection Not Working

**Status:** 🔴 Broken
**Command:** `md2do config show`
**Expected:** Display current configuration (merged from all sources)
**Actual:** Unknown (likely not implemented)
**Impact:** MEDIUM - Debugging, documentation

**Should Show:**

- Final merged config
- Sources (default, global, project, env vars)
- Which config file(s) are being used

---

## 4. Output Format Issues

### JSON Pretty Printing Confusion

**Status:** 🟡 Unclear Behavior
**Commands:**

```bash
md2do list --format json --pretty
md2do list --json  # Does this make it pretty automatically?
```

**Issue:**

- `--pretty` not documented as an option for JSON format
- Unclear if `--json` is a shorthand that auto-prettifies
- Need to clarify behavior and documentation

**Expected Behavior:**

- `--format json` → Compact JSON (one line)
- `--format json --pretty` → Pretty-printed JSON with indentation
- OR: `--json` as shorthand for `--format json --pretty`

---

### Markdown Output Format Missing

**Status:** 🟡 Not Implemented
**Command:** `md2do list --format markdown`
**Expected:** Output results as markdown
**Actual:** Not implemented
**Impact:** MEDIUM - Useful for documentation, copy/paste

**Use Cases:**

- Copy filtered tasks to another markdown file
- Generate reports
- Documentation

**Suggested Format:**

```markdown
# Tasks (15 found)

## Urgent Priority

- [ ] Fix memory leak in WebSocket connection @nick #bug #critical (2026-01-18)
  - File: `projects/acme-app/bugs.md:7`
  - Project: acme-app

- [ ] Implement user authentication API @nick #backend #auth (2026-01-20)
  - File: `projects/acme-app/sprint-planning.md:9`
  - Project: acme-app
```

---

## 5. Testing & Development

### Date Simulation for E2E Tests

**Status:** 🟡 Not Implemented
**Command:** `md2do list --simulate-date 2026-01-20`
**Purpose:** Set "current date" for deterministic E2E tests
**Impact:** MEDIUM - Critical for reliable testing

**Why Needed:**

- Date-based filters (`--overdue`, `--due-today`) depend on "now"
- E2E tests fail randomly as dates change
- Can't have consistent test snapshots

**Implementation:**

- Internal flag (not in help text)
- Overrides `new Date()` throughout codebase
- Used in test scripts only

---

## 6. Date Format Support Questions

### Time of Day in Due Dates

**Status:** ❓ Unclear
**Observed:** Example with `(9am)` exists
**Question:** Is this supported?

**Examples Seen:**

- `(9am)` - Is this parsed?
- `(2pm)` - Does this work?
- `(2026-01-25 9am)` - Combined date + time?

**Need to Verify:**

- Is time-of-day parsing implemented?
- If yes, how is it used? (sorting, filtering, display)
- If no, should we remove the example?

---

## 7. Warnings Configuration

### Warnings Too Noisy by Default

**Status:** 🟡 UX Issue
**Problem:** 206 warnings shown by default in examples
**Impact:** MEDIUM - Clutters output, discourages usage

**Current Behavior:**

```
⚠️  206 warnings encountered during scanning
  1-1s/jane.md:7 - Completed task missing completion date...
  ... and 201 more warnings (use --all-warnings to see all)
```

**Proposed:**

- Warnings OFF by default
- Opt-in via `--warnings` flag or config
- Or: Only show warnings when `--strict` mode enabled
- Or: Reduce warning severity (many are too pedantic)

**Specific Issues:**

- "Completed task missing completion date" - too strict?
- Should warnings only appear with `--lint` or similar flag?

---

## Priority Matrix

| Priority | Count | Description                       |
| -------- | ----- | --------------------------------- |
| 🔴 P0    | 5     | Broken documented features        |
| 🟡 P1    | 4     | Missing features, UX issues       |
| ❓ P2    | 1     | Needs investigation/clarification |

---

## Recommended Fix Order

### Sprint 1: Core Filtering (P0)

1. Fix all due date filters (`--overdue`, `--due-today`, etc.)
2. Implement multiple value filters (`--priority high,urgent`)
3. Implement negative filters (`--no-assignee`)
4. Add date range filtering (`--due-after`, `--due-before`)

### Sprint 2: CLI Polish (P0/P1)

5. Implement `--limit` functionality
6. Implement `md2do config show`
7. Clarify/fix JSON pretty printing behavior
8. Add `--simulate-date` for testing

### Sprint 3: Quality of Life (P1/P2)

9. Implement `--format markdown` output
10. Make warnings opt-in or reduce noise
11. Document/verify time-of-day date support
12. Add `--fix` flag for auto-fixing warnings

---

## Testing Checklist

After fixes, verify:

- [ ] All filters in docs work as documented
- [ ] Multiple value filters work with OR logic
- [ ] Negative filters work correctly
- [ ] Date filters respect timezone/current date
- [ ] E2E tests pass with `--simulate-date`
- [ ] Config command shows merged configuration
- [ ] All output formats work as expected
- [ ] Warnings can be controlled/disabled

---

## Documentation Updates Needed

After fixes:

- [ ] Update CLI reference with all working filters
- [ ] Document multiple value syntax (comma-separated)
- [ ] Document negative filter syntax (`--no-*`)
- [ ] Add examples of date range filtering
- [ ] Clarify JSON formatting options
- [ ] Add markdown output format examples
- [ ] Document `--simulate-date` (in testing docs only)
- [ ] Update filtering guide with all working examples

---

**Last Updated:** 2026-01-26
**Next Review:** After Sprint 1 fixes
