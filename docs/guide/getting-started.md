# Getting Started

Get up and running with md2do in minutes.

## Installation

### Global Installation (Recommended)

Install md2do globally to use it anywhere:

::: code-group

```bash [npm]
npm install -g @md2do/cli
```

```bash [pnpm]
pnpm add -g @md2do/cli
```

```bash [yarn]
yarn global add @md2do/cli
```

:::

### Local Installation

Install in your project:

::: code-group

```bash [npm]
npm install @md2do/cli
```

```bash [pnpm]
pnpm add @md2do/cli
```

```bash [yarn]
yarn add @md2do/cli
```

:::

Then use via `npx`:

```bash
npx md2do list
```

### From Source

Clone and build from source:

```bash
git clone https://github.com/TeamNickHart/md2do.git
cd md2do
pnpm install
pnpm build
pnpm link:cli
```

## Quick Start

### 1. Create a Markdown File

Create a file called `tasks.md`:

```markdown
# My Tasks

- [ ] Review pull request @nick !! #code-review (2026-01-25)
- [ ] Update documentation @jane ! #docs
- [x] Fix bug in parser @alex !!! #bug (2026-01-18)
```

### 2. List Your Tasks

```bash
md2do list
```

You should see:

```
Found 3 tasks
  ✓ 1 completed | ○ 2 incomplete

  ○ !! Review pull request (2026-01-25) @nick #code-review
    file:///path/to/tasks.md:3

  ○ ! Update documentation @jane #docs
    file:///path/to/tasks.md:4

  ✓ !!! Fix bug in parser (2026-01-18) @alex #bug
    file:///path/to/tasks.md:5
```

### 3. Try Filtering

Filter by assignee:

```bash
md2do list --assignee nick
```

Filter by priority:

```bash
md2do list --priority urgent
```

Show only incomplete tasks:

```bash
md2do list --incomplete
```

### 4. View Statistics

Get a task breakdown:

```bash
md2do stats

# Group by assignee
md2do stats --by assignee

# Group by priority
md2do stats --by priority
```

## Next Steps

Now that you have md2do installed:

- **[Learn the task format](/guide/task-format)** - Understand all supported metadata
- **[Explore filtering](/guide/filtering)** - Master powerful filtering options
- **[Configure md2do](/guide/configuration)** - Set up defaults and preferences
- **[Set up Todoist](/integrations/todoist)** - Enable Todoist synchronization
- **[Try AI integration](/integrations/mcp)** - Use Claude Code with md2do

## Getting Help

If you run into issues:

- Check the [CLI Reference](/cli/overview) for command documentation
- Browse [Examples](/guide/examples) for common use cases
- Open an issue on [GitHub](https://github.com/TeamNickHart/md2do/issues)
