# Obsidian Plugin - Post-Launch TODOs

## Medium Priority

- [ ] Editor race condition on task click (task-list-view.ts:421-427) — `activeEditor` accessed immediately after `openFile()` without waiting for editor to be ready; cursor may not be set on large files
- [ ] Settings trigger rescan even when value unchanged (settings.ts) — add equality check before calling `refreshTasks()`
- [ ] Non-null assertions on regex match index (suggest-provider.ts:139,149) — use explicit `!== undefined` checks

## Low Priority

- [ ] UTC date for completion timestamps (task-writer.ts:38) — `toISOString().split('T')[0]` gives UTC date, could be off by a day near midnight; use local date formatting
- [ ] Unused `gutterMarkers` Map (diagnostic-provider.ts:8) — dead code, never rendered; implement gutter rendering or remove
- [ ] `onunload()` doesn't clear all references (main.ts) — only nulls `taskListView`; clear diagnosticProvider, suggestProvider, statusBarEl
- [ ] `excludeFolders` path handling (scanner.ts:26-29) — doesn't normalize leading slashes or inconsistent separators
- [ ] Tag display truncated at 3 with no "+N more" indicator (task-list-view.ts:409-414)
- [ ] No validation of scanPattern glob syntax (settings.ts:51-61) — invalid globs silently fail
- [ ] `activateView` silently fails if no right leaf available (main.ts:150-157) — show Notice on failure
- [ ] Release workflow: `styles.css` copy will fail if file is ever removed (release.yml:178) — add conditional copy
