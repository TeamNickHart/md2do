# Release Process

This document describes the automated release process for md2do.

## Overview

When you create a GitHub Release, the following happens automatically:

1. **npm Publishing** - All packages are published to npm
2. **VSCode Marketplace** - Extension is published to the Visual Studio Marketplace
3. **Open VSX Registry** - Extension is published to Open VSX (for VSCodium, Eclipse Che, etc.)
4. **GitHub Release Asset** - The `.vsix` file is uploaded to the GitHub release

## Workflow Architecture

The project has two publishing workflows:

### `publish.yml` (Changesets Automation)

- **Trigger:** Push to `main` branch
- **Purpose:** Creates version PRs automatically when changesets are detected
- **Action:** Opens a "Version Packages" PR with bumped versions
- **Manual:** You merge the PR when ready to release

### `release.yml` (Release Automation) ⭐ NEW

- **Trigger:** Publishing a GitHub Release
- **Purpose:** Automatically publishes all packages when you create a release
- **Action:** Publishes to npm, VSCode Marketplace, and Open VSX
- **Recommended:** Use this workflow for controlled releases

### Choosing a Strategy

**Option A: Release-Triggered Publishing (Recommended)**

1. Create changeset: `pnpm changeset add`
2. Version bump: `pnpm changeset version`
3. Merge version PR to main
4. Create GitHub Release → **Automatic publishing**

**Option B: Continuous Publishing**

1. Keep `publish.yml` enabled
2. Merge changesets to main → **Automatic publishing**
3. Manually create GitHub Release afterward (for release notes)

**Recommendation:** Use Option A (release-triggered) for better control over when packages are published. This is especially important for VSCode extension releases, which should be coordinated with release announcements.

To switch to Option A, you can disable `publish.yml` by adding a manual trigger:

```yaml
on:
  workflow_dispatch: # Manual trigger only
```

## Required Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### `NPM_TOKEN`

**Purpose:** Publish packages to npm

**How to get it:**

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Click your profile icon → **Access Tokens**
3. Click **Generate New Token** → **Automation**
4. Copy the token and add it to GitHub secrets

**Permissions:** Automation (publish packages)

### `VSCE_PAT`

**Purpose:** Publish extension to Visual Studio Marketplace

**How to get it:**

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Sign in with your Microsoft account
3. Click user icon (top-right) → **Personal access tokens**
4. Click **+ New Token**
5. Configure:
   - **Name:** VSCode Marketplace Publishing
   - **Organization:** All accessible organizations
   - **Expiration:** Custom (1 year recommended)
   - **Scopes:**
     - Marketplace → **Acquire** (read)
     - Marketplace → **Manage** (publish)
6. Click **Create** and copy the token
7. Add it to GitHub secrets

**Permissions:** Marketplace (Manage)

