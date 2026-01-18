# md2do Examples

This directory contains example markdown files that demonstrate all features of md2do. These files also serve as E2E test fixtures.

## Directory Structure

- `projects/acme-app/` - Project tasks with sprint planning and team collaboration
- `projects/widget-co/` - Another project demonstrating multi-project support
- `1-1s/` - One-on-one meeting notes with action items
- `personal/` - Personal task lists

## Features Demonstrated

Each file showcases different md2do features:

- ✅ Task completion tracking (`- [ ]` and `- [x]`)
- 👤 Assignees (`@nick`, `@jane`, `@alex`)
- ⚡ Priority levels (`!`, `!!`, `!!!`)
- 📅 Due dates (absolute and relative with context)
- 🏷️ Tags (`#backend`, `#urgent`, etc.)
- 📁 Project context (from folder structure)
- 👥 Person context (from file names)
- 📆 Context dates (from heading dates)
- ✨ Completed task timestamps
- 🔗 Todoist integration markers

## Usage

Run md2do commands against this directory to see the tool in action:

```bash
# List all tasks
md2do list --path=examples

# Filter by project
md2do list --project=acme-app --path=examples

# Show overdue tasks
md2do list --overdue --path=examples

# View stats
md2do stats --path=examples
```
