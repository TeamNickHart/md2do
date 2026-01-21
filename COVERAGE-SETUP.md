# Code Coverage Setup Summary

✅ **Coverage is now fully configured for VSCode and Claude Code!**

---

## What Was Configured

### 1. VSCode Integration

- ✅ `.vscode/settings.json` - Coverage Gutters configuration
- ✅ `.vscode/extensions.json` - Recommended extensions
- ✅ `.vscode/launch.json` - Debug configurations with coverage

### 2. Vitest Coverage

- ✅ All packages now have `lcov` reporter (for VSCode gutters)
- ✅ Coverage thresholds set:
  - Core, Config, Todoist: **80%**
  - CLI, MCP: **70%**
- ✅ Installed `@vitest/coverage-v8@^1.6.1`

### 3. npm Scripts

- ✅ `pnpm coverage` - Generate coverage for all packages
- ✅ `pnpm coverage:report` - Open HTML reports in browser
- ✅ `pnpm test:coverage:ui` - Interactive coverage UI
- ✅ `pnpm clean:coverage` - Clean coverage files

### 4. Documentation

- ✅ `COVERAGE-GUIDE.md` - Complete usage guide (11 sections)

---

## Quick Start

### Step 1: Install VSCode Extensions

**Required:**

- Coverage Gutters - `ryanluker.vscode-coverage-gutters`

**Recommended:**

- Vitest - `vitest.explorer`

Install via Command Palette:

```
Cmd+Shift+P → Extensions: Show Recommended Extensions
```

### Step 2: Generate Coverage

```bash
pnpm coverage
```

### Step 3: View Coverage in VSCode

1. Open any source file (e.g., `packages/core/src/parser/index.ts`)
2. Command Palette (`Cmd+Shift+P`) → "Coverage Gutters: Display Coverage"
3. See red/yellow/green gutters indicating coverage

### Step 4: View HTML Reports

```bash
pnpm coverage:report
```

Opens coverage reports in your browser.

---

## Current Coverage Results

**@md2do/core**: 🟢 97.24% (Excellent!)

```
File          | % Stmts | % Branch | % Funcs | % Lines
--------------|---------|----------|---------|--------
All files     |   97.24 |    92.85 |   98.07 |   97.24
```

---

## Using with Claude Code

### Ask Claude to Analyze Coverage

```
I just ran coverage. Can you check packages/core/coverage/index.html
and identify areas needing more tests?
```

### Ask Claude to Write Tests

```
The writer/index.ts file has 93.75% coverage with some uncovered lines
(251, 286-287, 331-335). Can you write tests to cover these edge cases?
```

### Ask for Coverage Strategy

```
What's the best approach to improve branch coverage in sorting/index.ts
from 89.65% to 95%+?
```

---

## VSCode Keyboard Shortcuts

| Action             | Shortcut (Mac) | Shortcut (Win/Linux) |
| ------------------ | -------------- | -------------------- |
| Toggle coverage    | `Cmd+Shift+7`  | `Ctrl+Shift+7`       |
| Next uncovered     | `Cmd+Shift+8`  | `Ctrl+Shift+8`       |
| Previous uncovered | `Cmd+Shift+9`  | `Ctrl+Shift+9`       |

---

## Files Created

1. **`.vscode/settings.json`** - VSCode workspace settings
2. **`.vscode/extensions.json`** - Recommended extensions
3. **`.vscode/launch.json`** - Debug configurations
4. **`vitest.workspace.ts`** - Vitest workspace config
5. **`COVERAGE-GUIDE.md`** - Complete 11-section guide
6. **`COVERAGE-SETUP.md`** - This file (quick reference)

---

## Coverage Files Generated

After running `pnpm coverage`, each package gets:

```
packages/core/coverage/
├── index.html          # HTML report (open in browser)
├── lcov.info           # VSCode Coverage Gutters
├── coverage-final.json # JSON data
└── ... other files
```

---

## Next Steps

1. **Install VSCode extensions** (Coverage Gutters)
2. **Run coverage**: `pnpm coverage`
3. **View in VSCode**: Toggle coverage gutters
4. **Read full guide**: `COVERAGE-GUIDE.md`
5. **Use with Claude**: Ask about uncovered code

---

## Troubleshooting

### Coverage gutters not showing?

1. Make sure extension is installed
2. Run `pnpm coverage` first
3. Command Palette → "Coverage Gutters: Reload Coverage"

### Coverage fails with threshold error?

Current thresholds:

- **Core/Config/Todoist**: 80%
- **CLI/MCP**: 70%

Write more tests or adjust thresholds in `packages/*/vitest.config.ts`

---

## Resources

- 📖 **Full Guide**: `COVERAGE-GUIDE.md`
- 🧪 **Vitest Docs**: https://vitest.dev/guide/coverage.html
- 🎨 **Coverage Gutters**: https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters

---

**You're all set! Happy testing! 🧪**
