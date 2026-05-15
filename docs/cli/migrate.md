# migrate

Migrate markdown files from legacy bracket syntax (`[due:...]`, `[completed:...]`, `[todoist:...]`) to the new tag/brace syntax (`#due:...`, `{completed:...}`, `{todoist:...}`).

## Usage

```bash
md2do migrate [options]
```

## Options

| Option                | Description                             | Default           |
| --------------------- | --------------------------------------- | ----------------- |
| `-p, --path <path>`   | Root directory to scan                  | Current directory |
| `--pattern <pattern>` | Glob pattern for markdown files         | `**/*.md`         |
| `--dry-run`           | Preview changes without modifying files | `false`           |

## How It Works

The migrate command scans all matching markdown files and converts legacy bracket syntax to the new format:

| Legacy Syntax             | New Syntax               |
| ------------------------- | ------------------------ |
| `[due: 2026-02-01]`       | `#due:2026-02-01`        |
| `[completed: 2026-01-15]` | `{completed:2026-01-15}` |
| `[todoist: 123456]`       | `{todoist:123456}`       |

Files that already use the new syntax are left unchanged. The migrator reports warnings for any lines it cannot automatically convert.

## Examples

### Preview changes (recommended first step)

```bash
md2do migrate --dry-run
```

Output:

```
tasks/home.md:
  L7:
    - - [ ] Pay electricity bill !! #bills [due: 2026-01-15]
    + - [ ] Pay electricity bill !! #bills #due:2026-01-15

  L12:
    - - [x] Fix leaky faucet [completed: 2026-01-10]
    + - [x] Fix leaky faucet {completed:2026-01-10}

[DRY RUN] 1 file(s) would be modified, 2 change(s), 0 warning(s)
```

### Apply migration

```bash
md2do migrate
```

### Migrate a specific directory

```bash
md2do migrate --path ./work-notes
```

### Migrate only files in a subdirectory

```bash
md2do migrate --pattern "projects/**/*.md"
```

## Notes

- **Non-destructive**: Legacy syntax is still parsed by all md2do tools, so migration is optional but recommended.
- **Idempotent**: Running migrate multiple times has no effect on already-migrated files.
- **Excludes**: `node_modules` and `.git` directories are automatically excluded.
- **Backup**: Consider committing your files before running migrate without `--dry-run`.

## Programmatic Usage

The migrator is also available as a library from `@md2do/core`:

```typescript
import { migrateContent } from '@md2do/core';

const result = migrateContent(markdownString);
// result.content   - migrated content
// result.changes   - array of { line, original, migrated }
// result.warnings  - array of { line, message }
```

## See Also

- [Task Format](/guide/task-format) - Full syntax reference including legacy format
- [CLI Overview](/cli/overview) - All CLI commands
