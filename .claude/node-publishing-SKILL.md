# Node.js Publishing & CI Setup SKILL

## When to Use This Skill

Use this skill when:

- Setting up npm publishing for a Node.js project
- Configuring VSCode Marketplace publishing for extensions
- Implementing OIDC trusted publishing
- Optimizing GitHub Actions CI workflows
- Adding conditional job execution for faster CI
- Troubleshooting publishing workflows
- Questions about modern Node.js publishing best practices
- Converting from NPM_TOKEN to OIDC trusted publishing
- Debugging GitHub Actions workflows for Node projects

## Quick Reference

**For comprehensive setup guides:**
→ [`docs/guides/publishing-node-projects.md`](/Users/nickhart/Developer/TeamNickHart/md2do/docs/guides/publishing-node-projects.md)

**For ready-to-copy workflows:**
→ [`templates/github-workflows/`](/Users/nickhart/Developer/TeamNickHart/md2do/templates/github-workflows/)

**For working examples:**
→ [`.github/workflows/`](/Users/nickhart/Developer/TeamNickHart/md2do/.github/workflows/)

## Overview

This skill captures knowledge from md2do's successful setup of:

1. npm OIDC trusted publishing (no tokens!)
2. VSCode Marketplace publishing
3. Smart CI with conditional job execution (3x faster for docs PRs)
4. Modern GitHub Actions patterns

## Key Concepts from md2do

### OIDC Trusted Publishing

**What it is:** Token-free npm publishing using OpenID Connect

**Requirements:**

- Node.js 20.17.0+ (for npm 11.5.1+)
- Configure trusted publisher on npmjs.com
- `id-token: write` permission in workflow

**Critical lessons learned:**

- ❌ Node 18 doesn't work → ✅ Must use Node 20+
- ❌ Don't check secrets in job-level `if` conditions
- ❌ Don't use `${{ }}` wrapper in job-level `if`
- ✅ Must upgrade npm in workflow: `npm install -g npm@latest`
- ✅ Must include `registry-url` in setup-node action

**Reference:** Part 1 of the guide

### VSCode Marketplace Publishing

**Critical lessons learned:**

- ❌ Don't build only extension → ✅ Build ALL workspace dependencies first
- ❌ Don't forget `"private": true` in package.json (prevents npm publishing)
- ✅ Use `workflow_dispatch` for testing (release events can be unreliable)
- ✅ Make GitHub Release upload conditional: `if: github.event_name == 'release'`

**Reference:** Part 2 of the guide

### Smart CI Optimization

**How it works:**

- Use `dorny/paths-filter@v3` to detect file changes
- Skip code quality jobs (lint, build, test) for docs-only changes
- Always run format check (validates markdown too)
- Use `if: always()` in ci-success job to handle skipped jobs

**Results:** 3x speedup for docs-only PRs (30s vs 90s)

**Reference:** Part 3 of the guide

## Common Patterns

### Setting Up New Project

1. **Read the guide first:** Start with Part 1 (npm) or Part 2 (VSCode)
2. **Copy templates:** Use templates from `templates/github-workflows/`
3. **Replace placeholders:** Search for `REPLACE_` in templates
4. **Test with manual trigger:** Use `workflow_dispatch` before automatic triggers
5. **Reference working examples:** Check md2do's actual workflows for context

### Troubleshooting

**Always check:**

1. Node.js version (must be 20+)
2. npm version in logs (must be 11.5.1+)
3. Workflow filename matches npmjs.com configuration exactly
4. `id-token: write` permission is present
5. For VSCode: workspace dependencies built before extension

**Reference:** Part 6 (Troubleshooting) of the guide

## When Working on Publishing Tasks

### DO:

- ✅ Consult the comprehensive guide for step-by-step instructions
- ✅ Use template workflows as starting point
- ✅ Reference md2do's working workflows for real examples
- ✅ Test with `workflow_dispatch` before relying on automatic triggers
- ✅ Follow the anti-patterns section to avoid common mistakes

### DON'T:

- ❌ Try to guess OIDC configuration - follow the guide exactly
- ❌ Use Node 18 for OIDC (requires 20+)
- ❌ Check secrets in job-level if conditions (doesn't work)
- ❌ Build only VSCode extension without workspace deps (will fail)
- ❌ Forget to test manually before pushing to production

## Template Workflow Quick Reference

```yaml
# npm OIDC Publishing (minimal example)
name: Publish
on:
  push:
    branches: [main]
permissions:
  id-token: write # CRITICAL
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install -g npm@latest
      - run: npm ci && npm run build
      - run: npm publish --provenance
```

See full templates in `templates/github-workflows/` directory.

## Resources

### Documentation Files

1. **Comprehensive Guide** - `docs/guides/publishing-node-projects.md`
   - Complete walkthrough of all topics
   - Story of what we learned
   - Step-by-step instructions
   - Troubleshooting guide

2. **Template Workflows** - `templates/github-workflows/`
   - `npm-oidc-publish.yml` - npm publishing template
   - `vscode-marketplace-release.yml` - VSCode publishing template
   - `smart-ci.yml` - Conditional CI template
   - `coverage-report.yml` - Coverage reporting template

3. **Working Examples** - `.github/workflows/`
   - `publish.yml` - Production npm OIDC workflow
   - `release.yml` - Production VSCode publishing workflow
   - `ci.yml` - Production smart CI workflow

### External Resources

- [npm Trusted Publishing Docs](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub OIDC Docs](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [VSCode Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [dorny/paths-filter](https://github.com/dorny/paths-filter)

## Approach When Helping

1. **Understand the goal:** What is the user trying to publish? (npm, VSCode, both?)
2. **Check prerequisites:** Node version, accounts, secrets configured?
3. **Start with templates:** Copy relevant template from `templates/github-workflows/`
4. **Reference the guide:** Link to specific sections for detailed explanations
5. **Show working examples:** Point to md2do's actual workflows
6. **Test incrementally:** Use manual triggers before automatic triggers
7. **Troubleshoot systematically:** Follow Part 6 of the guide

## Example Conversation Flow

**User:** "I want to set up npm publishing for my project"

**Approach:**

1. Direct to Part 1 of the guide for comprehensive overview
2. Check if they want OIDC (recommended) or traditional token approach
3. Copy `templates/github-workflows/npm-oidc-publish.yml` template
4. Help customize placeholders
5. Guide through npmjs.com trusted publisher setup
6. Test with `workflow_dispatch`
7. Reference md2do's `publish.yml` for working example

**User:** "I'm getting 401 errors when publishing"

**Approach:**

1. Check Node.js version in workflow logs (must be 20+)
2. Check npm version in logs (must be 11.5.1+)
3. Verify `npm install -g npm@latest` step exists
4. Check `registry-url` in setup-node action
5. Verify npmjs.com trusted publisher configuration matches exactly
6. Reference Part 6 (Troubleshooting) of the guide

## Summary

This skill provides battle-tested knowledge for setting up modern Node.js publishing and CI. Always start with the comprehensive guide, use templates as starting points, and reference md2do's working examples for context.

The key lesson: OIDC trusted publishing is the future, but it requires Node 20+ and careful configuration. Follow the guide exactly, test with manual triggers, and don't skip the troubleshooting section.

---

**Last updated:** February 6, 2026
**Based on:** md2do v0.5.1
