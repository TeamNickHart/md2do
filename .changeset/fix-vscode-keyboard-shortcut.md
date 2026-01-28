---
'md2do-vscode': patch
---

fix: change keyboard shortcut to Cmd+Enter to avoid macOS conflicts

Changed the toggle task completion keyboard shortcut from `Cmd+Shift+C` to `Cmd+Enter` (Mac) and from `Ctrl+Shift+C` to `Ctrl+Enter` (Windows/Linux) to avoid conflicts with macOS system shortcuts that open Terminal.

The new `Cmd+Enter` shortcut is semantically appropriate for a "complete" action and less likely to conflict with system or application shortcuts.

Fixes: Keyboard shortcut conflict on macOS where Cmd+Shift+C opened Terminal instead of toggling task completion
