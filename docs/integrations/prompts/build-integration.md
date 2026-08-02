# Build an md2do Integration (Prompt)

Use this prompt to help any Claude agent — one with access to Teams, Outlook, Slack, Google
Calendar, or any other system — understand the md2do JSONL format well enough to produce
correct ingest files.

## How to Use

- **Paste it into any Claude conversation** that has access to your source system
- **Use it via MCP:** invoke the `build_integration` prompt from the md2do MCP server
  (`source=<slug>`, e.g. `source=teams`)
- **Save it as a slash command** in Claude Code for quick reuse

## Prompt

> Copy everything between the START and END markers (replace `{source}` with your source slug,
> e.g. `teams`, `outlook`, `slack`, `gcal`).

---PROMPT START---

You are helping build a new md2do source integration for: {source}.

md2do ingests external tasks via a JSONL file — one JSON record per line.
Your job: fetch tasks from {source}, write valid JSONL, then run the ingest command.

## JSONL Format

Required fields (every record must have all four):

source string — always "{source}"
externalId string — stable, unique ID for this item in {source}
text string — task description (plain text)
completed boolean — true if already done/resolved

Optional fields:

priority string — "urgent" | "high" | "normal" | "low"
dueDate string — YYYY-MM-DD (ISO date only, no time)
tags string[] — tag names, no # prefix
assignee string — username, no @ prefix
metadata object — any extra data (preserved, ignored by md2do)

## Example

{"source":"{source}","externalId":"abc-123","text":"Review Q3 budget","completed":false,"priority":"high","dueDate":"2026-08-15","tags":["finance"],"assignee":"nick"}
{"source":"{source}","externalId":"abc-456","text":"Old action item","completed":true}

## Instructions

1. Fetch all relevant items from {source} (unread @mentions, flagged emails, saved items, etc.)
2. Write one JSONL line per item to /tmp/{source}-tasks.jsonl
3. Choose externalId carefully — use the most stable unique identifier in {source}
   (message-id, event-id, thread-id — NOT a list index or timestamp alone)
4. Map priorities to md2do levels:
   - Critical / P0 / urgent → "urgent"
   - Important / P1 / high → "high"
   - Normal / P2 / medium → "normal"
   - Low / P3 / no priority → "low" (or omit)
5. Set completed: true only when explicitly done/resolved/closed in {source}

After writing the file, run:

md2do ingest /tmp/{source}-tasks.jsonl --vault ~/notes

This creates vault/{source}/{source}-tasks.md with all tasks in md2do format,
queryable via `md2do list`, the Obsidian plugin, and the MCP server.

---PROMPT END---

## Fields Reference

| Field        | Type     | Required | Description                                                                              |
| ------------ | -------- | -------- | ---------------------------------------------------------------------------------------- |
| `source`     | string   | yes      | Source system slug (e.g. `teams`, `outlook`) — must match across all records in the file |
| `externalId` | string   | yes      | Stable unique ID for the item in the source system                                       |
| `text`       | string   | yes      | Task description in plain text                                                           |
| `completed`  | boolean  | yes      | `true` if the item is done/resolved/closed                                               |
| `priority`   | string   | no       | `"urgent"` \| `"high"` \| `"normal"` \| `"low"`                                          |
| `dueDate`    | string   | no       | ISO date: `YYYY-MM-DD` (no time component)                                               |
| `tags`       | string[] | no       | Tag names without `#` prefix                                                             |
| `assignee`   | string   | no       | Username without `@` prefix                                                              |
| `metadata`   | object   | no       | Arbitrary extra data — preserved in output, ignored by md2do                             |

## Example: Microsoft Teams

Fetching unread @mentions and flagged messages from Teams:

```jsonl
{"source":"teams","externalId":"msg-1AABcd","text":"Follow up on the deployment plan","completed":false,"priority":"high","tags":["eng","infra"],"assignee":"nick","metadata":{"channel":"#releases","from":"alice@company.com"}}
{"source":"teams","externalId":"msg-2XYZef","text":"Review Q3 budget proposal","completed":false,"priority":"normal","dueDate":"2026-08-15","tags":["finance"]}
{"source":"teams","externalId":"msg-3GHIjk","text":"Approve onboarding docs","completed":true}
```

After writing to `/tmp/teams-tasks.jsonl`:

```bash
md2do ingest /tmp/teams-tasks.jsonl --vault ~/notes
# Creates: ~/notes/teams/teams-tasks.md
```

The resulting markdown:

```markdown
# teams-tasks

- [ ] Follow up on the deployment plan !high @nick #eng #infra {teams:msg-1AABcd}
- [ ] Review Q3 budget proposal #due/2026-08-15 #finance {teams:msg-2XYZef}
- [x] Approve onboarding docs {completed:2026-08-02} {teams:msg-3GHIjk}
```

Tasks are now queryable alongside everything else in your vault:

```bash
md2do list --path ~/notes/teams --incomplete
md2do list --priority high --due-this-week
```

## Next Steps

- [Multi-Source Ingestion](/integrations/ingest) — architecture overview and vault layout
- [ingest command reference](/cli/ingest) — full CLI options and JSONL spec
- [Task Format](/guide/task-format) — how `{source:ID}` tokens are parsed
