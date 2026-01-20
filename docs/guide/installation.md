# Installation

Install md2do globally or use it in your project.

## Global Installation

Install once, use everywhere:

```bash
npm install -g @md2do/cli
```

Verify installation:

```bash
md2do --version
```

## Project Installation

Install in your project:

```bash
# Using npm
npm install @md2do/cli

# Using pnpm
pnpm add @md2do/cli

# Using yarn
yarn add @md2do/cli
```

Use with npx:

```bash
npx md2do list
```

## From Source

For development or latest features:

```bash
# Clone the repository
git clone https://github.com/TeamNickHart/md2do.git
cd md2do

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Link CLI globally
pnpm link:cli
```

Now `md2do` command is available globally.

## Requirements

- **Node.js**: >= 18.0.0
- **npm/pnpm/yarn**: Latest version recommended

Check your Node version:

```bash
node --version
```

If you need to upgrade, visit [nodejs.org](https://nodejs.org/).

## Verify Installation

```bash
# Check version
md2do --version

# Run help
md2do --help

# List tasks in current directory
md2do list
```

## Optional: Todoist Integration

If using Todoist, get your API token:

1. Visit [Todoist Settings](https://app.todoist.com/app/settings/integrations/developer)
2. Copy your API token
3. Set environment variable:

```bash
export TODOIST_API_TOKEN="your-token"
```

See [Todoist Integration](/integrations/todoist) for details.

## Optional: MCP Server

For Claude Code integration, build the MCP server:

```bash
cd md2do
pnpm --filter @md2do/mcp build
```

See [MCP Integration](/integrations/mcp) for setup.

## Updating

Keep md2do up to date:

```bash
# Global installation
npm update -g @md2do/cli

# Project installation
npm update @md2do/cli
```

## Uninstall

Remove md2do:

```bash
# Global
npm uninstall -g @md2do/cli

# Project
npm uninstall @md2do/cli
```

## Troubleshooting

### Command not found

If `md2do` isn't found after global install:

```bash
# Check npm global bin path
npm bin -g

# Add to PATH if needed (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$(npm bin -g)"
```

### Permission errors (npm)

On Unix, avoid using `sudo` with npm. Instead, configure npm to install globally without sudo:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

Add the export to your `~/.bashrc` or `~/.zshrc`.

### Using with pnpm

pnpm handles global binaries differently:

```bash
pnpm add -g @md2do/cli

# Use pnpm bin path
export PATH="$HOME/.local/share/pnpm:$PATH"
```

## Next Steps

- [Getting Started](/guide/getting-started) - Your first tasks
- [Task Format](/guide/task-format) - Learn the syntax
- [Configuration](/guide/configuration) - Set up config files
