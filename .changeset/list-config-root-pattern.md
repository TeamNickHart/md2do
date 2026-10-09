---
'@md2do/cli': patch
---

`list` and `stats` now respect `markdown.root` and `markdown.pattern` from `.md2do.json`; `--path` and `--pattern` still take precedence when given. With `--path`, a config in that directory is used if there is one, otherwise the config in the current directory.
