# CI Coverage Check Guide

This guide explains how code coverage works in our CI/CD pipeline and how to handle coverage failures.

---

## Overview

Every pull request and push to `main` automatically:

1. ✅ Runs all tests with coverage
2. 📊 Generates coverage reports
3. 🚨 **Fails if coverage thresholds aren't met**
4. 💬 Comments coverage summary on PRs
5. 📤 Uploads coverage to Codecov

---

## Coverage Thresholds

### Per-Package Thresholds

Defined in each `packages/*/vitest.config.ts`:

| Package            | Threshold | Current   | Rationale                                       |
| ------------------ | --------- | --------- | ----------------------------------------------- |
| **@md2do/core**    | 80%       | 97.24% ✅ | Core business logic - critical                  |
| **@md2do/config**  | 80%       | 91.5% ✅  | Configuration - important                       |
| **@md2do/todoist** | 50%\*     | 51.25% ✅ | \*Temporary - needs client.ts tests (goal: 80%) |
| **@md2do/cli**     | None\*    | 0%        | \*Disabled - needs unit tests (goal: 70%)       |
| **@md2do/mcp**     | None\*    | 0%        | \*Disabled - needs initial tests (goal: 70%)    |

### Project-Level Threshold (Codecov)

**Overall project**: Allow 2% drop from previous coverage

**New code (patches)**: Must be 80%+ covered

---

## What Happens in CI

### 1. Coverage Job Runs

```yaml
- name: Run tests with coverage
  run: pnpm test:coverage
```

This runs ALL tests with coverage enabled and checks thresholds.

### 2. Threshold Check

**If coverage is below threshold:**

```
❌ ERROR: Coverage for lines (75%) does not meet threshold (80%)
```

**The build FAILS** ❌

### 3. Coverage Upload

Coverage reports are uploaded to:

- **Codecov** - Web-based coverage visualization
- **GitHub Artifacts** - Downloadable coverage reports (30-day retention)

### 4. PR Comment

On pull requests, a bot comments with:

```markdown
📊 Coverage Report

| File             | Coverage |
| ---------------- | -------- |
| parser/index.ts  | 95% ✅   |
| filters/index.ts | 78% ⚠️   |
```

---

## Handling Coverage Failures

### Scenario 1: Coverage Dropped Below Threshold

**Error:**

```
❌ ERROR: Coverage for branches (75%) does not meet threshold (80%)
```

**Solution:**

1. **Check what's uncovered:**

   ```bash
   pnpm test:coverage
   pnpm coverage:report
   ```

2. **Write tests for uncovered code:**
   - Focus on uncovered branches (if/else, switch)
   - Add edge case tests
   - Test error conditions

3. **Verify locally:**

   ```bash
   pnpm test:coverage
   # Should pass now
   ```

4. **Push changes:**
   ```bash
   git add .
   git commit -m "test: improve coverage for filters module"
   git push
   ```

### Scenario 2: New Code Not Sufficiently Tested

**Codecov Status:**

```
❌ Patch coverage: 65% (target: 80%)
```

**Solution:**

1. **Identify new code:**
   - Check Codecov PR comment
   - Look at files you added/modified

2. **Add tests for new code:**
   - Every new function should have tests
   - Every new branch should be tested

3. **Aim for 80%+ on new code:**
   ```bash
   # Test your new code
   pnpm --filter @md2do/core test run --coverage
   ```

### Scenario 3: Legacy Code Without Tests

**Problem:** You're modifying old code with poor coverage

**Options:**

**Option A: Add Tests (Recommended)**

```bash
# Add tests for the legacy code you're touching
```

**Option B: Temporarily Lower Threshold**

```typescript
// packages/*/vitest.config.ts
coverage: {
  thresholds: {
    lines: 75,  // Lowered from 80
    // Document why in PR description
  },
}
```

⚠️ **Only do this if:**

- You document the reason in PR
- You create a follow-up issue to improve coverage
- The code is genuinely hard to test (UI, external dependencies)

### Scenario 4: Threshold Too High for New Package

**Problem:** New experimental package can't hit 80%

**Solution:**

Lower threshold temporarily:

```typescript
// packages/new-feature/vitest.config.ts
coverage: {
  thresholds: {
    lines: 60,  // Start low
    functions: 60,
    branches: 60,
    statements: 60,
  },
}
```

Create an issue to track improvement:

```
📊 [Coverage] Improve @md2do/new-feature from 60% to 80%
```

