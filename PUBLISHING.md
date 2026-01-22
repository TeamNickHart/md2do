# Publishing Guide

This document describes how to publish new versions of md2do packages to npm.

## Setup (One-time)

### 1. npm Account Setup

1. Create an npm account at https://www.npmjs.com/signup
2. Enable 2FA (two-factor authentication) for account security
3. No token needed! We use **Trusted Publishing** (provenance) for secure, automatic publishing from GitHub Actions

**Why Trusted Publishing?**

- ✅ More secure - no long-lived tokens
- ✅ GitHub proves the package came from your repo
- ✅ Automatic npm verification
- ✅ No manual token management

### 2. First-Time Publish

For the very first publish (v0.1.0), you'll need a **Granular Access Token**:

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → "Granular Access Token"
3. Settings:
   - **Token Name**: `md2do-first-publish`
   - **Expiration**: 30 days (short-lived for security)
   - **Packages and scopes**: **All packages** (since @md2do/\* doesn't exist yet, you can't select specific packages)
   - **Permissions**: Read and write
   - **Organizations**: (leave empty)
   - **IP allowances**: Optional (can restrict to GitHub Actions IPs)
4. Generate and copy the token
5. Add to GitHub secrets:
   - Go to https://github.com/TeamNickHart/md2do/settings/secrets/actions
   - New secret: `NPM_TOKEN`
   - Paste token value
6. After first publish succeeds, **delete the token** - trusted publishing takes over!

**Note**: "All packages" is secure here because it's limited to your npm account, has a short expiration, and you'll delete it immediately after first use.

### 3. Plausible Analytics Setup

The website is already configured for Plausible analytics:

1. Sign up at https://plausible.io
2. Add site: `md2do.com`
3. **No npm package needed!** The script is already configured in `docs/.vitepress/config.mjs`
4. View analytics at: https://plausible.io/md2do.com

**Note**: We use the script tag approach (not the npm package) because:

- ✅ Simpler setup for static sites
- ✅ Automatic pageview tracking
- ✅ Works perfectly with VitePress
- ✅ No build configuration needed

The NPM package is only needed for SPAs with custom routing or manual event tracking.

## Publishing Workflow

We use [Changesets](https://github.com/changesets/changesets) for automated versioning and publishing.

### Creating a Changeset

When you make changes that should be published:

```bash
# Create a changeset describing your changes
pnpm changeset
```

You'll be prompted to:

1. Select which packages changed
2. Choose version bump type (major/minor/patch)
3. Write a summary of changes

This creates a file in `.changeset/` that will be committed with your changes.

### Automated Publishing Process

When you push to `main`:

1. **Changesets PR Created** (if there are changesets):
   - GitHub Actions detects unreleased changesets
   - Creates/updates a "Version Packages" PR
   - PR includes version bumps and changelog updates

2. **Merge the PR**:
   - Review the version changes and changelogs
   - Merge the "Version Packages" PR

3. **Automatic Publish**:
   - After merge, GitHub Actions automatically:
     - Builds all packages
     - Publishes to npm
     - Creates git tags
     - Updates CHANGELOG.md files

## Manual Publishing (Emergency)

If needed, you can publish manually:

```bash
# 1. Build all packages
pnpm build

# 2. Login to npm (one-time)
npm login

# 3. Publish all packages
pnpm release
```

## Version Management

We use **linked versions** - all packages bump together:

- `@md2do/cli`
- `@md2do/core`
- `@md2do/config`
- `@md2do/todoist`
- `@md2do/mcp`

This is configured in `.changeset/config.json` with the `linked` field.

### Semantic Versioning

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

## Package Download Stats

After publishing, view download statistics:

- **npm stats**: https://npm-stat.com/charts.html?package=@md2do/cli
- **npm trends**: https://npmtrends.com/@md2do/cli
- **npm API**: `https://api.npmjs.org/downloads/point/last-month/@md2do/cli`

## Website Analytics

View website traffic at:

- **Plausible Dashboard**: https://plausible.io/md2do.com

Plausible provides:

- Page views and unique visitors
- Traffic sources
- Top pages
- Privacy-friendly (no cookies, GDPR compliant)

## Troubleshooting

### Publish fails with "401 Unauthorized"

- **First publish**: Check that `NPM_TOKEN` secret is set in GitHub
- Verify token is a "Granular Access Token" with read/write permissions on `@md2do/*`
- Token may have expired (check expiration date)
- After first publish succeeds, trusted publishing (provenance) handles future publishes automatically

### Changeset PR not created

- Ensure you committed `.changeset/*.md` files
- Check GitHub Actions logs for errors
- Verify `GITHUB_TOKEN` has write permissions

### Version bump seems wrong

- Review `.changeset/*.md` files before merging
- You can manually edit version bumps if needed
- Delete unwanted changesets before merging

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
