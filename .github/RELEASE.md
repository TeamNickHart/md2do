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

2. **Merge the PR to `main`.** Nothing is published yet.

3. **Open the version PR by hand** when ready to release.

   ```bash
   git switch -c chore/version-vX.Y.Z main
   GITHUB_TOKEN=$(gh auth token) pnpm run version
   ```

   This runs `changeset version` and refreshes the lockfile. `GITHUB_TOKEN` is needed by the
   GitHub changelog generator. Commit the result and open a PR titled
   "chore: version packages to vX.Y.Z".

   `changeset version` also bumps the private dependents `md2do-vscode` and
   `md2do-obsidian`. Keep the `md2do-vscode` bump only if the extension changed, and revert
   the `md2do-obsidian` bump unless the plugin changed.

4. **Merge the version PR.** `publish.yml` sees no changesets remain and runs
   `pnpm release` (`pnpm build && changeset publish --provenance`).

`publish.yml` does not open the version PR itself. The repository does not allow GitHub
Actions to create pull requests, and a PR opened by the Actions token would not trigger the
required `CI Success` check. Until that is set up, the Publish run on a feature merge fails
at "creating pull request"; that failure is expected and harmless.

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
