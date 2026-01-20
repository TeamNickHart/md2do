# Contributing

Thank you for your interest in contributing to md2do!

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/TeamNickHart/md2do.git
cd md2do

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Development Workflow

### Project Structure

```
md2do/
├── packages/
│   ├── core/        # Task parsing and filtering
│   ├── config/      # Configuration management
│   ├── todoist/     # Todoist integration
│   ├── cli/         # Command-line interface
│   └── mcp/         # MCP server for AI
├── docs/            # VitePress documentation
└── README.md
```

### Making Changes

1. **Create a branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run validation:**

   ```bash
   pnpm validate
   ```

   This runs linting, type checking, formatting, and tests.

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Build/tooling changes

### Pull Requests

1. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request on GitHub

3. Ensure CI passes (lint, typecheck, tests)

4. Wait for review

## Development Commands

```bash
# Build all packages
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm typecheck

# Format code
pnpm format

# Check formatting
pnpm format:check

# Run all validations
pnpm validate
```

## Package-Specific Development

```bash
# Work on core package
pnpm --filter @md2do/core dev
pnpm --filter @md2do/core test

# Work on CLI
pnpm --filter @md2do/cli dev
pnpm link:cli  # Link CLI globally

# Work on MCP server
pnpm --filter @md2do/mcp dev
```

## Documentation

Edit docs in `docs/` directory:

```bash
# Start docs dev server
pnpm docs:dev

# Build docs
pnpm docs:build

# Preview built docs
pnpm docs:preview
```

## Testing

We use [Vitest](https://vitest.dev/) for testing:

- Write tests in `*.test.ts` files
- Aim for high coverage on new features
- Run tests before committing

## Code Style

- **TypeScript** strict mode
- **ESLint** for linting
- **Prettier** for formatting
- Pre-commit hooks enforce style

## Reporting Bugs

Open an issue on GitHub with:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, md2do version)

## Suggesting Features

Open a GitHub Discussion or Issue with:

- Use case description
- Proposed solution
- Alternative approaches considered

## Getting Help

- [GitHub Discussions](https://github.com/TeamNickHart/md2do/discussions) - Ask questions
- [GitHub Issues](https://github.com/TeamNickHart/md2do/issues) - Report bugs
- [Documentation](https://md2do.com) - Read the docs

## License

By contributing, you agree your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make md2do better for everyone. We appreciate your time and effort!
