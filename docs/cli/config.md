# config

Manage md2do configuration interactively or programmatically.

## Overview

The `config` command group provides tools to initialize, view, and modify md2do configuration. Use the interactive wizard for first-time setup, or individual commands to manage specific settings.

## Subcommands

### `config init`

Initialize configuration with interactive prompts.

```bash
md2do config init [options]
```

**Options:**

- `-g, --global` - Create global config in home directory (`~/.md2do.json`)
- `--format <type>` - Config file format: `json`, `yaml`, `js` (default: `json`)
- `--default-assignee <username>` - Skip prompt, set assignee
- `--workday-start <time>` - Skip prompt, set start time (HH:MM)
- `--workday-end <time>` - Skip prompt, set end time (HH:MM)
- `--default-due-time <when>` - Skip prompt, set due time (`start` or `end`)
- `--output-format <type>` - Skip prompt, set format (`pretty`, `table`, `json`)
- `--no-colors` - Disable colored output
- `--warnings <level>` - Skip prompt, set warnings (`recommended`, `strict`, `off`)

**Interactive Mode:**

When run without options, presents a friendly wizard:

```bash
md2do config init
```

```
Welcome to md2do configuration!

? Your username (for filtering tasks): alice
? Work day start time (HH:MM): (08:00)
? Work day end time (HH:MM): (17:00)
? Default due time (start/end): end
? Output format (pretty/table/json): pretty
? Enable colored output? Yes
? Warning level (recommended/strict/off): recommended

✓ Configuration saved to .md2do.json
```

**Non-Interactive Mode:**

Skip all prompts by providing values:

```bash
md2do config init \
  --default-assignee alice \
  --workday-start 09:00 \
  --workday-end 18:00 \
  --output-format table \
  --warnings strict
```

**Global Configuration:**

Create configuration in your home directory for all projects:

```bash
md2do config init --global
```

**Example Scenarios:**

```bash
# Set up for personal use
md2do config init --default-assignee me --warnings off

# Team project with strict validation
md2do config init --warnings strict --output-format table

# Custom work hours
md2do config init --workday-start 07:30 --workday-end 16:30
```

### `config set`

Set a specific configuration value.

```bash
md2do config set <key> <value> [options]
```

**Options:**

- `-g, --global` - Set in global configuration

**Available Keys:**

| Key                      | Type                | Example               |
| ------------------------ | ------------------- | --------------------- |
| `defaultAssignee`        | string              | `"alice"`             |
| `workday.startTime`      | string (HH:MM)      | `"09:00"`             |
| `workday.endTime`        | string (HH:MM)      | `"18:00"`             |
| `workday.defaultDueTime` | start \| end        | `"end"`               |
| `output.format`          | pretty\|table\|json | `"table"`             |
| `output.colors`          | boolean             | `true`                |
| `output.paths`           | boolean             | `true`                |
| `markdown.root`          | string              | `"./docs"`            |
| `markdown.pattern`       | string              | `"**/*.md"`           |
| `markdown.exclude`       | array               | `["node_modules/**"]` |
| `todoist.apiToken`       | string              | `"your-token"`        |
| `todoist.defaultProject` | string              | `"Work"`              |
| `todoist.autoSync`       | boolean             | `false`               |
| `warnings.enabled`       | boolean             | `true`                |

**Examples:**

```bash
# Set work hours
md2do config set workday.startTime "09:00"
md2do config set workday.endTime "18:00"

# Configure output
md2do config set output.format "table"
md2do config set output.colors false

# Set default assignee
md2do config set defaultAssignee "alice"

# Configure Todoist
md2do config set todoist.apiToken "your-token"
md2do config set todoist.defaultProject "Personal"

# Set globally for all projects
md2do config set defaultAssignee "alice" --global
```

**Value Types:**

The command automatically parses values:

- Booleans: `true`, `false`
- Numbers: `42`, `3.14`
- Strings: `"hello"`, `alice`
- Arrays: `["a", "b"]` (use JSON syntax)
- Objects: `{"key": "value"}` (use JSON syntax)

### `config get`

Get a specific configuration value.

```bash
md2do config get <key> [options]
```

**Options:**

- `-g, --global` - Get from global config only

**Examples:**

```bash
# Get work start time
md2do config get workday.startTime
# Output: 09:00

# Get output format
md2do config get output.format
# Output: pretty

# Get entire workday config
md2do config get workday
# Output (JSON):
# {
#   "startTime": "09:00",
#   "endTime": "18:00",
#   "defaultDueTime": "end"
# }

# Get from global config only
md2do config get defaultAssignee --global
```

### `config list`

Show all configuration values (merged from all sources).

```bash
md2do config list [options]
```

**Options:**

- `--show-origin` - Show where each config value comes from

**Examples:**

```bash
# Show current effective configuration
md2do config list

# Show with sources
md2do config list --show-origin
```

**Output:**

```json
{
  "markdown": {
    "pattern": "**/*.md",
    "exclude": ["node_modules/**", ".git/**"]
  },
  "defaultAssignee": "alice",
  "workday": {
    "startTime": "09:00",
    "endTime": "18:00",
    "defaultDueTime": "end"
  },
  "output": {
    "format": "pretty",
    "colors": true,
    "paths": true
  }
}
```

With `--show-origin`:

