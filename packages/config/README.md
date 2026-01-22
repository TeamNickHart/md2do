# @md2do/config

[![npm version](https://badge.fury.io/js/%40md2do%2Fconfig.svg)](https://www.npmjs.com/package/@md2do/config)
[![npm downloads](https://img.shields.io/npm/dm/@md2do/config.svg)](https://www.npmjs.com/package/@md2do/config)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Hierarchical configuration management for md2do with support for multiple config sources and validation.

## Features

- 📁 **Multiple Config Sources** - Environment variables, global config, project config
- 🎯 **Hierarchical Resolution** - Configs merge with clear precedence rules
- ✅ **Schema Validation** - Type-safe configs with Zod
- 📝 **Flexible Formats** - JSON, YAML, JavaScript config files
- 🔒 **Type Safe** - Full TypeScript support with strict mode
- 🧪 **Well Tested** - 26 tests with comprehensive coverage

## Installation

```bash
pnpm add @md2do/config
```

## Quick Start

```typescript
import { loadConfig } from '@md2do/config';

// Load configuration with hierarchical resolution
const config = await loadConfig();

console.log(config.todoist?.apiToken); // From env or config file
console.log(config.markdown?.pattern); // Defaults to **/*.md
console.log(config.output?.format); // Defaults to 'pretty'
```

## Configuration Precedence

Configurations are merged in this order (later sources override earlier):

1. **Default values** (built into the package)
2. **Global config** (`~/.md2do.json` or `~/.md2do.yaml`)
3. **Project config** (`.md2do.json` in project root, walks up directory tree)
4. **Environment variables** (`TODOIST_API_TOKEN`, `MD2DO_DEFAULT_ASSIGNEE`)

## Supported Config Files

Config files are loaded using [cosmiconfig](https://github.com/davidtheclark/cosmiconfig):

- `.md2do.json`
- `.md2do.yaml` / `.md2do.yml`
- `.md2do.js` / `.md2do.cjs`
- `md2do.config.js` / `md2do.config.cjs`

## Configuration Schema

### Complete Example

```json
{
  "markdown": {
    "root": "./docs",
    "pattern": "**/*.md",
    "exclude": ["node_modules/**", ".git/**", "dist/**"]
  },
  "defaultAssignee": "yourname",
  "todoist": {
    "apiToken": "your-todoist-api-token",
    "defaultProject": "Inbox",
    "autoSync": false,
    "syncDirection": "both",
    "labelMapping": {
      "urgent": "p1",
      "high": "p2"
    }
  },
  "output": {
    "format": "pretty",
    "colors": true,
    "paths": true
  }
}
```

### Markdown Settings

Configure markdown file scanning:

```typescript
{
  markdown?: {
    root?: string;        // Root directory to scan (default: ".")
    pattern?: string;     // Glob pattern (default: "**/*.md")
    exclude?: string[];   // Patterns to exclude (default: ["node_modules/**", ".git/**"])
  }
}
```

### Todoist Settings

Configure Todoist integration:

```typescript
{
  todoist?: {
    apiToken?: string;              // Todoist API token
    defaultProject?: string;        // Default project name
    autoSync?: boolean;             // Auto-sync on commands (default: false)
    syncDirection?: 'push' | 'pull' | 'both';  // Sync direction (default: 'both')
    labelMapping?: Record<string, string>;     // Map md2do tags to Todoist labels
  }
}
```

### Output Settings

Configure output formatting:

```typescript
{
  output?: {
    format?: 'pretty' | 'table' | 'json';  // Output format (default: 'pretty')
    colors?: boolean;                       // Enable colors (default: true)
    paths?: boolean;                        // Show file paths (default: true)
  }
}
```

### Default Assignee

Set a default assignee for tasks:

```typescript
{
  defaultAssignee?: string;  // Default assignee username
}
```

## API Reference

### `loadConfig(options?)`

Load and merge configuration from all sources.

```typescript
import { loadConfig } from '@md2do/config';

const config = await loadConfig({
  cwd: process.cwd(), // Start searching from this directory
  loadGlobal: true, // Load global config from home directory
  loadEnv: true, // Load environment variables
});
```

**Returns:** `Promise<Config>` - Merged configuration object

### `validateConfig(config)`

Validate a configuration object against the schema.

```typescript
import { validateConfig } from '@md2do/config';

try {
  const config = validateConfig({
    todoist: {
      apiToken: 'test-token',
      syncDirection: 'both',
    },
  });
  console.log('Config is valid!');
} catch (error) {
  console.error('Invalid config:', error.message);
}
```

**Returns:** `Config` - Validated configuration object
**Throws:** Validation error if config is invalid

### Type Exports

```typescript
import type {
  Config,
  MarkdownConfig,
  TodoistConfig,
  OutputConfig,
  LoadConfigOptions,
} from '@md2do/config';
```

### Schema Exports

```typescript
import {
  ConfigSchema,
  MarkdownConfigSchema,
  TodoistConfigSchema,
  OutputConfigSchema,
  DEFAULT_CONFIG,
} from '@md2do/config';
```

## Usage Examples

### Global Configuration

Create `~/.md2do.json`:

```json
{
  "defaultAssignee": "yourname",
  "output": {
    "format": "pretty",
    "colors": true
  }
}
```

All projects will use these defaults.

### Project Configuration

Create `.md2do.json` in your project:

```json
{
  "markdown": {
    "root": "./documentation",
    "exclude": ["drafts/**"]
  },
  "todoist": {
    "defaultProject": "Work Project"
  }
}
```

This project will use its own settings, merged with global config.

### Environment Variables

```bash
# Set Todoist token via environment
export TODOIST_API_TOKEN="your-token-here"
export MD2DO_DEFAULT_ASSIGNEE="alice"

# Use in your application
node your-app.js
```

Environment variables have the highest precedence and will override file-based config.

### Multiple Todoist Accounts

Use different configs per project:

**Personal projects** (`~/personal/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "personal-token",
    "defaultProject": "Personal"
  }
}
```

**Work projects** (`~/work/.md2do.json`):

```json
{
  "todoist": {
    "apiToken": "work-token",
    "defaultProject": "Client Work"
  }
}
```

### Programmatic Usage

```typescript
import { loadConfig } from '@md2do/config';
import { TodoistClient } from '@md2do/todoist';

async function main() {
  // Load configuration
  const config = await loadConfig();

  // Use configuration
  if (!config.todoist?.apiToken) {
    throw new Error('Todoist API token not configured');
  }

  const client = new TodoistClient({
    apiToken: config.todoist.apiToken,
  });

  // Use the configured default project
  const projectName = config.todoist.defaultProject || 'Inbox';
  const project = await client.findProjectByName(projectName);

  console.log(`Using project: ${project?.name}`);
}

main();
```

## Security Best Practices

1. **Never commit tokens** - Add `.md2do.json` to `.gitignore`
2. **Use environment variables** - Especially for CI/CD
3. **Restrict file permissions**:
   ```bash
   chmod 600 ~/.md2do.json
   ```
4. **Share config structure, not secrets**:
   ```json
   {
     "todoist": {
       "defaultProject": "Team Project"
       // apiToken loaded from environment
     }
   }
   ```

## Error Handling

Invalid configurations throw validation errors:

```typescript
try {
  const config = validateConfig({
    todoist: {
      syncDirection: 'invalid', // Not 'push', 'pull', or 'both'
    },
  });
} catch (error) {
  console.error(error.message);
  // Invalid configuration: ...
}
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:run
```

## Related Packages

- **[@md2do/todoist](../todoist)** - Todoist API integration
- **[@md2do/core](../core)** - Core parsing and filtering
- **[@md2do/cli](../cli)** - Command-line interface

## Documentation

- [Main README](../../README.md) - Project overview
- [Todoist Setup Guide](../../docs/todoist-setup.md) - Complete configuration guide

## License

MIT
