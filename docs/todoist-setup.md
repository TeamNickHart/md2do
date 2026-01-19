# Todoist Integration Setup

md2do supports integration with Todoist, allowing you to synchronize tasks between your markdown files and Todoist.

## Getting Your Todoist API Token

1. **Log in to Todoist** at [https://app.todoist.com](https://app.todoist.com)

2. **Navigate to Settings**
   - Click on your profile picture or initials in the top-right corner
   - Select "Settings" from the dropdown menu

3. **Open Integrations**
   - In the left sidebar, click on "Integrations"
   - Or navigate directly to: [https://app.todoist.com/app/settings/integrations/developer](https://app.todoist.com/app/settings/integrations/developer)

4. **Copy Your API Token**
   - Scroll down to the "API token" section
   - Click "Copy to clipboard" next to your API token
   - **Important**: Keep this token secure - it provides full access to your Todoist account

## Configuration Options

md2do supports hierarchical configuration with three levels of precedence:

### Option 1: Environment Variable (Recommended for CI/CD)

Set the `TODOIST_API_TOKEN` environment variable:

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export TODOIST_API_TOKEN="your-api-token-here"

# Or set for a single session
TODOIST_API_TOKEN="your-token" md2do list
```

**Pros**: Simple, works everywhere, good for CI/CD
**Cons**: Token in environment history

### Option 2: Global Configuration (Recommended for Personal Use)

Create a configuration file in your home directory:

**`~/.md2do.json`**:

```json
{
  "todoist": {
    "apiToken": "your-api-token-here",
    "defaultProject": "Inbox",
    "autoSync": false,
    "syncDirection": "both"
  },
  "defaultAssignee": "yourname",
  "output": {
    "format": "pretty",
    "colors": true
  }
}
```

**Or `~/.md2do.yaml`**:

```yaml
todoist:
  apiToken: your-api-token-here
  defaultProject: Inbox
  autoSync: false
  syncDirection: both

defaultAssignee: yourname

output:
  format: pretty
  colors: true
```

**Pros**: One-time setup, works for all projects
**Cons**: Same token for all projects

### Option 3: Project Configuration (Recommended for Teams)

Create a configuration file in your project directory:

**`./.md2do.json`** (in your markdown project root):

```json
{
  "todoist": {
    "apiToken": "work-project-token-here",
    "defaultProject": "Work",
    "autoSync": true,
    "syncDirection": "both",
    "labelMapping": {
      "urgent": "p1",
      "high": "p2",
      "normal": "p3"
    }
  },
  "markdown": {
    "root": "./docs",
    "exclude": ["node_modules/**", ".git/**"],
    "pattern": "**/*.md"
  }
}
```

**Pros**: Different tokens per project, team-shareable (if token omitted)
**Cons**: Token in version control (unless `.gitignore`d)

**⚠️ Security Note**: If using project-level config, add `.md2do.json` to `.gitignore` or use environment variables for the token:

```json
{
  "todoist": {
    "defaultProject": "Work",
    "autoSync": true
    // apiToken loaded from TODOIST_API_TOKEN env var
  }
}
```

## Configuration Precedence

Configurations are merged with the following priority (later overrides earlier):

1. **Default values** (built into md2do)
2. **Global config** (`~/.md2do.json`)
3. **Project config** (`./.md2do.json`)
4. **Environment variables** (`TODOIST_API_TOKEN`, `MD2DO_DEFAULT_ASSIGNEE`)

**Example**: If you have a global config with `"defaultProject": "Inbox"` and a project config with `"defaultProject": "Work"`, tasks in that project will use "Work".

## Configuration Reference

### Todoist Settings

| Setting          | Type                         | Default  | Description                                         |
| ---------------- | ---------------------------- | -------- | --------------------------------------------------- |
| `apiToken`       | string                       | -        | Your Todoist API token                              |
| `defaultProject` | string                       | -        | Default project name for new tasks                  |
| `autoSync`       | boolean                      | `false`  | Auto-sync on every command                          |
| `syncDirection`  | `"push" \| "pull" \| "both"` | `"both"` | Sync direction: push to Todoist, pull from, or both |
| `labelMapping`   | Record<string, string>       | -        | Map md2do priorities/tags to Todoist labels         |

### Markdown Settings

| Setting   | Type     | Default                          | Description                     |
| --------- | -------- | -------------------------------- | ------------------------------- |
| `root`    | string   | `"."`                            | Root directory to scan          |
| `exclude` | string[] | `["node_modules/**", ".git/**"]` | Glob patterns to exclude        |
| `pattern` | string   | `"**/*.md"`                      | Glob pattern for markdown files |

### Output Settings

| Setting  | Type                            | Default    | Description               |
| -------- | ------------------------------- | ---------- | ------------------------- |
| `format` | `"pretty" \| "table" \| "json"` | `"pretty"` | Output format             |
| `colors` | boolean                         | `true`     | Enable colored output     |
| `paths`  | boolean                         | `true`     | Show file paths in output |

## Multiple Todoist Accounts

You can use different Todoist accounts for different projects:

**Work project** (`~/Work/project-a/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "work-token-here",
    "defaultProject": "Client A"
  }
}
```

**Personal project** (`~/Personal/notes/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "personal-token-here",
    "defaultProject": "Personal"
  }
}
```

Or use environment variables:

```bash
# In work project
cd ~/Work/project-a
TODOIST_API_TOKEN="work-token" md2do list

# In personal project
cd ~/Personal/notes
TODOIST_API_TOKEN="personal-token" md2do list
```

## Verifying Your Setup

Test your configuration:

```bash
# Check if config loads correctly
md2do list --help

# List tasks (will use configured settings)
md2do list

# If Todoist sync is implemented, test connection:
md2do todoist list
```

## Troubleshooting

### "Invalid API token" or "Unauthorized"

- Verify your token is correct (regenerate if needed)
- Check token hasn't expired
- Ensure no extra spaces in configuration file

### "Config file not found"

- Check file name: `.md2do.json` (starts with dot)
- Check file location: home directory or project root
- Verify JSON syntax: use [JSONLint](https://jsonlint.com/) to validate

### Different projects using same token

- Check configuration precedence
- Use project-level config to override global
- Verify you're in the correct directory

### Token in git history

- Add `.md2do.json` to `.gitignore`
- Remove from git history: `git filter-branch` or `git filter-repo`
- Regenerate Todoist token
- Use environment variables instead

## Security Best Practices

1. **Never commit tokens to version control**
   - Add `.md2do.json` to `.gitignore`
   - Use environment variables for sensitive data

2. **Restrict file permissions**

   ```bash
   chmod 600 ~/.md2do.json
   ```

3. **Use project config for team settings only**

   ```json
   {
     "todoist": {
       "defaultProject": "Team Project",
       "syncDirection": "both"
       // No apiToken - use environment variable
     }
   }
   ```

4. **Rotate tokens periodically**
   - Regenerate in Todoist settings
   - Update all configuration files

## Next Steps

- See [Todoist Implementation Plan](./todoist-implementation-plan.md) for planned features
- Check [README](../README.md) for general md2do usage
- Visit [Todoist API Docs](https://developer.todoist.com/rest/v2/) for API details
