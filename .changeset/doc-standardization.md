---
'@md2do/cli': patch
'@md2do/core': patch
'@md2do/config': patch
'@md2do/todoist': patch
'@md2do/mcp': patch
---

Documentation improvements and standardization

- Standardized bracket syntax across all docs (use space after colon: `[due: ...]`)
- Marked semantic/relative dates as experimental with clear warnings
- Clarified Todoist sync is one-way (pull only), not bidirectional
- Documented context extraction limitation (must run from repo root)
- Updated code examples in READMEs to match best practices
- Removed unhelpful parentheses syntax warning
