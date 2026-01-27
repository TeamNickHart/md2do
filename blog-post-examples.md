# Blog Post Examples - Ready to Use

## Example 1: Raw Markdown Files

### From `examples/projects/widget-co/roadmap.md`

```markdown
# Product Roadmap - Widget Co

## Q1 2026 Goals

### Analytics Dashboard

- [ ] Design dashboard wireframes @emma !!! #design #analytics (2026-01-25)
- [ ] Implement data visualization library @chris !! #frontend #charts (2026-01-28)
- [ ] Build backend aggregation service @mike !! #backend #analytics (2026-02-01)
- [ ] Add export to CSV functionality @chris ! #frontend (2026-02-05)
- [x] Research chart libraries @emma ! #research (2026-01-12)

### Mobile App

- [ ] Set up React Native project @lisa !!! #mobile (2026-01-22)
- [ ] Design mobile UI mockups @emma !! #design #mobile (2026-01-24)
- [ ] Implement authentication flow @lisa !! #mobile #auth (2026-01-27)
```

### From `examples/1-1s/nick.md`

```markdown
# 1-1: nick

## Meeting Notes - Jan 18, 2026

### Action Items

- [ ] Update team documentation @nick !! #docs (2026-01-20)
- [ ] Mentor junior developers on testing @nick ! #mentoring (2026-01-27)
- [ ] Review and approve PRs from team @nick #code-review (2026-01-19)

### Follow-ups

- [ ] Send feedback on new hire candidates @nick !! (2026-01-21)
- [ ] Plan Q2 technical roadmap @nick ! #planning (2026-02-15)
```

---

## Example 2: Filter by Project + Priority

**Command:**

```bash
md2do list --project acme-app --priority urgent
```

**Output:**

```
Found 6 tasks
  ✓ 1 completed | ○ 5 incomplete

  ○ !!! Fix memory leak in WebSocket connection (2026-01-18) @nick #bug #critical
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/bugs.md:7

  ○ !!! Resolve database connection timeout (2026-01-19) @jane #bug #database
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/bugs.md:8

  ✓ !!! Patch XSS vulnerability in search (2026-01-17) @alex #bug #security
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/bugs.md:9

  ○ !!! Implement user authentication API (2026-01-20) @nick #backend #auth
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/sprint-planning.md:9

  ○ !!! Design login/signup forms (2026-01-19) @sarah #frontend #ui
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/sprint-planning.md:17

  ○ !!! Set up staging environment (2026-01-18) @jane #devops #urgent
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/sprint-planning.md:26
```

**What Happened:**

- Scanned all markdown files in the examples directory
- Filtered to only tasks in the `acme-app` project (from folder structure)
- Further filtered to only `urgent` priority tasks (marked with `!!!`)
- Found 6 matching tasks across 2 different files
- Shows completion status, metadata, and clickable file links

---

## Example 3: Stats Grouped by Assignee

**Command:**

```bash
md2do stats --by assignee
```

**Output:**

```
Task Statistics by assignee
────────────────────────────────────────────────────────────

┌──────────────┬───────┬───────────┬────────────┬─────────┐
│ Assignee     │ Total │ Completed │ Incomplete │ Overdue │
├──────────────┼───────┼───────────┼────────────┼─────────┤
│ (unassigned) │ 73    │ 10        │ 63         │ 0       │
├──────────────┼───────┼───────────┼────────────┼─────────┤
│ alice        │ 27    │ 4         │ 23         │ 0       │
├──────────────┼───────┼───────────┼────────────┼─────────┤
│ jane         │ 19    │ 4         │ 15         │ 0       │
├──────────────┼───────┼───────────┼────────────┼─────────┤
│ nick         │ 19    │ 4         │ 15         │ 0       │
├──────────────┼───────┼───────────┼────────────┼─────────┤
│ bob          │ 19    │ 3         │ 16         │ 0       │
├──────────────┼───────┼───────────┼────────────┼─────────┤
│ sarah        │ 7     │ 2         │ 5          │ 0       │
├──────────────┼───────┼───────────┼────────────┼─────────┤
│ alex         │ 9     │ 1         │ 8          │ 0       │
└──────────────┴───────┴───────────┴────────────┴─────────┘
```

