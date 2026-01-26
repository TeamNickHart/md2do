---
'@md2do/cli': patch
'@md2do/core': patch
'@md2do/config': patch
'@md2do/todoist': patch
'@md2do/mcp': patch
---

## Security & Tooling Updates

### Security Fixes

- Fix esbuild security vulnerability (GHSA-67mh-4wv8-2f99) via pnpm override forcing esbuild >= 0.25.0

### Developer Experience

- Add @vitest/coverage-v8 dependency to enable code coverage reporting
- Update prettier to latest patch version (3.1.0 → 3.8.1)
- Update @modelcontextprotocol/sdk (1.25.2 → 1.25.3)

### Testing

- All 401 unit tests passing
- All 35 E2E tests passing
- Coverage reporting now enabled across all packages

No breaking changes or API changes in this release.
