import { describe, it, expect } from 'vitest';
import {
  parseJsonl,
  ingestRecordToLine,
  ingestRecords,
} from '../../src/ingest/index.js';
import type { IngestRecord } from '../../src/types/index.js';

describe('parseJsonl', () => {
  it('should parse a single valid record', () => {
    const line = JSON.stringify({
      source: 'teams',
      externalId: 'msg-1',
      text: 'Review PR',
      completed: false,
    });
    const records = parseJsonl(line);
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      source: 'teams',
      externalId: 'msg-1',
      text: 'Review PR',
      completed: false,
    });
  });

  it('should parse multiple records', () => {
    const content = [
      JSON.stringify({
        source: 'teams',
        externalId: 'a',
        text: 'Task A',
        completed: false,
      }),
      JSON.stringify({
        source: 'teams',
        externalId: 'b',
        text: 'Task B',
        completed: true,
      }),
    ].join('\n');
    const records = parseJsonl(content);
    expect(records).toHaveLength(2);
  });

  it('should skip blank lines', () => {
    const content = [
      JSON.stringify({
        source: 'teams',
        externalId: 'a',
        text: 'Task A',
        completed: false,
      }),
      '',
      JSON.stringify({
        source: 'teams',
        externalId: 'b',
        text: 'Task B',
        completed: false,
      }),
      '   ',
    ].join('\n');
    const records = parseJsonl(content);
    expect(records).toHaveLength(2);
  });

  it('should parse optional fields', () => {
    const line = JSON.stringify({
      source: 'outlook',
      externalId: 'AAMk',
      text: 'Budget review',
      completed: false,
      priority: 'high',
      dueDate: '2026-08-10',
      tags: ['finance'],
      assignee: 'nick',
      metadata: { from: 'boss@co.com' },
    });
    const records = parseJsonl(line);
    expect(records[0]).toEqual({
      source: 'outlook',
      externalId: 'AAMk',
      text: 'Budget review',
      completed: false,
      priority: 'high',
      dueDate: '2026-08-10',
      tags: ['finance'],
      assignee: 'nick',
      metadata: { from: 'boss@co.com' },
    });
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseJsonl('not valid json')).toThrow('Line 1: Invalid JSON');
  });

  it('should throw with line number on invalid JSON in line 2', () => {
    const content = [
      JSON.stringify({
        source: 'teams',
        externalId: 'a',
        text: 'Task A',
        completed: false,
      }),
      'oops',
    ].join('\n');
    expect(() => parseJsonl(content)).toThrow('Line 2: Invalid JSON');
  });

  it('should throw on missing "source" field', () => {
    expect(() =>
      parseJsonl(
        JSON.stringify({ externalId: 'a', text: 'Task', completed: false }),
      ),
    ).toThrow('source');
  });

  it('should throw on missing "externalId" field', () => {
    expect(() =>
      parseJsonl(
        JSON.stringify({ source: 'teams', text: 'Task', completed: false }),
      ),
    ).toThrow('externalId');
  });

  it('should throw on missing "text" field', () => {
    expect(() =>
      parseJsonl(
        JSON.stringify({ source: 'teams', externalId: 'a', completed: false }),
      ),
    ).toThrow('text');
  });

  it('should throw on missing "completed" field', () => {
    expect(() =>
      parseJsonl(
        JSON.stringify({ source: 'teams', externalId: 'a', text: 'Task' }),
      ),
    ).toThrow('completed');
  });

  it('should return empty array for empty string', () => {
    expect(parseJsonl('')).toEqual([]);
  });
});