**What Happened:**

- Aggregated all tasks across all files
- Grouped by the `@assignee` field
- Calculated totals, completion counts, and overdue tasks
- Presented in a clean, readable table format
- Perfect for sprint planning or standup prep

---

## Example 4: Complex Multi-Filter Query

**Command:**

```bash
md2do list --assignee nick --sort priority --reverse
```

**Output:**

```
Found 19 tasks
  ✓ 4 completed | ○ 15 incomplete

  ○ !!! Fix memory leak in WebSocket connection (2026-01-18) @nick #bug #critical
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/bugs.md:7

  ○ !!! Implement user authentication API (2026-01-20) @nick #backend #auth
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/sprint-planning.md:9

  ○ !! Prepare tech talk on microservices (2026-01-25) @nick #presentation
    file:///Users/nickhart/Developer/TeamNickHart/md2do/1-1s/nick.md:9

  ○ !! Update team documentation (2026-01-20) @nick #docs
    file:///Users/nickhart/Developer/TeamNickHart/md2do/1-1s/nick.md:13

  ○ !! Send feedback on new hire candidates (2026-01-21) @nick
    file:///Users/nickhart/Developer/TeamNickHart/md2do/1-1s/nick.md:25

  ○ !! Configure monitoring and alerts (2026-01-23) @nick #devops #monitoring
    file:///Users/nickhart/Developer/TeamNickHart/md2do/projects/acme-app/sprint-planning.md:27

  ○ ! Schedule architecture review session (2026-01-22) @nick #meeting
    file:///Users/nickhart/Developer/TeamNickHart/md2do/1-1s/nick.md:8

  ○ ! Mentor junior developers on testing (2026-01-27) @nick #mentoring
    file:///Users/nickhart/Developer/TeamNickHart/md2do/1-1s/nick.md:14

  ○ Review and approve PRs from team (2026-01-19) @nick #code-review
    file:///Users/nickhart/Developer/TeamNickHart/md2do/1-1s/nick.md:15

  ○ Review team's sprint retrospective (2026-01-24) @nick
    file:///Users/nickhart/Developer/TeamNickHart/md2do/1-1s/nick.md:26

  ... (9 more tasks)
```

**What Happened:**

- Filtered to only Nick's tasks (`--assignee nick`)
- Sorted by priority (`--sort priority`)
- Reversed the order to show highest priority first (`--reverse`)
- Found 19 tasks across multiple files (1-1s, bugs, sprint planning)
- Instant overview of what needs attention

---

## Example 5: Table Format Output

**Command:**

```bash
md2do list --priority urgent --format table
```

**Output:**

```
┌────────┬──────────┬─────────────────────────────────────────────────────────┬──────────┬─────┬─────────────────────────┐
│ Status │ Priority │ Task                                                    │ Assignee │ Due │ File                    │
├────────┼──────────┼─────────────────────────────────────────────────────────┼──────────┼─────┼─────────────────────────┤
│ ○      │ !!!      │ Fix leaky faucet in bathroom (2026-01-19)               │          │     │ personal/home.md:5      │
├────────┼──────────┼─────────────────────────────────────────────────────────┼──────────┼─────┼─────────────────────────┤
│ ○      │ !!!      │ Plan birthday party for mom (2026-01-26)                │          │     │ personal/home.md:34     │
├────────┼──────────┼─────────────────────────────────────────────────────────┼──────────┼─────┼─────────────────────────┤
│ ○      │ !!!      │ Write article on TypeScript (2026-01-25)                │          │     │ personal/side-proj...   │
├────────┼──────────┼─────────────────────────────────────────────────────────┼──────────┼─────┼─────────────────────────┤
│ ○      │ !!!      │ Fix memory leak in WebSocket (2026-01-18)               │ @nick    │     │ projects/acme-app/bu... │
├────────┼──────────┼─────────────────────────────────────────────────────────┼──────────┼─────┼─────────────────────────┤
│ ○      │ !!!      │ Resolve database timeout (2026-01-19)                   │ @jane    │     │ projects/acme-app/bu... │
├────────┼──────────┼─────────────────────────────────────────────────────────┼──────────┼─────┼─────────────────────────┤
│ ✓      │ !!!      │ Patch XSS vulnerability (2026-01-17)                    │ @alex    │     │ projects/acme-app/bu... │
└────────┴──────────┴─────────────────────────────────────────────────────────┴──────────┴─────┴─────────────────────────┘
```

