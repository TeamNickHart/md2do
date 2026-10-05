# Contributing to md2do

Thanks for your interest in md2do! Bug reports, fixes, and ideas are all welcome.

## Quick start

Requires Node.js 24 and pnpm 9 (what CI uses).

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/md2do.git
cd md2do
pnpm install
pnpm build
pnpm test:run
```

## Making a change

1. Create a branch from `main`.
2. Make your change, with tests where it makes sense.
3. Run the full check locally:

   ```bash
   pnpm validate
   ```

   This runs build, lint, format check, typecheck, and tests — the same things CI checks.

4. If you changed a published package (`core`, `cli`, `config`, `todoist`, `mcp`), add a
   changeset:

   ```bash
   pnpm changeset
   ```

   Pick the packages you touched, choose `patch` for a bug fix or `minor` for a feature,
   and write a one-line summary. Commit the generated `.changeset/*.md` file. Changes that
   only touch `vscode`, `obsidian`, docs, or CI don't need one. Not sure? Skip it and say
   so in the PR — a maintainer can add it.

5. Push to your fork and open a pull request against `main`.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `docs:`, `chore:`, ...).

## What to expect

- CI runs on your PR once a maintainer approves the workflow run (first-time contributors
  only).
- A maintainer reviews and merges. Releases are cut by maintainers; you don't need to bump
  versions or edit CHANGELOG files.

## More

- [Development guide](docs/development/contributing.md) — project layout and
  per-package commands
- [Issues](https://github.com/TeamNickHart/md2do/issues) — bugs and feature requests

By contributing, you agree that your contributions are licensed under the MIT License.