describe('ingestRecordToLine', () => {
  const baseRecord: IngestRecord = {
    source: 'teams',
    externalId: 'msg-1',
    text: 'Review PR',
    completed: false,
  };

  it('should produce an incomplete task line', () => {
    const line = ingestRecordToLine(baseRecord);
    expect(line).toBe('- [ ] Review PR {teams:msg-1}');
  });

  it('should produce a completed task line with today date', () => {
    const line = ingestRecordToLine(
      { ...baseRecord, completed: true },
      '2026-08-02',
    );
    expect(line).toBe('- [x] Review PR {teams:msg-1} {completed:2026-08-02}');
  });

  it('should include assignee', () => {
    const line = ingestRecordToLine({ ...baseRecord, assignee: 'nick' });
    expect(line).toContain('@nick');
  });

  it('should include priority markers', () => {
    expect(ingestRecordToLine({ ...baseRecord, priority: 'urgent' })).toContain(
      '!!!',
    );
    expect(ingestRecordToLine({ ...baseRecord, priority: 'high' })).toContain(
      '!!',
    );
    expect(ingestRecordToLine({ ...baseRecord, priority: 'normal' })).toContain(
      '!',
    );
    expect(
      ingestRecordToLine({ ...baseRecord, priority: 'low' }),
    ).not.toContain('!');
  });

  it('should include tags', () => {
    const line = ingestRecordToLine({ ...baseRecord, tags: ['eng', 'review'] });
    expect(line).toContain('#eng');
    expect(line).toContain('#review');
  });

  it('should include due date', () => {
    const line = ingestRecordToLine({ ...baseRecord, dueDate: '2026-08-10' });
    expect(line).toContain('#due/2026-08-10');
  });

  it('should include all metadata in correct order', () => {
    const record: IngestRecord = {
      source: 'outlook',
      externalId: 'AAMk',
      text: 'Budget review',
      completed: false,
      priority: 'high',
      dueDate: '2026-08-10',
      tags: ['finance'],
      assignee: 'nick',
    };
    const line = ingestRecordToLine(record);
    expect(line).toBe(
      '- [ ] Budget review @nick !! #finance #due/2026-08-10 {outlook:AAMk}',
    );
  });
});

describe('ingestRecords', () => {
  it('should return empty string for empty records', () => {
    expect(ingestRecords([])).toBe('');
  });

  it('should generate markdown with H1 from source slug', () => {
    const records: IngestRecord[] = [
      {
        source: 'teams',
        externalId: 'msg-1',
        text: 'Task A',
        completed: false,
      },
    ];
    const md = ingestRecords(records, undefined, '2026-08-02');
    expect(md).toContain('# Teams');
    expect(md).toContain('- [ ] Task A {teams:msg-1}');
  });

  it('should use custom title', () => {
    const records: IngestRecord[] = [
      {
        source: 'teams',
        externalId: 'msg-1',
        text: 'Task A',
        completed: false,
      },
    ];
    const md = ingestRecords(records, 'My Custom Title', '2026-08-02');
    expect(md).toContain('# My Custom Title');
  });

  it('should separate incomplete and completed tasks', () => {
    const records: IngestRecord[] = [
      {
        source: 'teams',
        externalId: 'a',
        text: 'Incomplete',
        completed: false,
      },
      { source: 'teams', externalId: 'b', text: 'Done', completed: true },
    ];
    const md = ingestRecords(records, undefined, '2026-08-02');
    expect(md).toContain('- [ ] Incomplete');
    expect(md).toContain('## Completed');
    expect(md).toContain('- [x] Done');
    // Incomplete should appear before Completed section
    expect(md.indexOf('- [ ] Incomplete')).toBeLessThan(
      md.indexOf('## Completed'),
    );
  });

  it('should omit Completed section if no completed records', () => {
    const records: IngestRecord[] = [
      {
        source: 'teams',
        externalId: 'a',
        text: 'Incomplete',
        completed: false,
      },
    ];
    const md = ingestRecords(records, undefined, '2026-08-02');
    expect(md).not.toContain('## Completed');
  });

  it('should end with a trailing newline', () => {
    const records: IngestRecord[] = [
      { source: 'teams', externalId: 'a', text: 'Task', completed: false },
    ];
    const md = ingestRecords(records, undefined, '2026-08-02');
    expect(md.endsWith('\n')).toBe(true);
  });
});
