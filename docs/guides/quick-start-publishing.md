# Quick Start: Node.js Publishing Setup

> **TL;DR** for experienced developers. For detailed explanations, see the [comprehensive guide](./publishing-node-projects.md).

## npm OIDC Publishing (10 minutes)

### 1. Update Node Version

```json
// package.json
{
  "engines": { "node": ">=20.17.0", "npm": ">=11.5.1" }
}
```

### 2. Configure npm Trusted Publisher

Go to [npmjs.com](https://www.npmjs.com/settings/YOUR_USERNAME/tokens) → Add Trusted Publisher:

- Provider: `GitHub`
- Owner: `YOUR_GITHUB_USERNAME`
- Repository: `YOUR_REPO_NAME`
- Workflow: `publish.yml`
- Environment: (blank)

### 3. Copy Workflow

```bash
cp templates/github-workflows/npm-oidc-publish.yml .github/workflows/publish.yml
```

Search and replace `REPLACE_` placeholders.

### 4. Test

```bash
# In GitHub: Actions → Publish → Run workflow
```

**Done.** Push to main to publish automatically.

---

## VSCode Marketplace (15 minutes)

### 1. Create Azure PAT

[dev.azure.com](https://dev.azure.com/) → User Settings → PAT:

- Scope: Marketplace → Manage

### 2. Add GitHub Secret

Repo → Settings → Secrets → Actions:

- Name: `VSCE_PAT`
- Value: (Azure PAT)

### 3. Update package.json

```json
{
  "publisher": "YOUR_PUBLISHER_ID",
  "private": true // Important!
}
```

### 4. Copy Workflow

```bash
cp templates/github-workflows/vscode-marketplace-release.yml .github/workflows/release.yml
```

Search and replace `REPLACE_` placeholders.

### 5. Test

```bash
# In GitHub: Actions → Release → Run workflow
```

**Done.** Extension appears on marketplace in ~5 minutes.

---

## Smart CI (20 minutes)

### 1. Copy Workflow

```bash
cp templates/github-workflows/smart-ci.yml .github/workflows/ci.yml
```

### 2. Customize File Patterns

Edit `detect-changes` job:

- `docs:` - Add your docs paths
- `code:` - Add your source paths
- `config:` - Add your config files

### 3. Update Commands

Replace placeholders:

- `REPLACE_WITH_YOUR_BUILD_COMMAND`
- `REPLACE_WITH_YOUR_TEST_COMMAND`
- `REPLACE_WITH_YOUR_LINT_COMMAND`

### 4. Configure Branch Protection

Settings → Branches → Add rule:

- Branch: `main`
- Require: `CI Success`

### 5. Test

Create two PRs:

1. Change only README.md → Should skip build/test (~30s)
2. Change a source file → Should run all checks (~90s)

**Done.** CI is 3x faster for docs PRs.

---

## Troubleshooting Cheat Sheet

| Error                       | Fix                                        |
| --------------------------- | ------------------------------------------ |
| 401 Unauthorized            | Node 20+ required                          |
| Workflow filename mismatch  | npmjs config must be exactly `publish.yml` |
| Could not resolve @package  | Build ALL workspace deps: `pnpm build`     |
| CI Success stuck "Expected" | Add `if: always()` to ci-success job       |

Full troubleshooting: [Part 6 of comprehensive guide](./publishing-node-projects.md#part-6-troubleshooting-guide)

---

## Quick Checklist

**npm Publishing:**

- [ ] Node 20+ in package.json engines
- [ ] npm trusted publisher configured
- [ ] `id-token: write` permission in workflow
- [ ] `registry-url` in setup-node
- [ ] `npm install -g npm@latest` step
- [ ] Test with workflow_dispatch

**VSCode Publishing:**

- [ ] Azure PAT created
- [ ] VSCE_PAT secret added
- [ ] `"private": true` in package.json
- [ ] Build ALL workspace deps before packaging
- [ ] Test with workflow_dispatch

**Smart CI:**

- [ ] File patterns customized
- [ ] Commands updated
- [ ] ci-success handles skipped jobs
- [ ] Branch protection configured
- [ ] Tested with docs-only PR

---

## Templates

All templates: [`templates/github-workflows/`](../../templates/github-workflows/)

- `npm-oidc-publish.yml` - npm with OIDC
- `vscode-marketplace-release.yml` - VSCode Marketplace
- `smart-ci.yml` - Conditional CI
- `coverage-report.yml` - Coverage reporting

## Working Examples

All working workflows: [`.github/workflows/`](../../.github/workflows/)

- `publish.yml` - npm OIDC in production
- `release.yml` - VSCode publishing in production
- `ci.yml` - Smart CI in production

---

## Need More Detail?

→ [Comprehensive Publishing Guide](./publishing-node-projects.md) - Full walkthrough with explanations

---

**Last updated:** February 6, 2026
