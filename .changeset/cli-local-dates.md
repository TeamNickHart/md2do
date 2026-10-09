---
'@md2do/cli': patch
---

`list --overdue`, `--due-today`, `--due-this-week` and `--due-within` follow the local calendar day in every timezone. `stats` now counts overdue and due-today tasks the same way `list` does (it counted every task due today as overdue). Pretty output describes due dates by calendar day ("due today", "due tomorrow", "due in 3 days") and no longer marks tasks due today as overdue. `ingest` stamps completed records with the local date.
