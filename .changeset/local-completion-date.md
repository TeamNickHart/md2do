---
'@md2do/core': patch
---

Add `formatLocalDate()` to format a date as `YYYY-MM-DD` in the local timezone. The VS Code extension now uses it for `{completed:...}` dates, which were computed in UTC and could land on the previous day shortly after local midnight.
