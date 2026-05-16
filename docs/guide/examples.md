# Examples

Real-world usage patterns for md2do.

## Adding Tasks from the CLI

### Quick Capture

```bash
# Add a task with metadata
md2do add "Review PR #200" --file tasks.md --assignee nick --priority high --due tomorrow --tag code-review

# Preview without writing (stdout mode)
md2do add "Deploy v2" --due friday --priority urgent

# Pipe into a file
md2do add "Write tests" --due "next week" --tag backend >> sprint.md

# Batch-add tasks from a script
for task in "Write docs" "Update changelog" "Tag release"; do
  md2do add "$task" --file release.md --tag release --due friday
done
```

## Personal Task Management

### Daily TODO List

**tasks.md:**

```markdown
# Today

- [ ] Morning standup (9am)
- [ ] Review PR #145 !! #code-review
- [ ] Fix navbar bug !!! #frontend #due/2026-01-20
- [ ] Team lunch (12:30pm)
- [ ] Update documentation ! #docs

# This Week

- [ ] Plan sprint 24 !! #due/2026-01-22
- [ ] 1-1 with manager #due/2026-01-21
- [ ] Write blog post #content
```

**Query tasks:**

```bash
# What's urgent today?
md2do list --priority urgent,high --incomplete

# What's done?
md2do list --completed

# What's left for the week?
md2do list --incomplete --sort priority
```

### GTD-Style Organization

```
inbox.md          # Capture everything
projects/
  acme-app.md     # Active projects
  blog.md
someday.md        # Future ideas
archive/          # Completed projects
```

**Workflow:**

```bash
# Daily review - what needs action?
md2do list --file inbox.md --incomplete

# Move to projects, then clear inbox
# Weekly review
md2do stats --by project
```

## Team Project Management

### Sprint Planning

**sprint-24.md:**

```markdown
## Sprint 24 (Jan 20 - Feb 3)

### Goals

- Launch user authentication
- Improve mobile performance
- Fix critical bugs

### Backend (@alice)

- [ ] Implement OAuth flow !!! #backend #auth #due/2026-01-25
- [ ] Add JWT validation !! #backend #auth #due/2026-01-27
- [ ] Database migration ! #backend #db #due/2026-02-01

### Frontend (@bob)

- [ ] Login UI components !!! #frontend #ui #due/2026-01-26
- [ ] Mobile responsive design !! #frontend #mobile #due/2026-01-28
- [ ] Dark mode toggle ! #frontend #ui #due/2026-02-02

### DevOps (@charlie)

- [ ] Set up staging environment !!! #devops #due/2026-01-22
- [ ] Configure CI/CD pipeline !! #devops #due/2026-01-24
- [ ] Production deployment checklist ! #devops #due/2026-02-03
```

**Team queries:**

```bash
# Alice's urgent work
md2do list --assignee alice --priority urgent --incomplete

# Frontend progress
md2do list --tag frontend --sort assignee

# Sprint overview
md2do stats --by assignee

# What's overdue?
md2do list --overdue

# Burndown
md2do stats --completed
md2do stats --incomplete
```

### 1-on-1 Meetings

**1-1s/alice.md:**

```markdown
# 1-1 with Alice

## 2026-01-15

### Action Items

- [ ] Review Alice's design proposal @nick ! #due/2026-01-18
- [ ] Schedule team workshop @alice !! #due/2026-01-20
- [ ] Provide feedback on PR #145 @nick ! #due/2026-01-17

### Discussion Topics

- Career development path
- Q1 goals alignment

## 2026-01-08

### Action Items

- [x] Set up dev environment @alice
- [x] Onboarding docs review @nick
```

**Before meeting:**

```bash
# What did we commit to last time?
md2do list --person alice --incomplete

# What's done?
md2do list --person alice --completed
```

## Engineering Workflows

### Bug Tracking

**bugs.md:**

```markdown
# Critical Bugs

- [ ] Memory leak in WebSocket !!! #backend #p0 #due/2026-01-19 @alice
- [ ] Login redirect fails on Safari !!! #frontend #p0 #due/2026-01-20 @bob

# High Priority

- [ ] API rate limiting broken !! #backend #p1 #due/2026-01-22 @alice
- [ ] Mobile nav disappears !! #frontend #p1 #due/2026-01-23 @bob

# Normal Priority

- [ ] Typo in error message ! #frontend #p2 @bob
- [ ] Slow database query ! #backend #p2 @alice
```

**Triage workflow:**

```bash
# Critical bugs only
md2do list --tag p0 --incomplete

# By priority
md2do list --file bugs.md --sort priority

# Overdue bugs
md2do list --file bugs.md --overdue
```

### Code Reviews

**reviews.md:**

```markdown
# Pending Reviews

- [ ] PR #145: Authentication flow @nick !!! #backend #due/2026-01-19
- [ ] PR #148: Dark mode UI @alice !! #frontend #due/2026-01-20
- [ ] PR #151: API pagination @bob ! #backend #due/2026-01-22

# Completed

- [x] PR #142: Database schema @alice
- [x] PR #144: Mobile nav @bob
```

