# Documentation vs Implementation Gap Analysis

**Analysis Date:** 2026-01-26
**Scope:** `md2do list` command filtering features

---

## Summary

The filtering guide (`docs/guide/filtering.md`) documents several features that are **not yet implemented** in the CLI. This creates user confusion when documented commands don't work.

**Status Breakdown:**

- ✅ **14 features** working as documented
- ❌ **5 feature categories** documented but not implemented
- 🟡 **3 features** already marked "coming soon"

---

## ✅ Working Features (Implemented)

These features work exactly as documented:

| Feature            | Example                                | Status     |
| ------------------ | -------------------------------------- | ---------- |
| Completion filters | `--completed`, `--incomplete`, `--all` | ✅ Working |
| Single assignee    | `--assignee alice`                     | ✅ Working |
| Single priority    | `--priority urgent`                    | ✅ Working |
| Single tag         | `--tag backend`                        | ✅ Working |
| Single project     | `--project acme-corp`                  | ✅ Working |
| Person filter      | `--person alice`                       | ✅ Working |
| Overdue filter     | `--overdue`                            | ✅ Working |
| Due today          | `--due-today`                          | ✅ Working |
| Due this week      | `--due-this-week`                      | ✅ Working |
| Due within N days  | `--due-within 7`                       | ✅ Working |
| Single sort field  | `--sort priority`                      | ✅ Working |
| Reverse sort       | `--reverse`                            | ✅ Working |
| Output formats     | `--format pretty/table/json`           | ✅ Working |
| Combining filters  | Multiple `--tag` flags, etc.           | ✅ Working |

---

## ❌ Documented But NOT Implemented

These features are documented as if they work, but they don't:

### 1. Multiple Value Filters (Comma-Separated)

**Location:** `docs/guide/filtering.md`

**Documented Examples:**

```bash
# Multiple assignees
md2do list --assignee alice,bob         # Line 27 ❌

# Multiple priorities
md2do list --priority high,urgent        # Line 40 ❌

# Multiple tags (OR logic)
md2do list --tag backend,frontend        # Line 55 ❌

# Multiple projects
md2do list --project acme-corp,internal  # Line 68 ❌
```

**Reality:** CLI only accepts single values. Passing `alice,bob` would try to filter for an assignee literally named "alice,bob".

**Core Support:** `combineFiltersOr()` exists in core but CLI doesn't use it.

**Priority:** 🔴 **P0 - High Impact** (appears in 4 different documented sections)

---

### 2. Negative Filters

**Location:** `docs/guide/filtering.md:30`

**Documented Example:**

```bash
# Unassigned tasks
md2do list --no-assignee  # ❌
```

**Reality:** No `--no-assignee` option exists in CLI. Help output doesn't list it.

**Core Support:** `not()` function exists in core but CLI doesn't expose it.

**Priority:** 🔴 **P0 - High Impact** (common use case)

**Related:** Docs also mention future `--not-priority`, `--not-tag` (lines 305-315) which ARE correctly marked as "Coming soon" ✅

---

### 3. Date Range Filters

**Location:** `docs/guide/filtering.md:95-106`

**Documented Examples:**

```bash
# Due before specific date
md2do list --due-before 2026-02-01  # ❌

# Due after specific date
md2do list --due-after 2026-01-20   # ❌

# Date range (combining both)
md2do list --due-after 2026-01-20 --due-before 2026-02-01  # ❌
```

**Reality:** These options don't exist in CLI help or implementation.

**Core Support:** Would need new filter functions (easy to add).

**Priority:** 🔴 **P0 - High Impact** (critical for sprint planning)

---

### 4. Result Limiting

**Location:** `docs/guide/filtering.md:169-174`

**Documented Examples:**

```bash
# Show only first 10 tasks
md2do list --limit 10  # ❌

# Top 5 urgent tasks
md2do list --priority urgent --sort due --limit 5  # ❌
```

**Reality:** No `--limit` option in CLI.

**Core Support:** N/A (would be implemented in CLI output layer).

**Priority:** 🟡 **P1 - Medium Impact** (nice to have, not critical)

---

### 5. JSON Pretty Printing

**Location:** `docs/guide/filtering.md:186`

**Documented Example:**

```bash
# JSON with pretty printing
md2do list --format json --pretty  # ❌ (--pretty doesn't exist)
```

**Reality:** No `--pretty` flag exists. `--format json` always outputs pretty-printed JSON anyway.

