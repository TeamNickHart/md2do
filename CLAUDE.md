# md2do — Claude Instructions

## Repository

pnpm monorepo. Packages: `core`, `cli`, `config`, `todoist`, `mcp`, `vscode`, `obsidian`.

```
pnpm build          # build all packages
pnpm -r run test:run  # run all tests
pnpm lint           # lint all packages
pnpm typecheck      # typecheck all packages
```

## Release Process

**The only correct release flow is via `publish.yml` + changesets. Do not create GitHub Releases manually.**

### Steps

1. **Include a changeset in every feature PR** that changes published packages:

   ```bash
   pnpm changeset
   # select affected packages, choose bump type, write summary
   # commit the generated .changeset/*.md file with the PR
   ```

2. **Merge the feature PR to main.** Nothing is published yet.

3. **Open the version PR by hand** when ready to release:

   ```bash
   git switch -c chore/version-vX.Y.Z main
   GITHUB_TOKEN=$(gh auth token) pnpm run version  # changeset version + lockfile
   ```

   `GITHUB_TOKEN` is needed by the GitHub changelog generator. Commit the result and open a
   PR titled "chore: version packages to vX.Y.Z".

   `changeset version` also bumps the private dependents `md2do-vscode` and `md2do-obsidian`.
   Keep the `md2do-vscode` bump only if the extension actually changed (and add a real
   CHANGELOG line); revert the `md2do-obsidian` bump unless the plugin changed.

4. **Merge the version PR.** `publish.yml` detects no changeset files remain and runs:
   ```bash
   pnpm release  # = pnpm build && changeset publish --provenance
   ```
   Packages are published to npm via **OIDC Trusted Publishing** — no token required.

### What NOT to do

- **Do not** create GitHub Releases to trigger publishing — `release.yml` has been deleted.
- **Do not** use `NPM_TOKEN` — Trusted Publishing is configured on npmjs.com for all `@md2do/*` packages.
- **Do not** run `changeset publish` locally unless debugging — the merge of the version PR publishes.
- **Do not** expect `publish.yml` to open the version PR. It can't: the repo doesn't allow
  GitHub Actions to create pull requests, and a PR opened by the Actions token wouldn't
  trigger the required `CI Success` check anyway. Until that is set up, the Publish run on a
  feature merge fails at "creating pull request"; that failure is expected and harmless.
- **Do not** bump versions in `package.json` manually — changesets manages this.

### Linked packages (always same version)

`@md2do/cli`, `@md2do/core`, `@md2do/config`, `@md2do/todoist`, `@md2do/mcp`

If changesets doesn't bump all of them (e.g. only touched packages move), manually align the
others to the same version and add a CHANGELOG entry: "Version bump to stay in sync with linked packages".

### Independent versioning

- `@md2do/vscode` — VSCode Marketplace, own version in `packages/vscode/package.json`
- `@md2do/obsidian` — GitHub releases in `TeamNickHart/md2do-obsidian`, own version in `packages/obsidian/manifest.json`

These are **not** in the changesets linked group and don't publish to npm.

## npm Trusted Publishing

Configured on npmjs.com for each `@md2do/*` package:

- Repository: `TeamNickHart/md2do`
- Workflow: `publish.yml`
- No `NPM_TOKEN` secret needed or used.

## ESLint

```bash
# Lint a specific package
npx eslint "packages/<pkg>/src/**/*.ts"

# Lint all
pnpm lint
```

Test files (`**/tests/**/*.ts`) have `unsafe-*` and `unbound-method` rules relaxed — needed
for `vi.fn()` mock patterns.

## Task Syntax

- Priority: `!!!` = urgent, `!!` = high, `!` = normal, nothing = low
- Due date: `#due/YYYY-MM-DD`
- Completed: `{completed:YYYY-MM-DD}`
- Source links: `{slug:externalId}` (e.g. `{teams:msg-789}`, `{todoist:12345}`)
- Tags: `#tagname` (negative lookahead excludes `#due/`)
- Assignee: `@username`
