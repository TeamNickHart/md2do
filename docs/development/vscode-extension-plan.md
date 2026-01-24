# md2do VS Code Extension - Planning Document

## Overview

A VS Code extension to enhance the md2do task management experience directly in the editor.

**Vision:** Make VS Code the ultimate environment for managing markdown-based tasks with md2do superpowers.

**Target Users:**

- Developers using md2do for task management
- Teams managing projects in markdown files
- Anyone who wants inline task management without leaving their editor

---

## MVP Features (v0.1.0)

### 1. Syntax Highlighting

**Goal:** Make md2do metadata visually distinct in markdown files

**Features:**

- Highlight @assignees (e.g., `@nick` in blue)
- Highlight priority markers (`!!!` in red, `!!` in orange, `!` in yellow)
- Highlight tags (`#backend` in purple)
- Highlight due dates (`(2026-01-25)` in green)
- Highlight Todoist IDs (`[todoist:123]` in gray)
- Highlight completed tasks differently from incomplete

**Technical Approach:**

- TextMate grammar for syntax highlighting
- Use semantic tokens API for precise coloring
- Configuration for customizable colors

**Example:**

```markdown
- [ ] Fix bug @nick !!! #backend (2026-01-25)
      ^^^^^^^ ^^^^ ^^^ ^^^^^^^^ ^^^^^^^^^^^^^^
      | | | | └─ Date (green)
      | | | └──────────── Tag (purple)
      | | └──────────────── Priority (red)
      | └───────────────────── Assignee (blue)
      └────────────────────────────── Task text
```

### 2. Autocomplete for Assignees

**Goal:** Quick insertion of assignees from existing tasks

**Features:**

- Trigger on `@` character
- Show list of all assignees used in workspace
- Include frequency count
- Smart sorting (most used first)
- Cache for performance

**Technical Approach:**

- Use `@md2do/core` to scan workspace on activation
- CompletionItemProvider for `@` trigger
- Background scanning with debouncing
- Update on file save

**Example:**

```
User types: - [ ] Fix bug @
Extension shows:
  @nick (15 tasks)
  @jane (12 tasks)
  @alex (8 tasks)
```

### 3. Tag Autocomplete

**Goal:** Quick insertion of tags from existing tasks

**Features:**

- Trigger on `#` character
- Show list of all tags used in workspace
- Group by frequency
- Support multi-word tags
- Tag templates (common combinations)

**Technical Approach:**

- Similar to assignee autocomplete
- CompletionItemProvider for `#` trigger
- Extract from workspace scan

### 4. Priority Quick Insert

**Goal:** Easy priority marker insertion

**Features:**

- Trigger on `!` character
- Show options: `!!!` (urgent), `!!` (high), `!` (normal)
- Keyboard shortcuts for quick insertion
- Visual preview in suggestions

**Technical Approach:**

- CompletionItemProvider for `!` trigger
- Commands for keyboard shortcuts
- Snippet integration

### 5. Date Picker for Due Dates

**Goal:** Visual date selection for task due dates

**Features:**

- Trigger on `(` character or command
- Calendar picker UI
- Quick options (today, tomorrow, next week, etc.)
- Natural language parsing ("next friday")
- Format as `(YYYY-MM-DD)`

**Technical Approach:**

- CompletionItemProvider with custom WebView
- Use vscode.QuickPick for simple cases
- WebView panel for full calendar
- Integration with date-fns for parsing

---

## Enhanced Features (v0.2.0)

### 6. Task Dashboard Sidebar

**Goal:** Overview of all tasks in workspace

**Features:**

- Tree view showing tasks by project/person/file
- Filter by completion status
- Sort by priority/due date/assignee
- Click to jump to task in file
- Task counts and statistics
- Refresh button

**Technical Approach:**

- TreeDataProvider for sidebar
- Use `@md2do/core` for filtering/sorting
- Icons for different task states
- Context menu for actions

**UI Mockup:**

```
MD2DO TASKS
├─ 📁 Overdue (5)
│  ├─ Fix memory leak @nick
│  └─ Design review @emma
├─ 📁 Today (3)
├─ 📁 This Week (12)
└─ 📁 By Project
   ├─ acme-app (45)
   └─ widget-co (23)
```

### 7. Inline Task Statistics

**Goal:** Show task stats inline in editor

**Features:**

