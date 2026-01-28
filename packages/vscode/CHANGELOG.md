# md2do-vscode

## 0.1.2

### Patch Changes

- **CRITICAL FIX**: Bundle workspace dependencies in extension package

  Fixed critical packaging issue where @md2do/core and @md2do/config dependencies were not being bundled into the extension, causing the VSCode extension to be completely non-functional when installed.

  **Changes:**
  - Added tsup.config.ts to explicitly bundle workspace dependencies
  - Configured noExternal for @md2do/core and @md2do/config
  - Enabled minification to reduce bundle size (5.1MB uncompressed → 1.4MB compressed .vsix)
  - Fixed relative links in README.md for marketplace compatibility

  **Impact:**
  - v0.1.0 and v0.1.1 were non-functional due to missing dependencies
  - Users should upgrade to this version immediately

  **Bundle size:**
  - Before: 30KB (broken, missing deps)
  - After: 5.1MB (working, includes all dependencies)
  - Final .vsix: 1.4MB (compressed)

## 0.1.1

### Patch Changes

- Add comprehensive warning system for markdown validation and VSCode extension
  - Add warning configuration system with customizable rules
  - Add VSCode extension with task explorer, diagnostics, hover tooltips, and smart completion
  - Support for validating malformed checkboxes, missing metadata, duplicate IDs, and more
  - Add .vsix distribution for beta testing

- Updated dependencies []:
  - @md2do/core@0.3.0
  - @md2do/config@0.3.0
