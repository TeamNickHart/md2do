# Configuration

md2do uses hierarchical configuration with multiple sources that merge together.

## Quick Start

Create `.md2do.json` in your project root:

```json
{
  "defaultAssignee": "yourname",
  "todoist": {
    "apiToken": "your-api-token",
    "defaultProject": "Inbox"
  }
}
```

That's it! md2do will find and use this config automatically.

## Configuration Precedence

Configs merge in this order (later overrides earlier):

1. **Default values** (built into md2do)
2. **Global config** (`~/.md2do.json`)
3. **Project config** (`./.md2do.json`)
4. **Environment variables** (`TODOIST_API_TOKEN`)

Example flow:

```bash
# Global config sets your default name
~/.md2do.json: { "defaultAssignee": "alice" }

# Project config sets Todoist project
./project/.md2do.json: { "todoist": { "defaultProject": "Work" } }

# Environment overrides API token
export TODOIST_API_TOKEN="secret-token"

# Final merged config:
{
  "defaultAssignee": "alice",    # from global
  "todoist": {
    "apiToken": "secret-token",  # from environment
    "defaultProject": "Work"     # from project
  }
}
```

## Config File Locations

### Global Config

Place in your home directory:

- `~/.md2do.json`
- `~/.md2do.yaml`
- `~/.md2do.js`

**Use for:** Settings you want across all projects (your username, output preferences).

### Project Config

Place in project root:

- `./.md2do.json`
- `./.md2do.yaml`
- `./.md2do.js`
- `./md2do.config.js`

**Use for:** Project-specific settings (Todoist project, markdown paths, team tags).

## Supported Formats

### JSON

`.md2do.json`:

```json
{
  "defaultAssignee": "alice",
  "output": {
    "format": "pretty",
    "colors": true
  }
}
```

### YAML

`.md2do.yaml`:

```yaml
defaultAssignee: alice
output:
  format: pretty
  colors: true
```

### JavaScript

`.md2do.js`:

```javascript
module.exports = {
  defaultAssignee: 'alice',
  output: {
    format: 'pretty',
    colors: true,
  },
};
```

## Configuration Options

### Markdown Settings

Control file scanning:

```json
{
  "markdown": {
    "root": "./docs",
    "pattern": "**/*.md",
    "exclude": ["node_modules/**", "drafts/**", ".git/**"]
  }
}
```

**Options:**

- `root` - Directory to start scanning (default: `.`)
- `pattern` - Glob pattern for markdown files (default: `**/*.md`)
- `exclude` - Patterns to skip (default: `["node_modules/**", ".git/**"]`)

### Todoist Settings

Configure Todoist integration:

```json
{
  "todoist": {
    "apiToken": "your-token",
    "defaultProject": "Inbox",
    "autoSync": false,
    "syncDirection": "both"
  }
}
```

**Options:**

- `apiToken` - Your Todoist API token
- `defaultProject` - Default project name for new tasks
- `autoSync` - Auto-sync after task changes (default: `false`)
- `syncDirection` - Sync mode: `"push"`, `"pull"`, or `"both"` (default: `"both"`)

See [Todoist Integration](/integrations/todoist) for setup details.

### Output Settings

Customize output formatting:

```json
{
  "output": {
    "format": "pretty",
    "colors": true,
    "paths": true
  }
}
```

**Options:**

- `format` - Output style: `"pretty"`, `"table"`, or `"json"` (default: `"pretty"`)
- `colors` - Enable colored output (default: `true`)
- `paths` - Show file paths (default: `true`)

### Default Assignee

Set your username:

```json
{
  "defaultAssignee": "yourname"
}
```

Useful for filtering "my tasks" quickly.

### Warning Settings

Control validation warnings for markdown task syntax:

```json
{
  "warnings": {
    "enabled": true,
    "rules": {
      "unsupported-bullet": "warn",
      "malformed-checkbox": "warn",
      "missing-space-after": "warn",
      "missing-space-before": "warn",
      "relative-date-no-context": "warn",
      "missing-due-date": "off",
      "missing-completed-date": "off",
      "duplicate-todoist-id": "error",
      "file-read-error": "error"
    }
  }
}
```

