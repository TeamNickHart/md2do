# Blog Post Outline: "md2do - Task Management for Developers Who Live in Markdown"

**Target Length:** ~1,800 words (~8-10 minute read)

---

## I. Hook/Opening (~200 words)

**Your Story:**

- Years of trying different note-taking systems
- The moment you realized: Stop fighting it, embrace markdown in your IDE
- The problem that remained: Great for notes, chaotic for tracking action items
- The solution: Built md2do (with Claude's help)

**Key Points to Cover:**

- Personal journey/authenticity
- The "aha moment" of markdown
- Transition to "but there was still a problem..."

---

## II. The Elegance of Markdown for TODOs (~250 words)

**Main Points:**

- Standard `- [ ]` syntax everyone already knows
- Lives where you work (in your IDE, not another app)
- Version control, grep-able, plain text, portable
- Future-proof (no vendor lock-in)

**Supporting Example:**

```markdown
- [ ] Schedule architecture review session @nick ! #meeting (2026-01-22)
- [x] Review Q1 performance goals @nick (2026-01-18)
- [ ] Prepare tech talk on microservices @nick !! #presentation (2026-01-25)
```

**Emphasize:**

- Simplicity
- Already part of your workflow
- No context switching

---

## III. md2do's Enhancement (~300 words)

### The Metadata Syntax

**Explain each element:**

- `@username` - Task assignee (for teams or personal context)
- `!!!` / `!!` / `!` - Priority levels (urgent/high/normal)
- `#tag` - Categorization and filtering
- `(YYYY-MM-DD)` - Due dates
- `- [x]` vs `- [ ]` - Completion status

### Context from Folder Structure

**Show the pattern:**

```
projects/
  acme-app/         # Automatic project context
    bugs.md
  widget-co/
    roadmap.md
1-1s/
  nick.md           # Automatic person context
  jane.md
```

**Key Principle:**

- Your organization becomes queryable
- md2do extracts context automatically
- No manual tagging required for project/person

**Example to Show:**
[See Example 1 below - Widget Co Roadmap snippet]

---

## IV. The Problem md2do Solves (~250 words)

### The Scale Problem

- Started with 5 markdown files → now 50+
- Hundreds of TODOs scattered everywhere
- Questions you can't answer:
  - "What's overdue?"
  - "What urgent tasks does @nick have?"
  - "Show me all #backend tasks"
  - "What's my team working on this week?"

### The Solution

- **md2do as intelligent filter + custom formatter**
- Your markdown files remain the source of truth
- No database, no import/export, no lock-in
- Just enhanced visibility and organization

**Key Differentiator:**

- Not another task manager trying to replace your workflow
- Enhances what you're already doing
- Works with your existing files

---

## V. Under the Hood (~400 words)

### Tech Stack

- **TypeScript** - Type-safe from the ground up
- **Monorepo** - 5 packages (core, cli, config, todoist, mcp)
- **Modern tooling** - pnpm, tsup, vitest
- **Quality** - 400+ tests, 97% coverage
- **Performance** - Fast-glob for scanning, efficient parsing

### Core Principles

**1. Markdown is the Source of Truth**

- md2do reads, rarely writes
- Your files remain portable
- No proprietary format

**2. Simple, Clear Syntax**

- No complex YAML frontmatter
- Metadata is inline, readable
- Works in any markdown editor

**3. Powerful Filtering**

- Combine multiple filters
- Sort by any field
- Output in multiple formats

### Integrations

**Model Context Protocol (MCP)**

- Ask Claude: "What urgent tasks does @nick have?"
- AI-powered task analysis and reporting
- Works with Claude Code and other AI assistants
- Natural language queries over your tasks

**Todoist Sync**

- Two-way synchronization foundation
- Mobile access, collaboration features
- Mature API, 25M+ users

**Why Todoist?**

- Most mature task management API
- Works everywhere (mobile, web, desktop)
- Strong collaboration features
- Huge user base means long-term stability

---

## VI. Examples & Demonstrations (~400 words)

**Structure:**

1. Show raw markdown
2. Show md2do command
3. Show output
4. Explain what happened

**Examples to Include:**

- Example 1: Raw markdown file
- Example 2: Filter by project + priority
- Example 3: Stats grouped by assignee
- Example 4: Complex multi-filter query
- Example 5: Different output formats

[See generated examples below]

**Emphasize:**

- Speed and ease of use
- Power of combining filters
- Beautiful, readable output
- Clickable file links (VS Code integration)

---

## VII. Closing (~100 words)

**Call to Action:**

- It's open source, MIT licensed
- Published on npm, ready to use
- Try it now: `npx @md2do/cli list`
- Star on GitHub if you find it useful

**Acknowledgment:**

- Built with Claude's help (be specific about collaboration)
- Part of the new era of AI-assisted development

**Links:**

- GitHub: https://github.com/TeamNickHart/md2do
- npm: https://www.npmjs.com/package/@md2do/cli
- Docs: https://md2do.com (if applicable)

**Final Note:**

- Invitation to share feedback, contribute, or just try it out
- "If you're a developer who lives in markdown, this might change how you manage tasks."

---

## Additional Elements to Consider

### Sidebar: "My Daily Workflow"

Quick day-in-the-life showing how you use md2do:

```bash
# Morning: What's urgent today?
md2do list --priority urgent --due-today

# Check what's overdue
md2do list --overdue --assignee nick

# Before standup: Quick stats
md2do stats --by priority
```

### Visual Elements Needed

- Terminal screenshots (use generated examples)
- Before/after comparison (files vs organized view)
- Maybe: Simple architecture diagram

### Tone Notes

- Conversational, developer-to-developer
- Authentic (mention the real problems you faced)
- Practical (focus on real use cases)
- Enthusiastic but grounded
- Technical but accessible

---

## Generated Examples Follow Below...
