---
'@md2do/cli': minor
'@md2do/mcp': minor
---

JSON output (`list --format json`) and the MCP tools and resources now return `dueDate` and `completedDate` as calendar dates (`2026-10-09`) instead of ISO timestamps (`2026-10-09T07:00:00.000Z`). The timestamp was local midnight expressed in UTC, so it showed the previous day east of UTC. Update any script that parses these fields as timestamps.

The MCP `get_task_stats` tool counts overdue tasks the same way `list` does; it counted every task due today as overdue.