**What Happened:**

- Same data, different format
- Table format great for dense information
- Easy to scan columns
- Perfect for screenshots or documentation

---

## Example 6: JSON Format (for scripting)

**Command:**

```bash
md2do list --project widget-co --format json
```

**Output:**

```json
{
  "tasks": [
    {
      "id": "7fc2172d",
      "text": "Design dashboard wireframes (2026-01-25)",
      "completed": false,
      "file": "projects/widget-co/roadmap.md",
      "line": 9,
      "project": "widget-co",
      "assignee": "emma",
      "priority": "urgent",
      "tags": ["design", "analytics"]
    },
    {
      "id": "1b6cf709",
      "text": "Implement data visualization library (2026-01-28)",
      "completed": false,
      "file": "projects/widget-co/roadmap.md",
      "line": 10,
      "project": "widget-co",
      "assignee": "chris",
      "priority": "high",
      "tags": ["frontend", "charts"]
    }
  ],
  "metadata": {
    "total": 15,
    "completed": 1,
    "incomplete": 14
  }
}
```

**What Happened:**

- Structured JSON output
- Perfect for piping to other tools (`jq`, scripts, APIs)
- Every field is typed and documented
- Each task has a stable ID (hash of file + line + text)

---

## Additional Quick Examples

### Morning Standup Prep

```bash
# What's urgent today?
md2do list --priority urgent --due-today

# What's overdue?
md2do list --overdue --assignee nick
```

### Sprint Planning

```bash
# See all backend work
md2do list --tag backend

# Check team capacity
md2do stats --by assignee
```

### Project Review

```bash
# All acme-app tasks
md2do list --project acme-app

# What's left in sprint?
md2do list --project acme-app --incomplete --sort due
```

---

## Key Points to Emphasize in Blog Post

1. **Standard Markdown** - No special syntax required, just enhance what you already use
2. **Folder Structure = Context** - Projects and people inferred from organization
3. **Powerful Filtering** - Combine multiple filters for precise queries
4. **Multiple Formats** - Pretty for humans, table for density, JSON for automation
5. **Clickable Links** - File paths are clickable in VS Code
6. **Real-time** - Always reads your current markdown files, no sync needed
7. **Fast** - Scans hundreds of files in milliseconds

---

## Potential Sidebar: "My Daily Workflow"

```bash
# Morning: What needs attention?
md2do list --assignee nick --priority urgent --sort due

# Before standup: Quick team overview
md2do stats --by assignee

# During day: Check specific project
md2do list --project acme-app --incomplete

# End of day: What's left?
md2do list --assignee nick --incomplete --due-within 7

# Planning: Next sprint scope
md2do list --tag backend --incomplete
```

---

## Blog Post Best Practices

**Visual Flow:**

1. Start with raw markdown snippet (relatable)
2. Show simple filter command
3. Show output (wow factor)
4. Explain what happened
5. Build complexity gradually

**Tone:**

- "Look at this cool thing I can do now..."
- Not "Here are the features of my product..."
- Show, don't tell

**Screenshots vs Code Blocks:**

- Use actual terminal screenshots for the "pretty" format (shows colors)
- Use code blocks for JSON/table format
- Raw markdown always in code blocks

**Avoid:**

- Too much technical detail in main flow
- Overwhelming with all features at once
- Trying to explain every flag and option
- Making it a documentation page

**Include:**

- Real use cases ("I use this every morning...")
- Pain point → solution pattern
- The "aha" moment when it clicks