- Code lens showing task count at section headers
- Hover tooltips with task breakdown
- Update on file change
- Configurable display

**Example:**

```markdown
## Sprint Planning ← 15 tasks (3 urgent, 7 high, 5 normal)

- [ ] Task 1 @nick !!!
```

**Technical Approach:**

- CodeLensProvider
- HoverProvider
- Scan current file on change
- Debounced updates

### 8. Quick Task Filtering

**Goal:** Filter visible tasks in current file

**Features:**

- Command palette: "md2do: Filter Tasks..."
- Filter by assignee/priority/tag/status
- Fold non-matching tasks
- Clear filters command
- Status bar indicator when filtered

**Technical Approach:**

- FoldingRangeProvider
- Custom folding regions
- Remember filter state
- Status bar item

### 9. Task Operations

**Goal:** Bulk operations on tasks

**Features:**

- Toggle completion (checkbox)
- Assign to user (change/add assignee)
- Change priority
- Add/remove tags
- Set due date
- Multi-select support

**Technical Approach:**

- Commands with text edits
- Quick pick for bulk operations
- Undo support
- Keybindings

---

## Advanced Features (v0.3.0)

### 10. Todoist Integration Panel

**Goal:** Sync with Todoist from VS Code

**Features:**

- View Todoist projects
- Push selected tasks to Todoist
- Pull Todoist updates
- Sync status indicator
- Conflict resolution UI
- Dry-run mode

**Technical Approach:**

- Use `@md2do/todoist` package
- WebView panel for UI
- Token management (secure storage)
- Background sync option

### 11. Task Dependency Visualization

**Goal:** Show task relationships

**Features:**

- Link tasks with `depends-on: task-id`
- Visualize dependencies in graph
- Check for circular dependencies
- Critical path highlighting

**Technical Approach:**

- Custom syntax for dependencies
- D3.js or similar for visualization
- WebView panel for graph
- Parse with `@md2do/core` extension

### 12. Team Collaboration Indicators

**Goal:** Show who's working on what

**Features:**

- Live presence indicators (if file open)
- Recent activity (who modified what)
- @mention notifications
- Team stats dashboard

**Technical Approach:**

- Requires backend service
- WebSocket for real-time updates
- Decorations for presence
- May be separate enterprise feature

### 13. Smart Task Suggestions

**Goal:** AI-powered task assistance

**Features:**

- Suggest assignees based on file context
- Suggest tags based on task content
- Estimate due dates from priority
- Find related tasks
- Detect missing metadata

**Technical Approach:**

- Machine learning model or heuristics
- OpenAI API integration (optional)
- Local-first with offline mode
- Privacy-conscious (opt-in)

---

## Dream Features (v0.4.0+)

### 14. Gantt Chart View

**Goal:** Visual project timeline

**Features:**

- Timeline view of tasks with due dates
- Drag-and-drop to reschedule
- Milestone markers
- Export as image/PDF

### 15. Time Tracking

**Goal:** Track time spent on tasks

**Features:**

- Start/stop timer for active task
- Log time entries
- Daily/weekly reports
- Integration with time tracking services

### 16. Task Templates

**Goal:** Reusable task sets

**Features:**

- Create task templates
- Insert template with substitutions
- Share templates across team
- Template marketplace

### 17. Custom Dashboards

**Goal:** Personalized task views

**Features:**

- Drag-and-drop dashboard builder
- Widgets for different metrics
- Save/share dashboard layouts
- Export data

---

## Technical Architecture

### Core Technologies

**Extension Framework:**

- VS Code Extension API
- TypeScript
- Webpack for bundling

**Dependencies:**

- `@md2do/core` - Core task parsing/filtering
- `@md2do/todoist` - Todoist integration
- `date-fns` - Date parsing/formatting
- `vscode` - VS Code API types

### Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── providers/
│   │   ├── completionProvider.ts
│   │   ├── codeLensProvider.ts
│   │   ├── hoverProvider.ts
│   │   ├── treeDataProvider.ts
│   │   └── foldingProvider.ts
│   ├── commands/
│   │   ├── taskCommands.ts
│   │   ├── filterCommands.ts
│   │   └── todoistCommands.ts
│   ├── views/
│   │   ├── dashboardView.ts
│   │   ├── calendarView.ts
│   │   └── todoistView.ts
│   ├── services/
│   │   ├── taskScanner.ts
│   │   ├── cacheService.ts
│   │   └── syncService.ts
│   └── utils/
│       ├── textEditor.ts
│       └── configuration.ts
├── syntaxes/
│   └── md2do.tmLanguage.json
├── package.json
└── README.md
```

### Performance Considerations

**Challenges:**

- Scanning large workspaces
- Real-time updates on file changes
- Memory usage with many tasks

**Solutions:**

- Incremental scanning
- Debounced updates
- Caching parsed results
- Virtual scrolling for large lists
- Worker threads for heavy operations

---

## Configuration Options

```json
{
  "md2do.enableSyntaxHighlighting": true,
  "md2do.enableAutoComplete": true,
  "md2do.scanOnStartup": true,
  "md2do.scanExclude": ["**/node_modules/**", "**/dist/**"],
  "md2do.dashboard.showOverdue": true,
  "md2do.dashboard.sortBy": "priority",
  "md2do.codeLens.enabled": true,
  "md2do.todoist.autoSync": false,
  "md2do.todoist.syncInterval": 300,
  "md2do.colors.assignee": "#4EC9B0",
  "md2do.colors.priorityUrgent": "#F44747",
  "md2do.colors.priorityHigh": "#FF9800",
  "md2do.colors.priorityNormal": "#4FC1FF",
  "md2do.colors.tag": "#C586C0",
  "md2do.colors.date": "#6A9955"
}
```

---

## Development Roadmap

### Phase 1: MVP (Months 1-2)

- Set up extension scaffold
- Implement syntax highlighting
- Autocomplete for @assignees and #tags
- Priority quick insert
- Basic date picker
- Publish to VS Code Marketplace

### Phase 2: Enhanced (Months 3-4)

- Task dashboard sidebar
- Inline task statistics
- Quick filtering
- Task operations (toggle, assign, etc.)
- Improve performance
- User feedback integration

### Phase 3: Advanced (Months 5-6)

- Todoist integration panel
- Dependency visualization
- Smart suggestions
- Team features (if demand exists)

### Phase 4: Dream Features (Ongoing)

- Based on user requests
- Gantt charts
- Time tracking
- Templates
- Custom dashboards

---

## Marketing & Distribution

### VS Code Marketplace

**Listing Optimization:**

- Clear description with screenshots
- Demo GIF showing key features
- Keywords: markdown, todo, task, productivity, todoist
- Category: Productivity, Formatters
- Rating: Encourage user reviews

**Metrics to Track:**

- Downloads/installs
- Active users
- Ratings/reviews
- Feature requests

### Launch Strategy

1. **Soft Launch:** Release to md2do GitHub users first
2. **Blog Post:** "Introducing md2do for VS Code"
3. **Social Media:** Twitter, Reddit, LinkedIn
4. **Community:** VS Code extension showcase
5. **Updates:** Regular feature releases with changelogs

---

## Resources & Learning

### VS Code Extension Guides

- [Extension API Docs](https://code.visualstudio.com/api)
- [Language Extension Guide](https://code.visualstudio.com/api/language-extensions/overview)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)

### Similar Extensions (Inspiration)

- TODO Highlight
- Markdown All in One
- Jira and Bitbucket
- GitLens

### Tools

- [Yeoman generator](https://code.visualstudio.com/api/get-started/your-first-extension)
- [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) - Publishing tool
- [Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

---

## Success Criteria

### MVP Success

- 100+ installs in first month
- 4+ star rating
- 0 major bugs
- Positive user feedback

### Long-term Success

- 1000+ installs in 6 months
- 4.5+ star rating
- Active community (issues, PRs)
- Feature parity with CLI where applicable
- Seamless Todoist sync experience

---

## Open Questions

1. Should we support other task formats (Jira, GitHub Issues)?
2. How to handle very large workspaces (1000+ tasks)?
3. Enterprise features vs. free version?
4. Mobile/web version of extension?
5. Integration with other task management tools?

---

## Next Steps

1. ✅ Document the plan (this file)
2. ⏳ Create extension scaffold with Yeoman
3. ⏳ Implement basic syntax highlighting
4. ⏳ Set up development environment
5. ⏳ Create demo workspace for testing
6. ⏳ Build MVP features
7. ⏳ Test with early users
8. ⏳ Publish to marketplace

---

**Last Updated:** 2026-01-22
**Status:** Planning
**Owner:** Nick Hart
**Est. MVP Completion:** Q2 2026
