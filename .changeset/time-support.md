---
'@md2do/cli': minor
'@md2do/config': minor
'@md2do/core': minor
'@md2do/mcp': patch
'@md2do/todoist': patch
'md2do-vscode': patch
---

Add time support to due dates with workday configuration

**New Features:**

- Support optional time component in due dates: `[due: 2026-02-06 17:00]`
- Parse both 24-hour format times (H:MM and HH:MM)
- Added `parseTime()` utility for time validation
- New workday config schema with `startTime`, `endTime`, and `defaultDueTime`
- When no time specified in due date, applies default from config (defaults to 17:00 end of workday)
- Prevents "due 8 hours ago" issues for dates without explicit times

**Configuration:**

```json
{
  "workday": {
    "startTime": "08:00",
    "endTime": "17:00",
    "defaultDueTime": "end"
  }
}
```