**Review queue:**

```bash
# My review responsibilities
md2do list --file reviews.md --assignee nick --incomplete --sort priority

# What's overdue?
md2do list --file reviews.md --overdue
```

### Documentation TODOs

```markdown
# API Documentation

- [ ] Document authentication endpoints !!! #docs #api #due/2026-01-25 @docs-team
- [ ] Add code examples !! #docs #examples #due/2026-01-28 @docs-team
- [ ] Update getting started guide ! #docs #due/2026-02-01 @docs-team

# Internal Docs

- [ ] Architecture decision records ! #docs #adr
- [ ] Deployment runbook !! #docs #devops
```

## Todoist Hybrid Workflows

### Mobile Task Capture

Capture tasks on mobile via Todoist, sync to markdown:

```bash
# Morning: pull new tasks from overnight
md2do todoist sync --direction pull

# Work on tasks in markdown all day
md2do list --assignee me --incomplete

# Evening: push completion status
md2do todoist sync --direction push
```

### Context Switching

Keep markdown as source of truth, sync important tasks:

```markdown
# In markdown: complete task list with context

- [ ] Review API docs !!! #backend #due/2026-01-25
- [ ] Fix login bug !! #frontend #due/2026-01-26
- [ ] Team meeting notes ! #due/2026-01-24
- [ ] Update slides #due/2026-01-27
```

```bash
# Sync urgent tasks to Todoist for mobile notifications
md2do list --priority urgent | xargs -I {} md2do todoist import {}
```

## MCP + AI Workflows

### Daily Standup

Ask Claude:

```
"Generate my daily standup"
```

Claude uses MCP to create:

```
📋 Daily Standup - Jan 19, 2026

**Yesterday:**
✅ Implemented OAuth flow (sprint-24.md:12)
✅ Reviewed PR #145 (reviews.md:8)

**Today:**
🔲 JWT token validation (sprint-24.md:13) - HIGH
🔲 Database migration (sprint-24.md:14)
🔲 1-1 with Alice (1-1s/alice.md:5)

**Blockers:**
- Need staging environment for testing
```

### Sprint Planning

Ask Claude:

```
"What should we prioritize for sprint 24?"
```

Claude analyzes tasks and suggests:

```
📊 Sprint 24 Recommendations

**Critical Path:**
1. Staging environment (blocks auth testing)
2. OAuth implementation (highest priority)
3. Login UI (depends on OAuth)

**Team Capacity:**
- @alice: 8 tasks (realistic for 2 weeks)
- @bob: 6 tasks (capacity for 1-2 more)
- @charlie: 4 tasks (blocked on AWS access)

**Recommendation:** Move 2 tasks to sprint 25
```

### Context-Aware Queries

```
You: "What backend work is due this week?"
Claude: [Lists all #backend tasks with due dates <= 7 days]

You: "Show overdue items by priority"
Claude: [Groups overdue tasks: 3 urgent, 5 high, 2 normal]

You: "What's blocking the team?"
Claude: [Searches for tasks mentioning "blocked" or "waiting"]
```

## Nested Projects

### Monorepo Task Management

```
packages/
  frontend/
    TODO.md
  backend/
    TODO.md
  shared/
    TODO.md
docs/
  TODO.md
```

**Query by project:**

```bash
# Frontend tasks
md2do list --path packages/frontend

# All engineering tasks
md2do list --path packages

# Documentation only
md2do list --path docs
```

### Client Projects

```
clients/
  acme-corp/
    roadmap.md
    bugs.md
  globex/
    roadmap.md
    bugs.md
```

**Per-client queries:**

```bash
# Acme Corp progress
md2do stats --path clients/acme-corp

# All client bugs
md2do list --file "**/bugs.md" --tag bug
```

## Automation Ideas

### Git Commit Hook

Update tasks on commit:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Mark tasks as done if commit message mentions them
md2do list --incomplete | while read task; do
  if git diff --cached | grep -q "$task"; then
    # Mark as complete
    echo "Task completed: $task"
  fi
done
```

### Daily Email

Send daily task digest:

```bash
#!/bin/bash
# cron: 0 8 * * * /home/user/daily-tasks.sh

md2do list --assignee me --incomplete --due-today | \
  mail -s "Tasks for $(date +%Y-%m-%d)" me@example.com
```

### Slack Integration

Post overdue tasks to Slack:

```bash
#!/bin/bash

OVERDUE=$(md2do list --overdue --format json)

curl -X POST "https://hooks.slack.com/..." \
  -d "{\"text\": \"⚠️ Overdue tasks:\n$OVERDUE\"}"
```

## Next Steps

- [Task Format](/guide/task-format) - Master the syntax
- [Filtering](/guide/filtering) - Advanced queries
- [Todoist Integration](/integrations/todoist) - Set up sync
- [MCP Integration](/integrations/mcp) - AI-powered workflows
