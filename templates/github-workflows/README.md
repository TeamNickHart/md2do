# GitHub Actions Workflow Templates

Ready-to-copy GitHub Actions workflows based on md2do's production setup.

## Available Templates

### 1. [npm-oidc-publish.yml](./npm-oidc-publish.yml)

**Purpose:** Publish npm packages using OIDC trusted publishing (no tokens!)

**Use for:**

- npm packages
- Monorepos with multiple npm packages
- Any project publishing to npmjs.com

**Prerequisites:**

- Node.js 20+ configured in package.json
- npm trusted publisher configured on npmjs.com
- Changesets for version management (recommended)

**Setup:**

1. Copy to `.github/workflows/publish.yml`
2. Replace `REPLACE_` placeholders
3. Configure npm trusted publisher
4. Test with manual trigger

### 2. [vscode-marketplace-release.yml](./vscode-marketplace-release.yml)

**Purpose:** Publish VSCode extensions to marketplace

**Use for:**

- VSCode extensions
- Monorepos with VSCode extension packages

**Prerequisites:**

- Azure Personal Access Token (VSCE_PAT) in GitHub secrets
- Publisher ID created on marketplace
- Extension package.json with `"private": true`

**Setup:**

1. Copy to `.github/workflows/release.yml`
2. Replace `REPLACE_` placeholders
3. Add VSCE_PAT secret to GitHub
4. Test with manual trigger

### 3. [smart-ci.yml](./smart-ci.yml)

**Purpose:** Conditional CI that skips code checks for docs-only changes

**Use for:**

- Any project with documentation
- Projects where docs changes are frequent
- Teams wanting faster CI for non-code changes

**Benefits:**

- 3x faster for docs-only PRs
- Saves CI minutes
- Reduces developer waiting time

**Setup:**

1. Copy to `.github/workflows/ci.yml`
2. Customize file patterns in detect-changes job
3. Identify which jobs should be conditional
4. Update ci-success job dependencies
5. Configure branch protection to require "CI Success"

### 4. [coverage-report.yml](./coverage-report.yml)

**Purpose:** Generate and report test coverage on PRs

**Use for:**

- Projects with test suites
- Teams tracking code coverage
- Projects using Codecov

**Prerequisites:**

- Test framework configured (Vitest, Jest, etc.)
- CODECOV_TOKEN in GitHub secrets (optional)

**Setup:**

1. Copy to `.github/workflows/coverage-report.yml`
2. Replace `REPLACE_` placeholders
3. Update coverage paths
4. Configure Codecov token (if using)

## How to Use These Templates

### Basic Workflow

1. **Read the guide first:** [`docs/guides/publishing-node-projects.md`](../../docs/guides/publishing-node-projects.md)
2. **Choose template(s)** based on your needs
3. **Copy to your repo's** `.github/workflows/` directory
4. **Search for `REPLACE_`** in the template and update with your values:
   - `REPLACE_WITH_PACKAGE_NAME` → Your package name
   - `REPLACE_WITH_BUILD_COMMAND` → Your build command
   - `REPLACE_WITH_TEST_COMMAND` → Your test command
5. **Review inline comments** for customization options
6. **Test with manual trigger** (`workflow_dispatch`) before relying on automatic triggers
7. **Adjust as needed** for your specific project

### Customization Tips

**Package Managers:**

- Templates use `pnpm` but can be adapted for `npm` or `yarn`
- Replace `pnpm install` with `npm ci` or `yarn install --frozen-lockfile`

**Node Versions:**

- Templates use Node 20 (required for OIDC)
- Adjust if you need a different version (but keep 20+ for OIDC)

**Monorepo vs Single Package:**

- Templates support both
- For single package: remove workspace-specific commands
- For monorepo: ensure all packages are built in correct order

**Caching:**

- Templates include pnpm caching
- Adjust cache paths for npm (`~/.npm`) or yarn (`~/.yarn/cache`)

## Working Examples

For fully-configured production workflows, see md2do's actual workflows:

- [`.github/workflows/publish.yml`](../../.github/workflows/publish.yml) - npm OIDC publishing in action
- [`.github/workflows/release.yml`](../../.github/workflows/release.yml) - VSCode publishing in action
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) - Smart CI in action
- [`.github/workflows/coverage-report.yml`](../../.github/workflows/coverage-report.yml) - Coverage reporting in action

## Troubleshooting

If you encounter issues, consult the troubleshooting section in the guide:
[`docs/guides/publishing-node-projects.md#part-6-troubleshooting-guide`](../../docs/guides/publishing-node-projects.md#part-6-troubleshooting-guide)

Common issues:

- **401 errors:** Node.js version < 20
- **Build failures:** Workspace dependencies not built
- **Skipped jobs blocking PR:** ci-success job needs `if: always()`

## Questions?

- Read the [comprehensive guide](../../docs/guides/publishing-node-projects.md)
- Check [md2do's actual workflows](../../.github/workflows/)
- [Open an issue](https://github.com/TeamNickHart/md2do/issues)

---

**Templates based on:** md2do v0.5.1 (February 2026)
