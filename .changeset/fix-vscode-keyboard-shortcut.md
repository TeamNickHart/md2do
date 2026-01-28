---
'md2do-vscode': patch
---

**Keyboard Shortcut, Logo, and Critical Bug Fixes**

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
