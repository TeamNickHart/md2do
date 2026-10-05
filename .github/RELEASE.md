# Release Process

Releases are driven by [changesets](https://github.com/changesets/changesets) and the
`publish.yml` workflow. Do not create GitHub Releases to trigger publishing, and do not bump
versions in `package.json` by hand.

See [PUBLISHING.md](../PUBLISHING.md) for background and troubleshooting.

## npm packages

1. **Add a changeset in every PR that changes a published package.**

   ```bash
   pnpm changeset
   ```

   Select the affected packages, choose the bump type, write a summary, and commit the
   generated `.changeset/*.md` file with the PR.

2. **Merge the PR to `main`.** `publish.yml` opens (or updates) a "chore: version packages"
   PR containing the version bumps and CHANGELOG entries.

3. **Merge the version PR.** `publish.yml` sees no changesets remain and runs
   `pnpm release` (`pnpm build && changeset publish --provenance`).

Publishing uses npm **Trusted Publishing** (OIDC). There is no `NPM_TOKEN`; each `@md2do/*`
package on npmjs.com trusts the `publish.yml` workflow in `TeamNickHart/md2do`.

### Linked packages

These always share one version:

- `@md2do/cli`
- `@md2do/core`
- `@md2do/config`
- `@md2do/todoist`
- `@md2do/mcp`

If changesets leaves one behind, align it to the same version and add a CHANGELOG entry:
"Version bump to stay in sync with linked packages".

### Bump types

- **patch** — bug fixes, docs, performance work with no API change
- **minor** — new backward-compatible features, deprecations
- **major** — breaking changes

## Independently versioned packages

These are not in the changesets linked group, do not publish to npm, and are not published
by any workflow in this repository.

- **`md2do-vscode`** — VS Code Marketplace. Version lives in `packages/vscode/package.json`.
- **`@md2do/obsidian`** — GitHub releases in `TeamNickHart/md2do-obsidian`. Version lives in
  `packages/obsidian/manifest.json`.

## Rollback

```bash
# Deprecate a bad version and point users at the fix
npm deprecate @md2do/cli@0.x.y "Critical bug, use 0.x.z instead."
```

Prefer deprecating and publishing a fix over `npm unpublish`.
