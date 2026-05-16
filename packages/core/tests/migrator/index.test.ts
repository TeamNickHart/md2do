import { describe, it, expect } from 'vitest';
import { migrateContent } from '../../src/migrator/index.js';

describe('migrateContent', () => {
  describe('due date migration', () => {
    it('should migrate [due: YYYY-MM-DD] to #due/YYYY-MM-DD', () => {
      const result = migrateContent('- [ ] Task [due: 2026-01-25]');
      expect(result.content).toBe('- [ ] Task #due/2026-01-25');
      expect(result.changes).toHaveLength(1);
    });

    it('should migrate [due:YYYY-MM-DD] without spaces', () => {
      const result = migrateContent('- [ ] Task [due:2026-01-25]');
      expect(result.content).toBe('- [ ] Task #due/2026-01-25');
    });

    it('should drop time component with warning', () => {
      const result = migrateContent('- [ ] Task [due: 2026-01-25 17:00]');
      expect(result.content).toBe('- [ ] Task #due/2026-01-25');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.message).toContain('Time component dropped');
    });

    it('should convert short date M/D/YY to ISO', () => {
      const result = migrateContent('- [ ] Task [due: 1/25/26]');
      expect(result.content).toBe('- [ ] Task #due/2026-01-25');
    });

    it('should convert short date M/D/YYYY to ISO', () => {
      const result = migrateContent('- [ ] Task [due: 1/25/2026]');
      expect(result.content).toBe('- [ ] Task #due/2026-01-25');
    });

    it('should drop M/D (no year) with warning', () => {
      const result = migrateContent('- [ ] Task [due: 1/25]');
      expect(result.content).toBe('- [ ] Task');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.message).toContain('without year');
    });

    it('should drop relative dates with warning', () => {
      const result = migrateContent('- [ ] Task [due: tomorrow]');
      expect(result.content).toBe('- [ ] Task');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.message).toContain('Relative date dropped');
    });

    it('should drop "today" relative date with warning', () => {
      const result = migrateContent('- [ ] Task [due: today]');
      expect(result.content).toBe('- [ ] Task');
      expect(result.warnings).toHaveLength(1);
    });

    it('should drop "next week" relative date with warning', () => {
      const result = migrateContent('- [ ] Task [due: next week]');
      expect(result.content).toBe('- [ ] Task');
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('completed date migration', () => {
    it('should migrate [completed: YYYY-MM-DD] to {completed:YYYY-MM-DD}', () => {
      const result = migrateContent('- [x] Task [completed: 2026-01-18]');
      expect(result.content).toBe('- [x] Task {completed:2026-01-18}');
      expect(result.changes).toHaveLength(1);
    });

    it('should handle case-insensitive', () => {
      const result = migrateContent('- [x] Task [COMPLETED: 2026-01-18]');
      expect(result.content).toBe('- [x] Task {completed:2026-01-18}');
    });
  });

  describe('todoist ID migration', () => {
    it('should migrate [todoist:NNN] to {todoist:NNN}', () => {
      const result = migrateContent('- [ ] Task [todoist:123456]');
      expect(result.content).toBe('- [ ] Task {todoist:123456}');
      expect(result.changes).toHaveLength(1);
    });

    it('should handle whitespace in legacy syntax', () => {
      const result = migrateContent('- [ ] Task [todoist: 123456]');
      expect(result.content).toBe('- [ ] Task {todoist:123456}');
    });
  });

  describe('combined migration', () => {
    it('should migrate all metadata in a single line', () => {
      const input =
        '- [x] @nick Fix bug !! #backend [due: 2026-01-25] [todoist:123] [completed: 2026-01-18]';
      const result = migrateContent(input);
      expect(result.content).toBe(
        '- [x] @nick Fix bug !! #backend #due/2026-01-25 {todoist:123} {completed:2026-01-18}',
      );
    });

    it('should handle multiple lines', () => {
      const input = [
        '# Tasks',
        '- [ ] Task one [due: 2026-01-25]',
        '- [x] Task two [completed: 2026-01-18] [todoist:456]',
        '- [ ] Task three (no metadata)',
      ].join('\n');

      const result = migrateContent(input);
      const lines = result.content.split('\n');
      expect(lines[0]).toBe('# Tasks');
      expect(lines[1]).toBe('- [ ] Task one #due/2026-01-25');
      expect(lines[2]).toBe(
        '- [x] Task two {completed:2026-01-18} {todoist:456}',
      );
      expect(lines[3]).toBe('- [ ] Task three (no metadata)');
      expect(result.changes).toHaveLength(2);
    });
  });

  describe('no-op cases', () => {
    it('should not modify already-migrated content', () => {
      const input = '- [ ] Task #due/2026-01-25 {todoist:123}';
      const result = migrateContent(input);
      expect(result.content).toBe(input);
      expect(result.changes).toHaveLength(0);
    });

    it('should not modify lines without metadata', () => {
      const input = '- [ ] Simple task #backend';
      const result = migrateContent(input);
      expect(result.content).toBe(input);
      expect(result.changes).toHaveLength(0);
    });

    it('should not modify non-task lines', () => {
      const input = '# Heading\nSome paragraph text.';
      const result = migrateContent(input);
      expect(result.content).toBe(input);
      expect(result.changes).toHaveLength(0);
    });
  });
});
