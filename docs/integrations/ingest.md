# Multi-Source Ingestion

Bring tasks from any external system into your markdown vault — Teams, Outlook, Slack,
calendar apps, or anything else — using a simple JSONL intermediate format.

## Overview

md2do has a **native Todoist integration** with full two-way sync. For everything else, the
**ingest system** provides an open, source-agnostic pipeline:

1. An agent (MCP, script, cron job) fetches tasks from an external system
2. It writes them to a JSONL file — one task record per line
3. `md2do ingest` converts the JSONL into a markdown vault file
4. The vault file is fully parsed by `md2do list`, filters, Obsidian plugin, etc.

No API credentials needed in md2do. No hardcoded integrations. Any system that can emit
JSON can feed into your vault.

## Source Links: `{slug:ID}`

The core primitive that makes this work is the **source link** — a `{slug:ID}` brace token
in the task line:

```markdown
- [ ] Follow up on PR review {teams:msg-789}
- [ ] Review Q3 budget {outlook:AAMk-abc}
- [ ] Ship the release {todoist:123456789}
```

The slug identifies the source system, and the ID is the record's unique identifier in that
system. md2do parses every `{word:value}` token on a task line (except reserved words like
`completed`) and stores them in `task.sources`:

```json
{
  "text": "Follow up on PR review",
  "sources": { "teams": "msg-789" }
}
```

This is the same mechanism Todoist uses — `{todoist:ID}` is just the native integration's
instance of the general pattern.

::: tip Reserved slugs
`completed` is reserved for completion dates (`{completed:2026-08-02}`). All other slugs
are open and treated as source links.
:::

## JSONL Format

The intermediate format is newline-delimited JSON (JSONL). Each line is one task:

```jsonl
{"source":"teams","externalId":"msg-789","text":"Follow up on PR review","completed":false,"priority":"normal","tags":["eng"]}
{"source":"outlook","externalId":"AAMk-abc","text":"Review Q3 budget","completed":false,"priority":"high","dueDate":"2026-08-10","tags":["finance"],"assignee":"nick","metadata":{"from":"boss@company.com"}}
{"source":"slack","externalId":"C01234-1722556800","text":"Respond to thread in #releases","completed":false}
```

See the [ingest command reference](/cli/ingest#jsonl-format) for the full field spec.

## Vault Layout

Ingested files live under a source-named subdirectory in your vault:

```
vault/
  teams/
    mentions.md       # md2do ingest teams-mentions.jsonl --vault vault
  outlook/
    flagged.md        # md2do ingest outlook-flagged.jsonl --vault vault
  slack/
    saved.md          # md2do ingest slack-saved.jsonl --vault vault
  todoist/            # (if using ingest for Todoist — usually use native sync instead)
    inbox.md
```

These files are **fully regenerated** on every ingest run. Don't hand-edit them.

## MCP Agent Workflow

The most powerful use case: an MCP agent (e.g. Claude with M365 access) reads from
external APIs and emits JSONL that md2do consumes.

### Example: Teams + Outlook with Claude

```
Claude (with M365 MCP tools)
  └── reads Teams mentions, Outlook flagged emails
  └── writes /tmp/teams-mentions.jsonl
  └── writes /tmp/outlook-flagged.jsonl

md2do ingest /tmp/teams-mentions.jsonl --vault ~/notes
md2do ingest /tmp/outlook-flagged.jsonl --vault ~/notes
```

The agent handles authentication and API access. md2do handles the markdown conversion
and vault management. Neither needs to know about the other's internals.

### Prompt template

You can use this as a starting point with any MCP-capable agent that has calendar/mail/chat access:

```
Fetch all flagged emails from my Outlook inbox and any unread @mentions from Teams
from the last 7 days. For each item, output a JSONL record with fields:
source, externalId, text, completed (false), priority (urgent/high/normal/low),
dueDate (YYYY-MM-DD if applicable), tags, assignee, metadata.

Write the Teams records to /tmp/teams.jsonl and Outlook records to /tmp/outlook.jsonl.
```

Then run:

```bash
md2do ingest /tmp/teams.jsonl --vault ~/notes
md2do ingest /tmp/outlook.jsonl --vault ~/notes
```

## The Full Pipeline

```
External System          JSONL File           Markdown Vault
──────────────       ──────────────────     ──────────────────────────
Teams mentions   ──► teams.jsonl       ──► vault/teams/mentions.md
Outlook email    ──► outlook.jsonl     ──► vault/outlook/flagged.md
Slack saved      ──► slack.jsonl       ──► vault/slack/saved.md
Todoist (native) ──► (direct sync)     ──► your existing notes
                          │
                          ▼
                  md2do ingest ...
                          │
                          ▼
              md2do list / Obsidian plugin
              (all sources unified)
```

Once in the vault, all tasks — regardless of source — are queryable with the same tools:

```bash
# Tasks from Teams due this week
md2do list --tag eng --due-this-week

# All urgent tasks across all sources
md2do list --priority urgent --incomplete

# Tasks from a specific source
md2do list --path vault/outlook
```

## Comparing: Native Todoist vs Ingest

|                    | Todoist (native)      | Ingest system            |
| ------------------ | --------------------- | ------------------------ |
| **Setup**          | API token in config   | No md2do config needed   |
| **Sync direction** | Two-way (pull + push) | One-way (source → vault) |
| **Live sync**      | `md2do todoist sync`  | Re-run `md2do ingest`    |
| **Source link**    | `{todoist:ID}`        | `{slug:ID}` (any slug)   |
| **Best for**       | Todoist power users   | Everything else          |

For Todoist specifically, use the [native integration](/integrations/todoist) — it gives you
full two-way sync, priority mapping, label sync, and more. Use `ingest` for sources that
don't have a native md2do integration yet.

## Building a Custom Provider

If you want programmatic integration (vs. agent-generated JSONL), implement the
`SourceProvider` interface from `@md2do/core`:

```typescript
import type { SourceProvider, SourceTask, FetchOptions } from '@md2do/core';

export class SlackProvider implements SourceProvider {
  readonly slug = 'slack';
  readonly name = 'Slack';

  async fetchTasks(options?: FetchOptions): Promise<SourceTask[]> {
    // fetch saved messages from Slack API
    const messages = await this.slackClient.getSavedMessages();
    return messages.map((msg) => ({
      externalId: msg.ts,
      text: msg.text,
      completed: false,
      tags: [msg.channel],
    }));
  }
}
```

Then use `ingestRecords()` from `@md2do/core` to convert to markdown:

```typescript
import { ingestRecords } from '@md2do/core';

const provider = new SlackProvider(slackClient);
const tasks = await provider.fetchTasks();
const records = tasks.map((t) => ({ source: provider.slug, ...t }));
const markdown = ingestRecords(records);
```

## Next Steps

- [ingest command reference](/cli/ingest) — full CLI options and JSONL spec
- [Todoist Integration](/integrations/todoist) — native two-way sync with Todoist
- [Task Format](/guide/task-format) — how `{slug:ID}` source links are parsed
