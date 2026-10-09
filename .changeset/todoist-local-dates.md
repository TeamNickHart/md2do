---
'@md2do/todoist': patch
---

Due dates sent to Todoist use the local calendar date. East of UTC, `#due/2026-10-09` was sent as `2026-10-08`. Dates read from Todoist are now local-midnight dates, the same representation the parser uses.
