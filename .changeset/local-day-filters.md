---
'@md2do/core': patch
---

Due date filters (`isOverdue`, `isDueToday`, `isDueThisWeek`, `isDueWithinDays`) now use local day boundaries instead of UTC. East of UTC a task due today was always reported as overdue, and west of UTC it became overdue each evening. Completion dates written by ingest also use the local date.