::: tip Complementary Linting
md2do warnings focus on task-specific validation (metadata, task semantics). For comprehensive markdown syntax checking, consider using [markdownlint](https://github.com/DavidAnson/markdownlint) alongside md2do.
:::

**Options:**

- `enabled` - Enable/disable all warnings (default: `true`)
- `rules` - Per-rule severity levels: `"error"`, `"warn"`, `"info"`, or `"off"`

**Available Warning Rules:**

| Rule                       | Description                               | Default |
| -------------------------- | ----------------------------------------- | ------- |
| `unsupported-bullet`       | Using `*` or `+` instead of `-` for tasks | `warn`  |
| `malformed-checkbox`       | Extra spaces in checkbox syntax           | `warn`  |
| `missing-space-after`      | No space after checkbox `[x]`             | `warn`  |
| `missing-space-before`     | No space before checkbox                  | `warn`  |
| `relative-date-no-context` | Relative date without heading date        | `warn`  |
| `missing-due-date`         | Incomplete task without due date          | `off`   |
| `missing-completed-date`   | Completed task without completion date    | `off`   |
| `duplicate-todoist-id`     | Same Todoist ID used multiple times       | `error` |
| `file-read-error`          | Failed to read markdown file              | `error` |

**Preset Configurations:**

Use built-in presets instead of specifying individual rules:

**Recommended** (default) - Validates markdown format, metadata optional:

```json
{
  "warnings": "recommended"
}
```

**Strict** - All warnings enabled, enforces complete metadata:

```json
{
  "warnings": "strict"
}
```

**Disable All** - Turn off all warnings:

```json
{
  "warnings": {
    "enabled": false
  }
}
```

**Custom** - Mix presets with overrides:

```json
{
  "warnings": {
    "enabled": true,
    "rules": {
      "missing-due-date": "warn",
      "missing-completed-date": "off"
    }
  }
}
```

## Environment Variables

Override config with environment variables:

```bash
# Todoist API token (most common)
export TODOIST_API_TOKEN="your-token"

# Default assignee
export MD2DO_DEFAULT_ASSIGNEE="alice"
```

Environment variables **always win** - they override all config files.

## Common Configurations

### Personal Setup

`~/.md2do.json`:

```json
{
  "defaultAssignee": "yourname",
  "output": {
    "format": "pretty",
    "colors": true
  },
  "todoist": {
    "apiToken": "your-personal-token"
  }
}
```

### Team Project

`.md2do.json` (committed to git):

```json
{
  "markdown": {
    "root": "./docs",
    "exclude": ["drafts/**", "archive/**"]
  },
  "todoist": {
    "defaultProject": "Team Project"
  },
  "warnings": "strict"
}
```

**Important:** Don't commit `apiToken`! Use environment variables or global config for secrets.

**Note:** Team projects often use `"warnings": "strict"` to enforce consistent task formatting.

### Work vs Personal

**Global config** (`~/.md2do.json`):

```json
{
  "defaultAssignee": "alice",
  "output": {
    "colors": true
  }
}
```

**Work project** (`~/work/project/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "work-token",
    "defaultProject": "Client Work"
  }
}
```

**Personal project** (`~/personal/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "personal-token",
    "defaultProject": "Personal"
  }
}
```

### Documentation Project

For projects with markdown docs:

```json
{
  "markdown": {
    "root": "./documentation",
    "pattern": "**/*.md",
    "exclude": ["node_modules/**", "build/**", "api-reference/**"]
  },
  "defaultAssignee": "docs-team",
  "warnings": {
    "enabled": true,
    "rules": {
      "missing-due-date": "off",
      "missing-completed-date": "off"
    }
  }
}
```

### Solo Developer

For personal projects with flexible task formatting:

```json
{
  "defaultAssignee": "me",
  "warnings": {
    "enabled": true,
    "rules": {
      "missing-due-date": "off",
      "missing-completed-date": "off",
      "unsupported-bullet": "off"
    }
  }
}
```

## Security Best Practices

### Never Commit Secrets

Add to `.gitignore`:

```gitignore
# md2do config with secrets
.md2do.json
.md2do.local.json
```

### Use Environment Variables

For CI/CD or shared machines:

```bash
# .env file (also add to .gitignore)
TODOIST_API_TOKEN=your-secret-token

# Use in scripts
export $(cat .env | xargs)
md2do list
```

### Restrict File Permissions

Protect your config:

```bash
chmod 600 ~/.md2do.json
```

### Share Structure, Not Secrets

Commit this:

```json
{
  "markdown": {
    "root": "./docs"
  },
  "todoist": {
    "defaultProject": "Team Project"
    // apiToken loaded from environment
  }
}
```

Not this:

```json
{
  "todoist": {
    "apiToken": "abc123secret" // ❌ Never commit!
  }
}
```

## Validation

md2do validates your config automatically. Invalid configs show helpful errors:

```bash
$ md2do list
Error: Invalid configuration:
- todoist.syncDirection must be 'push', 'pull', or 'both'
```

## Debugging Config

See what config md2do is using:

```bash
# Show effective configuration
md2do config show

# Show config sources
md2do config sources

# Validate current config
md2do config validate
```

_(Commands coming soon)_

## Complete Example

Full configuration with all options:

```json
{
  "markdown": {
    "root": "./documentation",
    "pattern": "**/*.md",
    "exclude": ["node_modules/**", "drafts/**", ".git/**", "dist/**"]
  },
  "defaultAssignee": "alice",
  "todoist": {
    "apiToken": "your-token-here",
    "defaultProject": "Work",
    "autoSync": false,
    "syncDirection": "both"
  },
  "output": {
    "format": "pretty",
    "colors": true,
    "paths": true
  },
  "warnings": {
    "enabled": true,
    "rules": {
      "unsupported-bullet": "warn",
      "malformed-checkbox": "warn",
      "missing-space-after": "warn",
      "missing-space-before": "warn",
      "relative-date-no-context": "warn",
      "missing-due-date": "off",
      "missing-completed-date": "off",
      "duplicate-todoist-id": "error",
      "file-read-error": "error"
    }
  }
}
```

## Next Steps

- [Todoist Integration](/integrations/todoist) - Configure Todoist sync
- [Task Format](/guide/task-format) - Learn task syntax
- [Filtering](/guide/filtering) - Query your tasks
- [Examples](/guide/examples) - Real-world setups
