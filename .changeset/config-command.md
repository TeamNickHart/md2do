---
'@md2do/cli': minor
---

Add interactive config command for easy setup and configuration management

New `config` command provides interactive and programmatic configuration:

- `config init` - Interactive setup wizard with friendly prompts
- `config set/get` - Programmatically manage individual config values
- `config list` - View merged configuration with optional source display
- `config edit` - Open config file in $EDITOR
- `config validate` - Validate configuration against schema

Features:

- Interactive wizard for first-time setup (workday hours, assignee, output preferences, warnings)
- Non-interactive mode with CLI flags for automation
- Global flag support for all subcommands
- Multi-format support (JSON, YAML, JS)
- Automatic config validation

This makes initial setup much easier - just run `md2do config init`!