---

## Viewing Coverage Reports in CI

### Method 1: Codecov Dashboard

1. Go to: https://codecov.io/gh/TeamNickHart/md2do
2. Click on your PR or commit
3. Browse file-by-file coverage

### Method 2: GitHub Artifacts

1. Go to your PR → "Checks" tab
2. Find "Coverage Check" job
3. Scroll to "Artifacts"
4. Download "coverage-reports.zip"
5. Extract and open `packages/*/coverage/index.html`

### Method 3: PR Comment

Codecov bot comments on PRs with coverage diff:

```markdown
📊 Coverage: 85.23% (+2.1%)

| File      | Coverage | Δ      |
| --------- | -------- | ------ |
| parser.ts | 95%      | +3% ⬆️ |
```

---

## Best Practices

### ✅ DO

1. **Write tests BEFORE pushing**

   ```bash
   pnpm test:coverage
   # Check coverage locally first
   ```

2. **Aim for higher than threshold**
   - Threshold is minimum, not goal
   - Aim for 85-90%+ on new code

3. **Test edge cases**
   - Don't just test happy path
   - Test error conditions
   - Test boundary values

4. **Check coverage diff**
   - Look at Codecov PR comment
   - Make sure you didn't decrease coverage

### ❌ DON'T

1. **Don't lower thresholds without justification**
   - Document why in PR
   - Create follow-up issue

2. **Don't write superficial tests**
   - Tests should assert behavior
   - Not just execute code

3. **Don't ignore coverage failures**
   - Fix them or document why you can't

4. **Don't test trivial code**
   - Simple getters/setters don't need tests
   - Focus on logic and edge cases

---

## Debugging Coverage Failures

### 1. Reproduce Locally

```bash
# Run exactly what CI runs
pnpm test:coverage
```

### 2. Check Specific Package

```bash
# Test one package
pnpm --filter @md2do/core test run --coverage

# Check its threshold
cat packages/core/vitest.config.ts
```

### 3. View Detailed Report

```bash
pnpm coverage:report
# Opens HTML reports in browser
```

### 4. Find Uncovered Lines

Look at HTML report:

- Red lines = uncovered
- Yellow lines = partially covered (branches)
- Green lines = covered

---

## Codecov Setup

### Adding Codecov Token (Maintainers Only)

1. Go to https://codecov.io
2. Sign in with GitHub
3. Add repository
4. Copy upload token
5. Add to GitHub Secrets:
   - Repository → Settings → Secrets
   - Add `CODECOV_TOKEN`

### Codecov Configuration

File: `codecov.yml`

**Key settings:**

- Allow 2% coverage drop
- Require 80% for new code
- Ignore test files and examples
- Per-package tracking

---

## FAQ

### Q: Why did my PR fail with "Coverage: 79.8%"?

**A:** Your coverage is below the 80% threshold. Add more tests.

### Q: Can I skip coverage checks?

**A:** No, coverage is required. You can temporarily lower thresholds with justification.

### Q: I added tests but coverage still fails?

**A:** Make sure you're testing the right code:

1. Check if test file is excluded
2. Verify test actually runs
3. Check if assertions are correct

### Q: Coverage passed locally but fails in CI?

**A:** Possible causes:

- Different Node.js version
- Cached coverage files (run `pnpm clean:coverage`)
- Different package versions

### Q: Should I aim for 100% coverage?

**A:** No, 80-90% is excellent. Focus on:

- Critical paths
- Edge cases
- Error handling

Not worth testing:

- Trivial getters/setters
- Type definitions
- Logging statements

### Q: How do I test code that's hard to test?

**A:** Options:

1. Refactor to make testable
2. Use mocks/stubs
3. Integration tests
4. Document why untested in code comments

---

## Coverage Badges

Add coverage badge to README:

```markdown
[![codecov](https://codecov.io/gh/TeamNickHart/md2do/branch/main/graph/badge.svg)](https://codecov.io/gh/TeamNickHart/md2do)
```

Shows current coverage visually:

- 🟢 Green: >80%
- 🟡 Yellow: 70-80%
- 🔴 Red: <70%

---

## Related Documentation

- **COVERAGE-GUIDE.md** - Local coverage usage
- **COVERAGE-SETUP.md** - Initial setup
- **.github/workflows/ci.yml** - CI configuration
- **codecov.yml** - Codecov settings

---

**Questions?** Open an issue with the `coverage` label.
