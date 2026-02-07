# Publishing Node.js Projects: A Complete Guide

> **Based on real-world experience from the md2do project**
>
> This guide documents everything learned while setting up automated publishing for md2do - a TypeScript monorepo with npm packages and a VSCode extension. All examples reference working files from this repository.

## Table of Contents

- [Overview](#overview)
- [Part 1: npm Publishing with OIDC Trusted Publishing](#part-1-npm-publishing-with-oidc-trusted-publishing)
- [Part 2: VSCode Marketplace Publishing](#part-2-vscode-marketplace-publishing)
- [Part 3: Smart CI with Conditional Jobs](#part-3-smart-ci-with-conditional-jobs)
- [Part 4: GitHub Actions Best Practices](#part-4-github-actions-best-practices)
- [Part 5: New Project Checklist](#part-5-new-project-checklist)
- [Part 6: Troubleshooting Guide](#part-6-troubleshooting-guide)
- [Part 7: Anti-Patterns (What NOT to Do)](#part-7-anti-patterns-what-not-to-do)
- [Appendix: Template Files](#appendix-template-files)

---

## Overview

### What You'll Learn

This guide teaches you how to set up:

1. **npm Publishing with OIDC Trusted Publishing** - Secure, token-free publishing to npmjs.com
2. **VSCode Marketplace Publishing** - Automated extension releases
3. **Smart CI Optimization** - Conditional quality checks (3x faster for docs-only changes)
4. **Modern GitHub Actions Patterns** - Caching, parallelization, and best practices

### Why This Guide Exists

While setting up md2do's publishing infrastructure, we encountered dozens of edge cases, confusing errors, and undocumented gotchas. This guide captures all those lessons so you don't have to repeat the same trial-and-error process.

### Prerequisites

- GitHub repository
- npm account (for npm publishing)
- Node.js 20+ installed locally
- Basic familiarity with GitHub Actions
- For VSCode extensions: Microsoft marketplace publisher account

---

## Part 1: npm Publishing with OIDC Trusted Publishing

### What is OIDC Trusted Publishing?

OIDC (OpenID Connect) Trusted Publishing allows GitHub Actions to publish to npm **without long-lived authentication tokens**. Instead, GitHub and npm use short-lived tokens that are automatically exchanged during the workflow run.

**Benefits:**

- ✅ No `NPM_TOKEN` secrets to manage
- ✅ Automatic rotation (tokens expire after minutes)
- ✅ Reduced risk of token leaks
- ✅ Official npm recommendation

**How it works:**

1. You configure npm to "trust" your GitHub repository
2. During workflow execution, GitHub generates a short-lived OIDC token
3. npm exchanges this for a publishing token
4. npm package is published
5. Token expires automatically

### Prerequisites

- Node.js **20.17.0 or higher** (for npm 11.5.1+ which has OIDC support)
- npm account with 2FA enabled
- GitHub repository with Actions enabled
- Changesets for version management (optional but recommended)

### Step 1: Update Node.js Version

**Critical:** OIDC requires npm 11.5.1+, which requires Node.js 20.17.0+.

**Update package.json:**

```json
{
  "engines": {
    "node": ">=20.17.0",
    "npm": ">=11.5.1"
  }
}
```

**Update GitHub Actions workflows to use Node 20:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20' # Changed from '18'
```

**Our experience:** We initially tried with Node 18 and got cryptic authentication errors. Upgrading to Node 20 fixed everything.

### Step 2: Configure npm Trusted Publisher

1. **Go to npmjs.com** → Account Settings → Publishing Access → [Trusted Publishers](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)

2. **Click "Add Trusted Publisher"**

3. **Fill in the form:**
   - **Provider:** GitHub
   - **Repository owner:** `YOUR_GITHUB_USERNAME` (e.g., `TeamNickHart`)
   - **Repository name:** `YOUR_REPO_NAME` (e.g., `md2do`)
   - **Workflow filename:** `publish.yml` ⚠️ **Must match exactly**
   - **Environment:** Leave blank (unless you use GitHub Environments)

4. **Save**

5. **Repeat for each package** if you have a monorepo:
   - For `@md2do/cli`, configure package name: `@md2do/cli`
   - For `@md2do/core`, configure package name: `@md2do/core`
   - And so on...

**Important notes:**

- The workflow filename field is **exact** - `publish.yml` not `.github/workflows/publish.yml`
- If using environments, you must specify the environment name
- Each package needs its own trusted publisher configuration

### Step 3: Create GitHub Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  push:
    branches:
      - main

# Concurrency prevents multiple publish runs at once
concurrency: ${{ github.workflow }}-${{ github.ref }}

# CRITICAL: id-token: write enables OIDC
permissions:
  contents: write
  pull-requests: write
  id-token: write # Required for OIDC

jobs:
  publish:
    name: Publish to npm
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      # IMPORTANT: Upgrade npm to latest for OIDC support
      - name: Upgrade npm for OIDC support
        run: npm install -g npm@latest

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9
          run_install: false

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      # Using changesets for version management
      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          version: pnpm version
          publish: pnpm release
          title: 'chore: version packages'
          commit: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # NO NPM_TOKEN needed! OIDC handles authentication
```

**Working example:** [`.github/workflows/publish.yml`](https://github.com/TeamNickHart/md2do/blob/main/.github/workflows/publish.yml)

### Step 4: Add Release Script

Add to your root `package.json`:

```json
{
  "scripts": {
    "release": "pnpm changeset publish"
  }
}
```

### Step 5: Test the Workflow

1. **Create a changeset:**

   ```bash
   npx changeset
   # Select packages to bump
   # Choose version bump type (patch/minor/major)
   # Write summary
   ```

2. **Commit and push:**

   ```bash
   git add .
   git commit -m "chore: add changeset for feature"
   git push
   ```

3. **The workflow will:**
   - Create a "Version Packages" PR if there are changesets
   - OR publish directly if the changeset has already been merged

4. **Merge the Version Packages PR** to trigger publishing

5. **Check npm** - Your packages should appear within minutes!

### Common Issues (We Encountered)

#### Issue: "401 Unauthorized" when publishing

**Cause:** Node.js version too old (< 20.17.0)

**Solution:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20' # Must be 20+

- name: Upgrade npm for OIDC support
  run: npm install -g npm@latest
```

#### Issue: "Workflow filename mismatch"

**Cause:** Workflow filename on npm doesn't match actual file

**Solution:** Double-check the filename is exactly `publish.yml` (not `npm-publish.yml` or similar)

#### Issue: "Missing registry-url"

**Cause:** `setup-node` needs to know which registry to configure

**Solution:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://registry.npmjs.org' # Required
```

---

## Part 2: VSCode Marketplace Publishing

### Overview

Publishing VSCode extensions to the marketplace can be automated through GitHub Actions using a Personal Access Token (PAT).

### Prerequisites

- VSCode extension package
- Microsoft Azure account (free)
- Publisher ID created on marketplace

### Step 1: Create Azure Personal Access Token

1. **Go to** [https://dev.azure.com/](https://dev.azure.com/)

2. **Click** User Settings (top right) → Personal Access Tokens

3. **Create new token:**
   - Name: `VSCode Marketplace Publishing`
   - Organization: All accessible organizations
   - Expiration: 90 days (or custom)
   - Scopes: **Marketplace** → **Manage** (full access)

4. **Copy the token** - you won't see it again!

### Step 2: Add GitHub Secret

1. **Go to** your GitHub repo → Settings → Secrets and variables → Actions

2. **Create new secret:**
   - Name: `VSCE_PAT`
   - Value: (paste the Azure PAT)

### Step 3: Create Release Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  release:
    types: [published]
  workflow_dispatch: # Manual trigger for testing

permissions:
  contents: write
  id-token: write

jobs:
  publish-vscode:
    name: Publish VSCode Extension
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9
          run_install: false

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # CRITICAL: Build ALL packages in workspace first
      - name: Build all packages
        run: pnpm build

      - name: Package VSCode extension
        run: |
          cd packages/vscode
          npx @vscode/vsce package --no-dependencies

      - name: Get extension version
        id: version
        run: |
          VERSION=$(node -p "require('./packages/vscode/package.json').version")
          echo "VERSION=$VERSION" >> $GITHUB_OUTPUT

      - name: Publish to VSCode Marketplace
        run: |
          cd packages/vscode
          npx @vscode/vsce publish --packagePath md2do-vscode-${{ steps.version.outputs.VERSION }}.vsix
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}

      # Optional: Upload .vsix to GitHub Release
      - name: Upload .vsix to GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: packages/vscode/md2do-vscode-${{ steps.version.outputs.VERSION }}.vsix
          tag_name: ${{ github.event.release.tag_name }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Working example:** [`.github/workflows/release.yml`](https://github.com/TeamNickHart/md2do/blob/main/.github/workflows/release.yml)

### Step 4: Test with Manual Trigger

**Don't wait for a real release to test!** Use `workflow_dispatch`:

1. **Go to** GitHub repo → Actions tab

2. **Select** "Release" workflow

3. **Click** "Run workflow" → Run workflow

4. **Check** the Marketplace after ~5 minutes

### Common Issues (We Encountered)

#### Issue: "Could not resolve @package/name"

**Cause:** VSCode extension depends on workspace packages that weren't built

**Our mistake:** We tried `pnpm --filter md2do-vscode build` which only built the extension

**Solution:** Build the ENTIRE workspace first:

```yaml
- name: Build all packages
  run: pnpm build # Not pnpm --filter vscode build
```

#### Issue: "Upload .vsix to GitHub Release" fails on manual trigger

**Cause:** No release tag when using `workflow_dispatch`

**Solution:** This is expected - the upload step only works for actual releases. Use `if: github.event_name == 'release'` to make it conditional:

```yaml
- name: Upload .vsix to GitHub Release
  if: github.event_name == 'release'
  uses: softprops/action-gh-release@v1
  # ...
```

#### Issue: Release workflow never triggers on GitHub Release

**Cause:** We never figured out why! 🤷

**Workaround:** Use manual triggering via `workflow_dispatch` - it works perfectly and gives you more control anyway.

---

## Part 3: Smart CI with Conditional Jobs

### The Problem

Standard CI runs all quality checks (lint, build, typecheck, test, coverage) on **every** PR, even when you only change documentation. This wastes time and CI minutes.

**Example:** Fixing a typo in README.md triggers:

- ✅ Format check (useful)
- ❌ TypeScript type checking (unnecessary)
- ❌ Build (unnecessary)
- ❌ Tests (unnecessary)
- ❌ Linting (unnecessary)
- ❌ Coverage (unnecessary)

**Result:** ~90 seconds for a docs fix

### The Solution

Use file change detection to conditionally run jobs:

- **Docs-only changes:** Run format check only (~30s)
- **Code changes:** Run all quality checks (~90s)

**3x speedup for docs PRs!**

### Implementation

We use [`dorny/paths-filter@v3`](https://github.com/dorny/paths-filter) - an industry-standard action for file change detection.

#### Step 1: Add Change Detection Job

Add this job to `.github/workflows/ci.yml`:

```yaml
jobs:
  # Job 0: Detect which files changed
  detect-changes:
    name: Detect Changes
    runs-on: ubuntu-latest
    outputs:
      docs: ${{ steps.filter.outputs.docs }}
      workflows: ${{ steps.filter.outputs.workflows }}
      code: ${{ steps.filter.outputs.code }}
      config: ${{ steps.filter.outputs.config }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Check which files changed
        uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            docs:
              - 'docs/**'
              - '**/*.md'
              - 'examples/**'
              - '.private/**'
            workflows:
              - '.github/workflows/**'
            code:
              - 'packages/*/src/**'
              - 'packages/**/*.ts'
              - 'packages/**/*.tsx'
              - '*.ts'
              - '*.tsx'
            config:
              - 'package.json'
              - 'pnpm-lock.yaml'
              - '**/package.json'
              - '**/tsconfig.json'
              - '.prettierrc*'
              - '.eslintrc*'
```

#### Step 2: Make Jobs Conditional

Add `needs` and `if` to code quality jobs:

```yaml
build:
  name: Build
  runs-on: ubuntu-latest
  needs: [detect-changes, install]
  if: needs.detect-changes.outputs.code == 'true' || needs.detect-changes.outputs.config == 'true'
  steps:
    # ... build steps
```

Apply to all code quality jobs:

- `install`
- `build`
- `lint`
- `typecheck`
- `test`
- `coverage`

**Keep format check always running:**

```yaml
format:
  name: Format Check
  runs-on: ubuntu-latest
  needs: detect-changes # Not conditional!
  steps:
    # ... format check runs for all PRs
```

#### Step 3: Fix ci-success Job

Branch protection requires a passing `ci-success` job. With conditional jobs, we need special handling for skipped jobs.

**Problem:** If jobs are skipped, `ci-success` never runs → PR can't merge

**Solution:** Use `if: always()` and check job results:

```yaml
ci-success:
  name: CI Success
  runs-on: ubuntu-latest
  needs: [format, lint, build, typecheck, test, coverage]
  if: always() # Run even if dependencies were skipped
  steps:
    - name: Check job results
      run: |
        # Format always runs and must succeed
        if [ "${{ needs.format.result }}" != "success" ]; then
          echo "❌ Format check failed or was cancelled"
          exit 1
        fi

        # Code quality jobs are conditional - allow success or skipped
        if [ "${{ needs.lint.result }}" != "success" ] && [ "${{ needs.lint.result }}" != "skipped" ]; then
          echo "❌ Lint check failed or was cancelled"
          exit 1
        fi

        if [ "${{ needs.build.result }}" != "success" ] && [ "${{ needs.build.result }}" != "skipped" ]; then
          echo "❌ Build failed or was cancelled"
          exit 1
        fi

        if [ "${{ needs.typecheck.result }}" != "success" ] && [ "${{ needs.typecheck.result }}" != "skipped" ]; then
          echo "❌ Type check failed or was cancelled"
          exit 1
        fi

        if [ "${{ needs.test.result }}" != "success" ] && [ "${{ needs.test.result }}" != "skipped" ]; then
          echo "❌ Tests failed or were cancelled"
          exit 1
        fi

        if [ "${{ needs.coverage.result }}" != "success" ] && [ "${{ needs.coverage.result }}" != "skipped" ]; then
          echo "❌ Coverage check failed or was cancelled"
          exit 1
        fi

        echo "✅ All CI checks passed!"
```

**Working example:** [`.github/workflows/ci.yml`](https://github.com/TeamNickHart/md2do/blob/main/.github/workflows/ci.yml)

### Results

**Docs-only PR:**

- ✅ Detect Changes: 6s
- ✅ Format Check: 17s
- ✅ CI Success: 4s
- ⏭️ All other jobs: skipped
- **Total: ~27 seconds**

**Code change PR:**

- ✅ All jobs run
- **Total: ~90 seconds**

**Savings:** 3x faster for docs PRs!

---

## Part 4: GitHub Actions Best Practices

### Caching Strategies

Effective caching can cut CI time in half.

#### pnpm Store Caching

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v3
  with:
    version: 9
    run_install: false

- name: Get pnpm store directory
  id: pnpm-cache
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

#### node_modules Caching

```yaml
- name: Cache node_modules
  uses: actions/cache/save@v4
  with:
    path: |
      **/node_modules
      ~/.pnpm-store
    key: ${{ runner.os }}-node-modules-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**Restore in other jobs:**

```yaml
- name: Restore node_modules cache
  id: cache-restore
  uses: actions/cache/restore@v4
  with:
    path: |
      **/node_modules
      ~/.pnpm-store
    key: ${{ runner.os }}-node-modules-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: Install dependencies (if cache miss)
  if: steps.cache-restore.outputs.cache-hit != 'true'
  run: pnpm install --frozen-lockfile
```

#### Build Artifact Caching

```yaml
- name: Cache build output
  uses: actions/cache/save@v4
  with:
    path: |
      packages/*/dist
      packages/*/tsconfig.tsbuildinfo
    key: ${{ runner.os }}-build-${{ hashFiles('packages/*/src/**/*', 'packages/*/tsconfig.json', 'pnpm-lock.yaml') }}
```

### Job Dependencies and Parallelization

**Bad:** Everything runs in sequence

```yaml
jobs:
  install: ...
  build:
    needs: install
  lint:
    needs: build
  typecheck:
    needs: lint
  test:
    needs: typecheck
```

**Time:** 5 + 4 + 3 + 2 + 2 = 16 minutes total

**Good:** Maximize parallelism

```yaml
jobs:
  install: ...

  build:
    needs: install

  # These can run in parallel (all need build)
  lint:
    needs: build
  typecheck:
    needs: build
  test:
    needs: build
```

**Time:** 5 + 4 + max(3, 2, 2) = 12 minutes total

### Concurrency Control

Prevent multiple workflow runs:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Effect:** If you push twice quickly, the first run cancels

---

## Part 5: New Project Checklist

Use this checklist when setting up publishing for a new project:

### npm Publishing Setup

- [ ] Update Node.js version to 20+ in package.json engines
- [ ] Update all workflows to use Node 20
- [ ] Create npm account (if needed)
- [ ] Enable 2FA on npm account
- [ ] Configure trusted publisher on npmjs.com for each package
  - [ ] Provider: GitHub
  - [ ] Owner: (your GitHub username)
  - [ ] Repository: (repo name)
  - [ ] Workflow: publish.yml
  - [ ] Environment: (blank or specific)
- [ ] Copy publish.yml workflow template
- [ ] Replace placeholder values:
  - [ ] Package names
  - [ ] Build commands
  - [ ] Release scripts
- [ ] Add `release` script to package.json
- [ ] Set up Changesets (if using)
  - [ ] `npx changeset init`
  - [ ] Configure `.changeset/config.json`
- [ ] Test with `workflow_dispatch` trigger
- [ ] Create test changeset and verify publishing

### VSCode Extension Setup

- [ ] Create Azure DevOps account
- [ ] Create Personal Access Token with Marketplace manage scope
- [ ] Add VSCE_PAT to GitHub secrets
- [ ] Create publisher ID on marketplace (if needed)
- [ ] Add `"publisher": "your-id"` to extension package.json
- [ ] Add `"private": true` to extension package.json (prevent npm publishing)
- [ ] Copy release.yml workflow template
- [ ] Update extension build path
- [ ] Ensure `pnpm build` builds ALL workspace dependencies
- [ ] Test with workflow_dispatch
- [ ] Verify extension appears on marketplace

### Smart CI Setup

- [ ] Copy ci.yml workflow template
- [ ] Customize file patterns in `detect-changes` job
- [ ] Identify which jobs should be conditional
- [ ] Add `if` conditions to code quality jobs
- [ ] Keep format check always running
- [ ] Update ci-success job to handle skipped jobs
- [ ] Test with docs-only PR
- [ ] Test with code-change PR
- [ ] Configure branch protection to require "CI Success"

### General Setup

- [ ] Review all workflow permissions
- [ ] Set up branch protection rules
- [ ] Configure required status checks
- [ ] Test manual workflow triggers
- [ ] Document any project-specific setup
- [ ] Add CI status badge to README

---

## Part 6: Troubleshooting Guide

### npm Publishing Issues

#### Error: "401 Unauthorized"

**Symptoms:** npm publish fails with authentication error

**Possible causes:**

1. **Node.js version < 20.17.0**
   - Check: `node --version` in workflow logs
   - Fix: Update to Node 20+

2. **npm not upgraded**
   - Check: `npm --version` in workflow logs
   - Fix: Add `npm install -g npm@latest` step

3. **Missing registry-url**
   - Check: setup-node action configuration
   - Fix: Add `registry-url: 'https://registry.npmjs.org'`

4. **Trusted publisher misconfigured**
   - Check: npmjs.com → Account Settings → Trusted Publishers
   - Fix: Verify workflow filename matches exactly

#### Error: "Workflow filename mismatch"

**Symptoms:** npm rejects OIDC token

**Cause:** Trusted publisher configuration doesn't match actual workflow file

**Fix:**

- On npmjs.com: Workflow filename should be `publish.yml` (not `.github/workflows/publish.yml`)
- In repo: File should be `.github/workflows/publish.yml`

#### Error: "Missing permission: id-token: write"

**Symptoms:** Workflow fails with permission error

**Cause:** OIDC requires explicit permission grant

**Fix:**

```yaml
permissions:
  contents: write
  pull-requests: write
  id-token: write # Add this
```

### VSCode Extension Issues

#### Error: "Could not resolve @package/name"

**Symptoms:** VSCode extension build fails with module resolution errors

**Cause:** Workspace dependencies not built before extension

**Our mistake:**

```yaml
# ❌ Wrong - only builds extension
- name: Build VSCode extension
  run: pnpm --filter md2do-vscode build
```

**Fix:**

```yaml
# ✅ Correct - builds everything
- name: Build all packages
  run: pnpm build
```

#### Error: Extension published to npm accidentally

**Symptoms:** VSCode extension appears on npmjs.com

**Cause:** Missing `"private": true` in package.json

**Fix:**

```json
{
  "name": "your-vscode-extension",
  "private": true, // Add this
  "publisher": "your-publisher-id"
}
```

#### Error: "Upload .vsix to GitHub Release" fails

**Symptoms:** GitHub release upload step fails on manual trigger

**Cause:** `workflow_dispatch` doesn't have a release tag

**Fix:** Make it conditional:

```yaml
- name: Upload .vsix to GitHub Release
  if: github.event_name == 'release'
  uses: softprops/action-gh-release@v1
```

### CI Issues

#### Error: "Changes must be made through a pull request"

**Symptoms:** Direct push to main rejected by GitHub

**Cause:** Branch protection rules require PRs

**Fix:** Create a branch and PR instead of pushing to main:

```bash
git checkout -b my-feature
git push -u origin my-feature
gh pr create
```

#### Error: Required check "CI Success" stuck on "Expected"

**Symptoms:** PR shows "Waiting for status to be reported" forever

**Cause:** `ci-success` job was skipped but branch protection requires it

**Fix:** Add `if: always()` to ci-success job:

```yaml
ci-success:
  needs: [format, lint, build, typecheck, test, coverage]
  if: always() # Run even if dependencies skipped
  steps:
    # Check that jobs either passed OR were skipped
```

#### Error: Invalid if condition syntax

**Symptoms:** Workflow fails to parse

**Cause:** Using `${{ }}` wrapper in job-level if conditions

**Our mistake:**

```yaml
# ❌ Wrong - ${{ }} not needed at job level
if: ${{ secrets.TOKEN != '' }}
```

**Fix:**

```yaml
# ✅ Correct - no ${{ }} wrapper
if: secrets.TOKEN != ''
```

**Note:** You can't check secrets in job-level if conditions anyway! Use step-level conditions or other approaches.

---

## Part 7: Anti-Patterns (What NOT to Do)

### ❌ Don't Check Secrets in Job-Level If Conditions

**Why:** GitHub Actions doesn't allow checking secret values in job-level if conditions

**Our mistake:**

```yaml
jobs:
  publish:
    if: secrets.NPM_TOKEN != '' # Doesn't work!
```

**Solution:** Remove the check, or use step-level conditions

### ❌ Don't Use ${{ }} in Job-Level If Conditions

**Why:** Causes parsing errors

**Our mistake:**

```yaml
jobs:
  publish:
    if: ${{ needs.build.result == 'success' }} # Wrong!
```

**Correct:**

```yaml
jobs:
  publish:
    if: needs.build.result == 'success' # Right!
```

### ❌ Don't Use Node 18 with OIDC

**Why:** OIDC requires npm 11.5.1+ which requires Node 20.17.0+

**Symptoms:** 401 errors when publishing

**Fix:** Upgrade to Node 20

### ❌ Don't Build VSCode Extension Without Workspace Deps

**Why:** Extension imports from workspace packages that must be built first

**Our mistake:**

```yaml
- run: pnpm --filter vscode build # Builds only extension
```

**Correct:**

```yaml
- run: pnpm build # Builds all packages in dependency order
```

### ❌ Don't Forget to Add "private": true to VSCode Extensions

**Why:** VSCode extensions shouldn't be on npm

**Our mistake:** Published md2do-vscode to npm accidentally

**Fix:**

```json
{
  "name": "your-vscode-extension",
  "private": true
}
```

### ❌ Don't Hardcode Absolute Paths in Workflows

**Why:** Breaks across different runners and repos

**Bad:**

```yaml
- run: cat /home/runner/work/my-repo/package.json
```

**Good:**

```yaml
- run: cat package.json
```

### ❌ Don't Skip Cache Keys

**Why:** Cache never hits if key is too generic or too specific

**Bad:**

```yaml
key: node-modules # Too generic - never invalidates
```

**Good:**

```yaml
key: ${{ runner.os }}-node-modules-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### ❌ Don't Run All Jobs Sequentially

**Why:** Wastes time - maximize parallelism

**Bad:**

```yaml
lint:
  needs: build
typecheck:
  needs: lint # Waits for lint unnecessarily
test:
  needs: typecheck # Waits for typecheck unnecessarily
```

**Good:**

```yaml
lint:
  needs: build
typecheck:
  needs: build # All three run in parallel
test:
  needs: build
```

---

## Appendix: Template Files

All workflow templates are available in [`templates/github-workflows/`](https://github.com/TeamNickHart/md2do/tree/main/templates/github-workflows).

### Available Templates

1. **npm-oidc-publish.yml** - npm publishing with OIDC trusted publishing
2. **vscode-marketplace-release.yml** - VSCode extension publishing
3. **smart-ci.yml** - Conditional CI with file change detection
4. **coverage-report.yml** - Test coverage reporting

### How to Use Templates

1. Copy template to `.github/workflows/` in your project
2. Search for `REPLACE_` placeholders and update with your values
3. Review inline comments for customization options
4. Test with manual trigger (`workflow_dispatch`) first
5. Adjust as needed for your specific project

### Working Examples

For fully-configured, production-ready examples, see md2do's actual workflows:

- [`.github/workflows/publish.yml`](https://github.com/TeamNickHart/md2do/blob/main/.github/workflows/publish.yml) - npm OIDC publishing
- [`.github/workflows/release.yml`](https://github.com/TeamNickHart/md2do/blob/main/.github/workflows/release.yml) - VSCode publishing
- [`.github/workflows/ci.yml`](https://github.com/TeamNickHart/md2do/blob/main/.github/workflows/ci.yml) - Smart CI
- [`.github/workflows/coverage-report.yml`](https://github.com/TeamNickHart/md2do/blob/main/.github/workflows/coverage-report.yml) - Coverage

---

## Additional Resources

### Official Documentation

- [npm Trusted Publishing](https://docs.npmjs.com/generating-provenance-statements#publishing-packages-with-provenance-via-github-actions)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [VSCode Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [dorny/paths-filter](https://github.com/dorny/paths-filter)

### Related Guides

- [Quick Start Guide](./quick-start-publishing.md) - TL;DR version for experienced developers
- [md2do ROADMAP](https://github.com/TeamNickHart/md2do/blob/main/ROADMAP.md) - See our implementation timeline
- [md2do STATUS](https://github.com/TeamNickHart/md2do/blob/main/STATUS.md) - Current publishing status

---

## Contributing

Found an issue or have a suggestion? Please [open an issue](https://github.com/TeamNickHart/md2do/issues) or submit a PR!

This guide is a living document based on real-world experience. As we learn more, we'll update it.

---

**Last updated:** February 6, 2026
**Based on:** md2do v0.5.1