```
Configuration sources:
  1. Default values (built-in)
  2. Global config (~/.md2do.json)
  3. Project config (./.md2do.json)
  4. Environment variables
```

### `config edit`

Open configuration file in your default editor.

```bash
md2do config edit [options]
```

**Options:**

- `-g, --global` - Edit global configuration

**Behavior:**

- Uses `$EDITOR` or `$VISUAL` environment variable
- Falls back to platform default (`vi` on Unix, `notepad` on Windows)
- Creates config file if it doesn't exist

**Examples:**

```bash
# Edit project config
md2do config edit

# Edit global config
md2do config edit --global
```

### `config validate`

Validate current configuration against schema.

```bash
md2do config validate
```

**Examples:**

```bash
md2do config validate
# Output: ✓ Configuration is valid

# Or if invalid:
# Invalid configuration:
# - workday.startTime must match format HH:MM
# - output.format must be 'pretty', 'table', or 'json'
```

## Configuration Hierarchy

md2do merges configuration from multiple sources in this order (later overrides earlier):

1. **Built-in defaults** - Sensible defaults for all settings
2. **Global config** - `~/.md2do.json` (your personal preferences)
3. **Project config** - `./.md2do.json` (project-specific settings)
4. **Environment variables** - `TODOIST_API_TOKEN`, `MD2DO_DEFAULT_ASSIGNEE`

**Example Merge:**

```bash
# Global config (~/.md2do.json)
{
  "defaultAssignee": "alice",
  "output": { "format": "pretty" }
}

# Project config (./.md2do.json)
{
  "output": { "format": "table" },
  "todoist": { "defaultProject": "Work" }
}

# Final merged config:
{
  "defaultAssignee": "alice",       # from global
  "output": { "format": "table" },  # from project (overrides global)
  "todoist": { "defaultProject": "Work" }  # from project
}
```

## Config File Formats

### JSON (recommended)

`.md2do.json`:

```json
{
  "defaultAssignee": "alice",
  "workday": {
    "startTime": "09:00",
    "endTime": "18:00"
  }
}
```

### YAML

`.md2do.yaml`:

```yaml
defaultAssignee: alice
workday:
  startTime: '09:00'
  endTime: '18:00'
```

### JavaScript

`.md2do.js`:

```javascript
module.exports = {
  defaultAssignee: 'alice',
  workday: {
    startTime: '09:00',
    endTime: '18:00',
  },
};
```

## Common Workflows

### First-Time Setup

```bash
# Interactive wizard
md2do config init

# Answer prompts for:
# - Your username
# - Work hours
# - Output preferences
# - Warning level
```

### Quick Configuration

```bash
# Non-interactive setup
md2do config init \
  --default-assignee alice \
  --workday-start 09:00 \
  --workday-end 17:00 \
  --output-format pretty \
  --warnings recommended
```

### Adjust Specific Setting

```bash
# Change work hours
md2do config set workday.startTime "07:30"

# Verify change
md2do config get workday.startTime
```

### Share Project Config

```bash
# Initialize project config
md2do config init

# Edit to remove secrets
md2do config edit

# Remove apiToken, keep project settings
# Commit .md2do.json to git
git add .md2do.json
git commit -m "Add md2do project config"
```

### Personal + Project Setup

```bash
# Set global preferences once
md2do config init --global \
  --default-assignee alice \
  --output-format pretty

# Per-project config
cd ~/work/project-a
md2do config init --todoist-default-project "Work"

cd ~/personal/notes
md2do config init --todoist-default-project "Personal"
```

## Best Practices

### Security

- **Never commit secrets** - Add `.md2do.json` to `.gitignore` if it contains API tokens
- **Use environment variables** - Set `TODOIST_API_TOKEN` in env, not config files
- **Use global config for tokens** - Keep secrets in `~/.md2do.json` (not committed)
- **Share structure, not secrets** - Commit project config without sensitive values

**Example safe project config:**

```json
{
  "markdown": {
    "root": "./docs",
    "exclude": ["drafts/**"]
  },
  "todoist": {
    "defaultProject": "Team Project"
    // apiToken loaded from env or global config
  },
  "warnings": "strict"
}
```

### Team Projects

- **Use strict warnings** - Enforce consistent task formatting
- **Document config** - Add comments (use JS format for comments)
- **Version control** - Commit non-sensitive config to git
- **README** - Document required environment variables

### Multiple Projects

Use global config for personal settings, project config for project-specific:

**Global (`~/.md2do.json`):**

```json
{
  "defaultAssignee": "alice",
  "output": { "colors": true, "format": "pretty" },
  "todoist": {
    "apiToken": "your-personal-token"
  }
}
```

**Work Project (`~/work/.md2do.json`):**

```json
{
  "markdown": { "root": "./documentation" },
  "todoist": { "defaultProject": "Client Work" },
  "warnings": "strict"
}
```

**Personal Notes (`~/notes/.md2do.json`):**

```json
{
  "todoist": { "defaultProject": "Personal" },
  "warnings": { "enabled": false }
}
```

## See Also

- [Configuration Guide](/guide/configuration) - Detailed config reference
- [Todoist Setup](/integrations/todoist) - Configure [Todoist](https://www.todoist.com) integration
- [CLI Overview](/cli/overview) - All CLI commands
