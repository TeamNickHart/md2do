import type { IngestRecord } from '../types/index.js';

/**
 * Parse JSONL content into IngestRecord array
 *
 * @param content - JSONL string (one JSON object per line)
 * @returns Array of validated IngestRecord objects
 * @throws Error with line number on malformed JSON or missing required fields
 */
export function parseJsonl(content: string): IngestRecord[] {
  const records: IngestRecord[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue; // skip blank lines

    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      throw new Error(`Line ${i + 1}: Invalid JSON: ${line}`);
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error(`Line ${i + 1}: Expected a JSON object`);
    }

    const obj = parsed as Record<string, unknown>;

    // Validate required fields
    if (typeof obj['source'] !== 'string' || !obj['source']) {
      throw new Error(`Line ${i + 1}: Missing required field "source"`);
    }
    if (typeof obj['externalId'] !== 'string' || !obj['externalId']) {
      throw new Error(`Line ${i + 1}: Missing required field "externalId"`);
    }
    if (typeof obj['text'] !== 'string' || !obj['text']) {
      throw new Error(`Line ${i + 1}: Missing required field "text"`);
    }
    if (typeof obj['completed'] !== 'boolean') {
      throw new Error(
        `Line ${i + 1}: Missing required field "completed" (must be boolean)`,
      );
    }

    const record: IngestRecord = {
      source: obj['source'],
      externalId: obj['externalId'],
      text: obj['text'],
      completed: obj['completed'],
    };

    if (typeof obj['priority'] === 'string') record.priority = obj['priority'];
    if (typeof obj['dueDate'] === 'string') record.dueDate = obj['dueDate'];
    if (
      Array.isArray(obj['tags']) &&
      obj['tags'].every((t) => typeof t === 'string')
    ) {
      record.tags = obj['tags'];
    }
    if (typeof obj['assignee'] === 'string') record.assignee = obj['assignee'];
    if (
      typeof obj['metadata'] === 'object' &&
      obj['metadata'] !== null &&
      !Array.isArray(obj['metadata'])
    ) {
      record.metadata = obj['metadata'] as Record<string, unknown>;
    }

    records.push(record);
  }

  return records;
}

/**
 * Convert a priority string to exclamation mark notation
 */
function priorityMarker(priority: string | undefined): string {
  switch (priority) {
    case 'urgent':
      return ' !!!';
    case 'high':
      return ' !!';
    case 'normal':
      return ' !';
    default:
      return '';
  }
}

/**
 * Convert a single IngestRecord to a markdown task line
 *
 * Format: - [ ] text @assignee PRIORITY #tags #due/DATE {source:externalId} {completed:DATE}
 *
 * @param record - The ingest record to convert
 * @param today - Today's date string (YYYY-MM-DD) used for completed date; defaults to current date
 * @returns Markdown task line string
 */
export function ingestRecordToLine(
  record: IngestRecord,
  today?: string,
): string {
  const checkbox = record.completed ? '- [x]' : '- [ ]';
  let line = `${checkbox} ${record.text}`;

  if (record.assignee) {
    line += ` @${record.assignee}`;
  }

  line += priorityMarker(record.priority);

  if (record.tags && record.tags.length > 0) {
    line += ' ' + record.tags.map((t) => `#${t}`).join(' ');
  }

  if (record.dueDate) {
    line += ` #due/${record.dueDate}`;
  }

  line += ` {${record.source}:${record.externalId}}`;

  if (record.completed) {
    const completedDate = today ?? new Date().toISOString().slice(0, 10);
    line += ` {completed:${completedDate}}`;
  }

  return line;
}

/**
 * Generate a markdown document from an array of IngestRecord objects
 *
 * Groups incomplete tasks first, then a "## Completed" section.
 * H1 title defaults to title-cased source slug from first record.
 *
 * @param records - Array of ingest records
 * @param title - Optional override for the H1 title
 * @param today - Today's date string (YYYY-MM-DD) for completed dates
 * @returns Full markdown document string
 */
export function ingestRecords(
  records: IngestRecord[],
  title?: string,
  today?: string,
): string {
  if (records.length === 0) return '';

  const sourceSlug = records[0]!.source;
  const heading =
    title ?? sourceSlug.charAt(0).toUpperCase() + sourceSlug.slice(1);

  const incomplete = records.filter((r) => !r.completed);
  const completed = records.filter((r) => r.completed);

  const lines: string[] = [`# ${heading}`, ''];

  for (const record of incomplete) {
    lines.push(ingestRecordToLine(record, today));
  }

  if (completed.length > 0) {
    if (incomplete.length > 0) lines.push('');
    lines.push('## Completed', '');
    for (const record of completed) {
      lines.push(ingestRecordToLine(record, today));
    }
  }

  lines.push('');
  return lines.join('\n');
}
