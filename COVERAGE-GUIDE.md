# Code Coverage Guide for md2do

This guide explains how to use code coverage in VSCode and with Claude Code to improve test quality and identify gaps.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [VSCode Setup](#vscode-setup)
3. [Generating Coverage Reports](#generating-coverage-reports)
4. [Using Coverage Gutters in VSCode](#using-coverage-gutters-in-vscode)
5. [Coverage with Claude Code](#coverage-with-claude-code)
6. [Coverage Thresholds](#coverage-thresholds)
7. [Interpreting Coverage Reports](#interpreting-coverage-reports)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Generate coverage for all packages
pnpm coverage

# View HTML reports
pnpm coverage:report

# Run tests with coverage in watch mode
pnpm test:coverage:ui
```

---

## VSCode Setup

### 1. Install Required Extensions

The project recommends these extensions (see `.vscode/extensions.json`):

**Essential for Coverage:**

- **Coverage Gutters** - `ryanluker.vscode-coverage-gutters`
  - Shows coverage inline in editor
  - Red/yellow/green gutters indicate uncovered/partially covered/covered lines

**Recommended:**

- **Vitest** - `vitest.explorer`
  - Run tests directly from VSCode
  - See test results in sidebar

Install from VSCode:

1. Press `Cmd+Shift+X` (or `Ctrl+Shift+X` on Windows/Linux)
2. Search for "Coverage Gutters"
3. Click "Install"

Or install all recommended extensions:

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Extensions: Show Recommended Extensions"
3. Click "Install Workspace Recommended Extensions"

### 2. VSCode Settings

The project includes `.vscode/settings.json` with coverage settings pre-configured:

```json
{
  "coverage-gutters.coverageFileNames": [
    "coverage/lcov.info",
    "packages/*/coverage/lcov.info",
    "**/coverage/lcov.info"
  ],
  "coverage-gutters.showLineCoverage": true,
  "coverage-gutters.showRulerCoverage": true,
  "coverage-gutters.showGutterCoverage": true
}
```

**Color Coding:**

- 🟢 **Green** = Covered lines
- 🟡 **Yellow** = Partially covered (e.g., branches not all taken)
- 🔴 **Red** = Uncovered lines

---

## Generating Coverage Reports

### Option 1: Generate All Coverage (Recommended)

```bash
# Run all tests with coverage
pnpm coverage
```

This generates:

- `packages/*/coverage/lcov.info` - VSCode gutter data
- `packages/*/coverage/index.html` - HTML reports
- `packages/*/coverage/coverage-final.json` - JSON data
- Terminal summary with percentages

### Option 2: Generate Coverage for Specific Package

```bash
# Core package only
pnpm --filter @md2do/core test run --coverage

# CLI package only
pnpm --filter @md2do/cli test run --coverage

# Todoist package only
pnpm --filter @md2do/todoist test run --coverage
```

### Option 3: Watch Mode with Coverage

```bash
# Run tests in watch mode with coverage UI
pnpm test:coverage:ui
```

Opens Vitest UI in browser with coverage visualization.

---

## Using Coverage Gutters in VSCode

### Step-by-Step Workflow

#### 1. Generate Coverage

```bash
pnpm coverage
```

#### 2. Activate Coverage Gutters

**Option A: Command Palette**

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Coverage Gutters: Display Coverage"
3. Press Enter

**Option B: Status Bar**

1. Look for "Watch" button in bottom status bar
2. Click to activate coverage display

#### 3. View Coverage in Editor

Open any source file (e.g., `packages/core/src/parser/index.ts`):

```typescript
// Green gutter = covered
export function extractAssignee(text: string): string | undefined {
  const match = text.match(/@([\w-]+)/); // ✅ Covered
  return match?.[1]; // ✅ Covered
}

// Red gutter = not covered
export function newUntestedFunction() {
  console.log('This has no tests'); // ❌ Not covered
}
```

#### 4. Navigate to Uncovered Code

**Keyboard Shortcuts:**

- `Cmd+Shift+7` (Mac) / `Ctrl+Shift+7` (Win/Linux) - Toggle coverage
- `Cmd+Shift+8` / `Ctrl+Shift+8` - Next uncovered region
- `Cmd+Shift+9` / `Ctrl+Shift+9` - Previous uncovered region

**Manual Navigation:**

- Look for red/yellow gutters
- Click on uncovered line numbers
- Write tests for that code

#### 5. Refresh Coverage After Adding Tests

After writing new tests:

```bash
# Re-run coverage
pnpm coverage

# Coverage gutters will auto-refresh
# Or manually refresh: Cmd+Shift+P -> "Coverage Gutters: Reload Coverage"
```

---

## Coverage with Claude Code

### Using Claude to Improve Coverage

Claude Code can help you achieve better test coverage by:

1. **Identifying uncovered code**
2. **Writing tests for uncovered lines**
3. **Improving test quality**

### Example Workflow

#### 1. Generate and Share Coverage Report

```bash
pnpm coverage
```

Then ask Claude:

```
I just ran coverage. Can you read the coverage report and identify
the top 5 functions/modules with the lowest coverage?
```

#### 2. Ask Claude to Write Tests

```
The function `extractPriority` in packages/core/src/parser/index.ts
has only 60% branch coverage. Can you write additional tests to
cover all branches?
```

#### 3. Review Coverage HTML Reports

```bash
# Open HTML reports
pnpm coverage:report
```

Take a screenshot or share specific coverage data:

```
In packages/core/coverage/index.html, the file filters/index.ts shows:
- Lines: 85%
- Branches: 70%
- Functions: 90%

Can you help improve branch coverage to 80%+?
```

#### 4. Ask for Coverage Strategy

```
What's the best strategy to improve coverage for the MCP package
from 65% to 75% without writing superficial tests?
```

### Tips for Working with Claude on Coverage

✅ **DO:**

- Share specific file paths and line numbers
- Paste coverage percentages from reports
- Ask for test strategies, not just test code
- Review Claude's tests for quality, not just coverage numbers

❌ **DON'T:**

- Chase 100% coverage blindly
- Write tests just to hit numbers
- Test trivial code (getters, setters, simple types)
- Skip edge cases to inflate coverage

---

## Coverage Thresholds

### Current Thresholds

Each package has coverage thresholds in `vitest.config.ts`:

**High Coverage Packages** (80% threshold):

- `@md2do/core` - Core parsing and filtering
- `@md2do/config` - Configuration management
- `@md2do/todoist` - Todoist integration

**Medium Coverage Packages** (70% threshold):

- `@md2do/cli` - Command-line interface
- `@md2do/mcp` - MCP server (newer code)

### What Happens When Thresholds Fail?

If coverage drops below threshold, tests fail:

```bash
$ pnpm test:coverage

❌ ERROR: Coverage for lines (75%) does not meet threshold (80%)
❌ ERROR: Coverage for branches (68%) does not meet threshold (80%)
```

**Fix:**

1. Write more tests to cover missing lines/branches
2. Or adjust thresholds (if justified)

### Adjusting Thresholds

Edit `packages/<name>/vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,      // Decrease to 75 if justified
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

**When to Lower Thresholds:**

- New package (start at 60-70%, increase over time)
- Experimental features
- UI/CLI code (harder to test)

**When to Increase Thresholds:**

- Core business logic (aim for 90%+)
- Critical paths (authentication, data integrity)
- After achieving higher coverage

---

## Interpreting Coverage Reports

### Terminal Summary

```bash
$ pnpm coverage

 % Coverage report from v8
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.23 |    78.45 |   89.12 |   85.23 |
 parser             |   92.10 |    85.30 |   95.00 |   92.10 |
  index.ts          |   95.50 |    90.20 |  100.00 |   95.50 |
  patterns.ts       |   88.70 |    80.40 |   90.00 |   88.70 |
 filters            |   78.35 |    71.60 |   83.24 |   78.35 |
  index.ts          |   78.35 |    71.60 |   83.24 |   78.35 |
--------------------|---------|----------|---------|---------|
```

**What Each Metric Means:**

- **Statements** - Individual code statements executed
- **Branches** - `if/else`, `switch`, ternary operators
- **Functions** - Function definitions called
- **Lines** - Physical lines of code executed

**Rule of Thumb:**

- **90%+** = Excellent
- **80-89%** = Good
- **70-79%** = Acceptable
- **<70%** = Needs improvement

### HTML Report Details

Open in browser: `packages/*/coverage/index.html`

**Features:**

- 📊 Visual coverage bars
- 📁 Drill down into files/folders
- 🔍 See exact uncovered lines highlighted
- 📈 Branch coverage details

**How to Use:**

1. Click folder to drill down
2. Click file to see line-by-line coverage
3. Uncovered lines highlighted in red
4. Partially covered lines (branches) in yellow
5. Click line numbers to see which branches weren't taken

---

## Troubleshooting

### Coverage Gutters Not Showing

**Problem:** No red/green gutters in editor

**Solutions:**

1. **Check lcov.info exists:**

   ```bash
   ls -la packages/*/coverage/lcov.info
   ```

2. **Regenerate coverage:**

   ```bash
   pnpm coverage
   ```

3. **Reload Coverage Gutters:**
   - Command Palette → "Coverage Gutters: Reload Coverage"

4. **Check VSCode settings:**
   - Make sure `coverage-gutters.coverageFileNames` includes `lcov.info`

5. **Restart VSCode:**
   - Close and reopen VSCode

### Coverage Reports Not Generating

**Problem:** No `coverage/` folder created

**Solutions:**

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Check Vitest config:**
   - Ensure `packages/*/vitest.config.ts` has `coverage` section
   - Verify `reporter: ['lcov']` is included

3. **Run with explicit coverage flag:**
   ```bash
   pnpm --filter @md2do/core test run --coverage
   ```

### Tests Pass But Coverage Fails

**Problem:** Tests succeed but coverage check fails

**Reason:** Coverage below threshold

**Solutions:**

1. **Check which threshold failed:**

   ```bash
   pnpm test:coverage
   # Look for "Coverage for X does not meet threshold"
   ```

2. **Write more tests** to cover missing code

3. **Temporarily lower threshold** (if justified):
   - Edit `vitest.config.ts`
   - Lower `thresholds` values
   - Document why in comments

### Coverage Shows 100% But Tests Don't Cover Edge Cases

**Problem:** High coverage numbers, poor test quality

**This is called "coverage theatre"**

**Solution:**

✅ **Focus on test quality:**

- Test edge cases, not just happy paths
- Test error handling
- Test boundary conditions
- Review tests for assertions, not just execution

❌ **Don't:**

- Write tests just to hit 100%
- Skip assertions
- Test trivial code

---

## Best Practices

### 1. Use Coverage to Find Gaps, Not as a Goal

Coverage is a **tool to identify untested code**, not a goal in itself.

✅ Good: "Our parser has 92% coverage, but edge case X isn't tested. Let's add a test."
❌ Bad: "We need to hit 95% coverage. Add tests for anything."

### 2. Focus on Critical Paths

Prioritize coverage for:

- Core business logic
- Data transformations
- Error handling
- Edge cases

Lower priority:

- Type definitions
- Simple getters/setters
- Trivial helper functions

### 3. Review Coverage in PRs

Before merging:

1. Run `pnpm coverage`
2. Check if coverage increased/decreased
3. Review uncovered lines for critical code
4. Add tests if needed

### 4. Combine with Other Metrics

Coverage is **one indicator** of code quality:

- ✅ Code coverage (execution)
- ✅ Mutation testing (test effectiveness)
- ✅ Code review (logic correctness)
- ✅ Integration tests (end-to-end flows)

### 5. Set Realistic Thresholds

**Start low, increase gradually:**

- New package: 60-70%
- Mature package: 80-85%
- Critical package: 85-90%
- Perfect: Not necessary (90%+ is excellent)

---

## Useful Commands Summary

```bash
# Generate coverage for all packages
pnpm coverage

# Generate coverage for specific package
pnpm --filter @md2do/core test run --coverage

# View HTML reports
pnpm coverage:report

# Run tests with coverage UI
pnpm test:coverage:ui

# Clean coverage reports
pnpm clean:coverage

# Generate coverage + open reports
pnpm coverage && pnpm coverage:report
```

---

## VSCode Keyboard Shortcuts

| Action                    | Mac             | Windows/Linux   |
| ------------------------- | --------------- | --------------- |
| Toggle coverage display   | `Cmd+Shift+7`   | `Ctrl+Shift+7`  |
| Next uncovered region     | `Cmd+Shift+8`   | `Ctrl+Shift+8`  |
| Previous uncovered region | `Cmd+Shift+9`   | `Ctrl+Shift+9`  |
| Reload coverage           | Command Palette | Command Palette |

---

## Resources

- [Vitest Coverage Docs](https://vitest.dev/guide/coverage.html)
- [Coverage Gutters Extension](https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters)
- [Vitest Extension](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)

---

**Happy testing! 🧪**