**Documentation:** [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### `OPENVSX_TOKEN`

**Purpose:** Publish extension to Open VSX Registry (optional but recommended)

**How to get it:**

1. Go to [open-vsx.org](https://open-vsx.org/)
2. Sign in with GitHub
3. Go to [Access Tokens](https://open-vsx.org/user-settings/tokens)
4. Click **Generate New Token**
5. Copy the token and add it to GitHub secrets

**Permissions:** Publish extensions

**Why?** Open VSX is used by VSCodium, Gitpod, Eclipse Che, and other VS Code alternatives

## Release Workflow

### 1. Prepare Release Branch

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create a release branch
git checkout -b release/v0.x.0

# Create a changeset (if not already done)
pnpm changeset add

# Bump versions
pnpm changeset version

# Build and test
pnpm build
pnpm test:run
pnpm lint
pnpm typecheck

# Commit version changes
git add .
git commit -m "chore: release v0.x.0"

# Push and create PR
git push -u origin release/v0.x.0
gh pr create --title "chore: release v0.x.0" --body "Release v0.x.0"
```

### 2. Merge Release PR

Once CI passes, merge the PR to main.

### 3. Create GitHub Release

**Option A: Via GitHub UI**

1. Go to [Releases](https://github.com/TeamNickHart/md2do/releases)
2. Click **Draft a new release**
3. Click **Choose a tag** → Create new tag (e.g., `v0.3.0`)
4. Set **Target:** `main`
5. Set **Release title:** `v0.3.0`
6. Add release notes (auto-generate or write manually)
7. Click **Publish release**

**Option B: Via GitHub CLI**

```bash
# After PR is merged
git checkout main
git pull origin main

# Create and push tag
git tag v0.3.0
git push origin v0.3.0

# Create release with auto-generated notes
gh release create v0.3.0 \
  --title "v0.3.0" \
  --notes-from-tag \
  --latest
```

### 4. Automated Publishing

Once the release is published, GitHub Actions automatically:

1. ✅ Publishes all packages to npm
2. ✅ Publishes VSCode extension to marketplace
3. ✅ Publishes to Open VSX Registry
4. ✅ Uploads `.vsix` file to the release

Monitor the workflow: [Actions](https://github.com/TeamNickHart/md2do/actions/workflows/release.yml)

## Package Versioning

The monorepo uses [changesets](https://github.com/changesets/changesets) for version management.

### Linked Packages

These packages are version-linked (always released together):

- `@md2do/cli`
- `@md2do/core`
- `@md2do/config`
- `@md2do/todoist`
- `@md2do/mcp`

### Independent Packages

These packages have independent versions:

- `md2do-vscode` - VSCode extension (follows own versioning)

### Creating a Changeset

```bash
# Interactive prompt
pnpm changeset add

# Follow prompts:
# 1. Select which packages changed
# 2. Select bump type (patch, minor, major)
# 3. Write summary of changes
```

This creates a markdown file in `.changeset/` describing the changes.

## Release Types

### Patch Release (0.3.0 → 0.3.1)

- Bug fixes
- Documentation updates
- Performance improvements (no API changes)

```bash
pnpm changeset add
# Select: patch
```

### Minor Release (0.3.0 → 0.4.0)

- New features (backward compatible)
- New APIs
- Deprecations (but not removals)

```bash
pnpm changeset add
# Select: minor
```

### Major Release (0.3.0 → 1.0.0)

- Breaking changes
- API removals
- Major refactors

```bash
pnpm changeset add
# Select: major
```

## VSCode Extension Versioning

The VSCode extension (`md2do-vscode`) follows independent versioning:

- Start at `0.1.0` for initial beta
- Increment by `0.1.0` for each feature release
- Use patch versions for bug fixes (`0.1.1`, `0.1.2`, etc.)
- Move to `1.0.0` when ready for stable release

## Troubleshooting

### npm publish fails

**Error:** `npm ERR! code E403`

**Solution:** Check that `NPM_TOKEN` secret has publish permissions

### VSCode publish fails

**Error:** `Extension validation failed`

**Solution:**

- Ensure `publisher` field in `package.json` matches your marketplace publisher ID
- Verify extension builds successfully: `pnpm --filter md2do-vscode build`
- Test packaging locally: `cd packages/vscode && npx @vscode/vsce package`

### VSCE_PAT expired

**Error:** `Error: Failed request: Unauthorized(401)`

**Solution:** Generate a new Personal Access Token in Azure DevOps and update the secret

### .vsix not uploaded to release

**Error:** Release created but no asset

**Solution:**

- Check workflow logs for errors
- Ensure `GITHUB_TOKEN` has `contents: write` permission (automatically granted)

### Open VSX publish fails

**Note:** This step is set to `continue-on-error: true`, so it won't fail the workflow

**Solution:** Verify `OPENVSX_TOKEN` is valid and has publish permissions

## Manual Publishing (Fallback)

If automated publishing fails, you can publish manually:

### npm

```bash
# Build all packages
pnpm build

# Publish with changeset
pnpm changeset publish

# Or publish individual packages
cd packages/core
npm publish
```

### VSCode Marketplace

```bash
# Package extension
cd packages/vscode
npx @vscode/vsce package

# Publish
npx @vscode/vsce publish --packagePath md2do-vscode-0.1.1.vsix
```

### Open VSX

```bash
cd packages/vscode
npx ovsx publish md2do-vscode-0.1.1.vsix -p YOUR_TOKEN
```

## Rollback

If a release needs to be rolled back:

### npm

```bash
# Deprecate a version
npm deprecate @md2do/cli@0.3.0 "This version has a critical bug. Use 0.3.1 instead."

# Unpublish (only within 72 hours)
npm unpublish @md2do/cli@0.3.0
```

### VSCode Marketplace

1. Go to [VS Code Marketplace Management](https://marketplace.visualstudio.com/manage)
2. Find your extension
3. Click **Unpublish version** or publish a new version

### GitHub Release

```bash
# Delete release and tag
gh release delete v0.3.0 --yes
git tag -d v0.3.0
git push origin :refs/tags/v0.3.0
```

## Prerelease Workflow

For beta/alpha releases:

### npm Prerelease

```bash
# Create prerelease version
pnpm changeset version --snapshot beta

# Publish with beta tag
pnpm changeset publish --tag beta
```

Install with:

```bash
npm install @md2do/cli@beta
```

### VSCode Prerelease

```bash
cd packages/vscode

# Update version to include prerelease
# e.g., "version": "0.2.0-beta.1"

# Package and publish
npx @vscode/vsce publish --pre-release
```

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Publishing VSCode Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [npm Publishing Guide](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