**Priority:** 🟢 **P2 - Low Impact** (output is already pretty, just wrong docs)

---

## 🟡 Correctly Marked "Coming Soon"

These features are properly documented as future features:

| Feature                     | Location     | Status              |
| --------------------------- | ------------ | ------------------- |
| Multiple sort keys          | Line 156-162 | ✅ Correctly marked |
| Filter negation (`--not-*`) | Line 305-315 | ✅ Correctly marked |
| Text search (`--search`)    | Line 317-327 | ✅ Correctly marked |

---

## Impact on User Experience

### Example from Docs (Doesn't Work):

```bash
# From line 260-266 "Focus Mode" example
md2do list \
  --assignee nick \
  --priority urgent,high \    # ❌ Doesn't work (comma-separated)
  --due-today \
  --sort priority \
  --limit 5                   # ❌ Doesn't work (no --limit)
```

**User expectation:** Copy/paste this example → it works
**Reality:** Only 3 of 5 flags actually work

### Common Workflow Examples That Fail:

From line 117:

```bash
# Overdue high-priority tasks
md2do list --overdue --priority high,urgent  # ❌ Comma-separated fails
```

From line 228:

```bash
# Critical bugs to fix
md2do list --tag bug --priority urgent,high --incomplete --sort due  # ❌ Fails
```

**Result:** Users lose trust in documentation, file bug reports, get frustrated.

---

## Recommendation: Mark Unimplemented Features

### Strategy 1: "Coming Soon" Badges (Recommended)

Update `docs/guide/filtering.md` to add badges/notices for unimplemented features:

````markdown
### By Assignee

```bash
# Tasks assigned to alice
md2do list --assignee alice

# Multiple assignees ⚠️ Coming soon in v0.3.0
md2do list --assignee alice,bob

# Unassigned tasks ⚠️ Coming soon in v0.3.0
md2do list --no-assignee
```
````

**Pros:**

- Shows roadmap/vision
- Sets correct expectations
- Keeps examples for future reference

**Cons:**

- Requires maintaining badges
- Docs become slightly cluttered

---

### Strategy 2: Move to Separate "Roadmap" Section

Create `docs/guide/filtering-roadmap.md` and move all unimplemented features there.

**Pros:**

- Clean separation of working vs planned
- Easy to maintain
- Clear user expectations

**Cons:**

- Loses context (harder to see what's possible)
- Duplicate content

---

### Strategy 3: Implement the Features (Best Long-term)

All 5 missing feature categories are feasible to implement:

| Feature          | Effort | Core Support              |
| ---------------- | ------ | ------------------------- |
| Multiple values  | Medium | `combineFiltersOr` exists |
| Negative filters | Small  | `not()` exists            |
| Date ranges      | Small  | Easy to add               |
| Limit            | Small  | Trivial (slice results)   |
| JSON pretty flag | Small  | Already pretty by default |

**Total effort:** ~1-2 days of development + testing

---

## Proposed Action Plan

### Phase 1: Documentation Fixes (Immediate)

1. Add "⚠️ Coming soon" badges to all unimplemented features in `filtering.md`
2. Update examples to only use working features
3. Create working "Quick Start" examples at top of page
4. Move aspirational examples to bottom under "Roadmap" heading

### Phase 2: Implementation (Sprint 1)

From `URGENT-BUGS.md`, implement in priority order:

1. ✅ Multiple value filters (P0)
2. ✅ Negative filters (P0)
3. ✅ Date range filtering (P0)
4. ✅ Result limiting (P1)
5. ✅ Fix JSON pretty printing docs (P2)

### Phase 3: Verification (Post-implementation)

1. Remove all "⚠️ Coming soon" badges
2. Verify all examples work via E2E tests
3. Update website deployment

---

## Files to Update

1. **`docs/guide/filtering.md`** - Add "coming soon" badges, fix examples
2. **`docs/cli/list.md`** - Minimal changes (just references filtering.md)
3. **`URGENT-BUGS.md`** - Cross-reference this analysis
4. **`README.md`** - Ensure roadmap is accurate

---

## Related Issues

- See `URGENT-BUGS.md` for full bug tracking
- See `README.md` roadmap for planned features
- See `blog-post-examples.md` - verify all examples use working features only

---

**Next Steps:**

1. Choose documentation strategy (badges vs separate section)
2. Update docs to reflect current implementation
3. Plan implementation sprint for missing features
