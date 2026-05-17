# md2do-vscode

## 0.2.4

### Patch Changes

- Updated dependencies []:
  - @md2do/core@0.7.0
  - @md2do/config@0.7.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @md2do/core@0.6.0
  - @md2do/config@0.6.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`ce65eaf`](https://github.com/TeamNickHart/md2do/commit/ce65eaf588c702254fb564f748a5841241cc5c97)]:
  - @md2do/core@0.5.1
  - @md2do/config@0.5.1

## 0.2.1

### Patch Changes

- 8e0f80a: Add time support to due dates with workday configuration

  **New Features:**
  - Support optional time component in due dates: `[due: 2026-02-06 17:00]`
  - Parse both 24-hour format times (H:MM and HH:MM)
  - Added `parseTime()` utility for time validation
  - New workday config schema with `startTime`, `endTime`, and `defaultDueTime`
  - When no time specified in due date, applies default from config (defaults to 17:00 end of workday)
  - Prevents "due 8 hours ago" issues for dates without explicit times

  **Configuration:**

  ```json
  {
    "workday": {
      "startTime": "08:00",
      "endTime": "17:00",
      "defaultDueTime": "end"
    }
  }
  ```

- Updated dependencies [8e0f80a]
  - @md2do/config@0.4.0
  - @md2do/core@0.4.0

## 0.2.0

### Minor Changes

- Add CodeLens inline actions for tasks

  This release completes Phase 2 of the VSCode extension roadmap with new CodeLens functionality that displays actionable links above each task:
  - Toggle task completion with one-click actions
  - View due date countdown and overdue warnings
  - See priority indicators with emoji badges
  - Check Todoist sync status
  - Quick delete action

  Phase 2 is now complete with all three features implemented:
  - Auto-completion for dates, assignees, and tags
  - Hover provider with rich task details
  - CodeLens inline actions

## 0.1.3

### Patch Changes

- **Keyboard Shortcut, Logo, and Critical Bug Fixes**

  ### 1. Keyboard Shortcut: Changed to Cmd+K Enter (chord-style)

  Changed the toggle task completion keyboard shortcut to `Cmd+K Enter` (Mac) / `Ctrl+K Enter` (Windows/Linux) to avoid conflicts with:
  - macOS system shortcuts (Cmd+Shift+C opened Terminal)
  - VSCode's built-in markdown list continuation (Cmd+Enter)

  The chord-style keybinding (press Cmd+K, then Enter) avoids conflicts and is consistent with VSCode conventions.

  ### 2. Added Logo/Icon

  Added md2do checkbox logo as the extension icon for professional branding in the VSCode marketplace. The icon includes adaptive dark/light mode support.

  ### 3. Critical Bug Fix: Task Explorer Path Resolution

  **Fixed:** Task explorer was completely broken - clicking tasks gave errors like "cannot open file:///Nick/notes.md"

  **Root Cause:** Scanner stored relative paths but goToTask tried to use them as absolute paths with vscode.Uri.file()

  **Solution:** Added proper path resolution to convert relative paths to absolute using workspace root before creating URI

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
