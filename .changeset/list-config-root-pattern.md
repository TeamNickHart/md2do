---
'@md2do/cli': patch
---

`list` and `stats` now respect `markdown.root` and `markdown.pattern` from `.md2do.json`; `--path` and `--pattern` still take precedence when given. Both commands read the config from the current directory, also when `--path` points elsewhere.
