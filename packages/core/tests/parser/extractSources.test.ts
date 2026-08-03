import { describe, it, expect } from 'vitest';
import { extractSources, formatSources } from '../../src/parser/index.js';

describe('extractSources', () => {
  it('should return undefined for text with no brace tokens', () => {
    expect(extractSources('Fix bug @nick !! #backend')).toBeUndefined();
  });

  it('should extract a single todoist brace token', () => {
    expect(extractSources('Fix bug {todoist:123456}')).toEqual({
      todoist: '123456',
    });
  });

  it('should extract multiple source tokens', () => {
    expect(extractSources('Fix bug {todoist:123} {teams:msg-456}')).toEqual({
      todoist: '123',
      teams: 'msg-456',
    });
  });

  it('should skip reserved slug "completed"', () => {
    expect(extractSources('Fix bug {completed:2026-01-18}')).toBeUndefined();
  });

  it('should extract non-reserved tokens and skip completed', () => {
    expect(
      extractSources('Fix bug {todoist:123} {completed:2026-01-18}'),
    ).toEqual({ todoist: '123' });
  });

  it('should handle legacy [todoist:NNN] bracket syntax', () => {
    expect(extractSources('Fix bug [todoist:123456]')).toEqual({
      todoist: '123456',
    });
  });

  it('should handle legacy [todoist: NNN] with space', () => {
    expect(extractSources('Fix bug [todoist: 987654]')).toEqual({
      todoist: '987654',
    });
  });

  it('should prefer brace syntax over legacy bracket syntax for todoist', () => {
    // Both present: brace wins, legacy ignored
    expect(extractSources('Fix bug {todoist:111} [todoist:222]')).toEqual({
      todoist: '111',
    });
  });

  it('should extract non-todoist brace tokens alongside legacy todoist', () => {
    expect(extractSources('Fix bug {teams:msg-1} [todoist:222]')).toEqual({
      teams: 'msg-1',
      todoist: '222',
    });
  });

  it('should return undefined for only reserved tokens', () => {
    expect(extractSources('Task {completed:2026-08-01}')).toBeUndefined();
  });

  it('should handle slug with numbers', () => {
    expect(extractSources('Task {source2:abc123}')).toEqual({
      source2: 'abc123',
    });
  });
});

describe('formatSources', () => {
  it('should format a single source', () => {
    expect(formatSources({ todoist: '123' })).toBe('{todoist:123}');
  });

  it('should format multiple sources', () => {
    const result = formatSources({ todoist: '123', teams: 'msg-456' });
    // Order may vary (object key order), check both slugs are present
    expect(result).toContain('{todoist:123}');
    expect(result).toContain('{teams:msg-456}');
  });

  it('should return empty string for empty object', () => {
    expect(formatSources({})).toBe('');
  });
});
