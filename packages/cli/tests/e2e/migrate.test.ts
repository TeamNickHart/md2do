/**
 * E2E Tests: md2do migrate command
 *
 * Tests the syntax migration from legacy bracket syntax to new tag/brace syntax.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

const cliPath = join(__dirname, '../../dist/cli.js');

function createTempDir(files: Record<string, string>): string {
  const tmpDir = mkdtempSync(join(tmpdir(), 'md2do-migrate-'));
  for (const [filename, content] of Object.entries(files)) {
    writeFileSync(join(tmpDir, filename), content);
  }
  return tmpDir;
}

describe('E2E: md2do migrate', () => {
  it('should migrate due dates from bracket to tag syntax', () => {
    const tmpDir = createTempDir({
      'tasks.md': [
        '# Tasks',
        '- [ ] Task one [due: 2026-05-15]',
        '- [ ] Task two [due: 2026-06-01]',
        '- [ ] Already migrated #due:2026-07-01',
      ].join('\n'),
    });

    try {
      execSync(`node ${cliPath} migrate --path ${tmpDir}`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe(
        [
          '# Tasks',
          '- [ ] Task one #due:2026-05-15',
          '- [ ] Task two #due:2026-06-01',
          '- [ ] Already migrated #due:2026-07-01',
        ].join('\n'),
      );
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should migrate completed dates from bracket to brace syntax', () => {
    const tmpDir = createTempDir({
      'tasks.md': [
        '- [x] Done task [completed: 2026-05-10]',
        '- [x] Also done [completed:2026-05-11]',
      ].join('\n'),
    });

    try {
      execSync(`node ${cliPath} migrate --path ${tmpDir}`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe(
        [
          '- [x] Done task {completed:2026-05-10}',
          '- [x] Also done {completed:2026-05-11}',
        ].join('\n'),
      );
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should migrate todoist IDs from bracket to brace syntax', () => {
    const tmpDir = createTempDir({
      'tasks.md': '- [ ] Synced task [todoist:987654]\n',
    });

    try {
      execSync(`node ${cliPath} migrate --path ${tmpDir}`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe('- [ ] Synced task {todoist:987654}\n');
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should migrate all metadata in a single line', () => {
    const tmpDir = createTempDir({
      'tasks.md':
        '- [x] @nick Fix bug !! #backend [due: 2026-01-25] [todoist:123] [completed: 2026-01-18]\n',
    });

    try {
      execSync(`node ${cliPath} migrate --path ${tmpDir}`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe(
        '- [x] @nick Fix bug !! #backend #due:2026-01-25 {todoist:123} {completed:2026-01-18}\n',
      );
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should convert short dates to ISO format', () => {
    const tmpDir = createTempDir({
      'tasks.md': [
        '- [ ] Short date [due: 1/25/26]',
        '- [ ] Full year [due: 1/25/2026]',
      ].join('\n'),
    });

    try {
      execSync(`node ${cliPath} migrate --path ${tmpDir}`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe(
        [
          '- [ ] Short date #due:2026-01-25',
          '- [ ] Full year #due:2026-01-25',
        ].join('\n'),
      );
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should drop relative dates with warnings', () => {
    const tmpDir = createTempDir({
      'tasks.md': '- [ ] Relative task [due: tomorrow]\n',
    });

    try {
      const output = execSync(`node ${cliPath} migrate --path ${tmpDir} 2>&1`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe('- [ ] Relative task\n');
      expect(output).toContain('Relative date dropped');
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should drop time components with warnings', () => {
    const tmpDir = createTempDir({
      'tasks.md': '- [ ] Timed task [due: 2026-05-15 17:00]\n',
    });

    try {
      const output = execSync(`node ${cliPath} migrate --path ${tmpDir} 2>&1`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe('- [ ] Timed task #due:2026-05-15\n');
      expect(output).toContain('Time component dropped');
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should not modify files with no legacy syntax', () => {
    const original = [
      '# Tasks',
      '- [ ] Already new #due:2026-05-15 {todoist:123}',
      '- [x] Done {completed:2026-05-10}',
      '- [ ] Plain task #backend',
    ].join('\n');

    const tmpDir = createTempDir({ 'tasks.md': original });

    try {
      execSync(`node ${cliPath} migrate --path ${tmpDir}`, {
        encoding: 'utf-8',
      });

      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe(original);
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('--dry-run should not modify files', () => {
    const original = '- [ ] Task [due: 2026-05-15]\n';
    const tmpDir = createTempDir({ 'tasks.md': original });

    try {
      const output = execSync(
        `node ${cliPath} migrate --dry-run --path ${tmpDir} 2>&1`,
        { encoding: 'utf-8' },
      );

      // File unchanged
      const result = readFileSync(join(tmpDir, 'tasks.md'), 'utf-8');
      expect(result).toBe(original);

      // Output shows diff
      expect(output).toContain('#due:2026-05-15');
      expect(output).toContain('[DRY RUN]');
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('migrated files should parse correctly with new syntax', () => {
    const tmpDir = createTempDir({
      'tasks.md': [
        '- [ ] @alice Fix bug !! #backend [due: 2026-05-15] [todoist:123]',
        '- [x] Done task [completed: 2026-05-10]',
      ].join('\n'),
    });

    try {
      // Migrate
      execSync(`node ${cliPath} migrate --path ${tmpDir}`, {
        encoding: 'utf-8',
      });

      // Parse with md2do list (verifies the parser reads new syntax correctly)
      const output = execSync(
        `node ${cliPath} list --path ${tmpDir} --format json --no-warnings 2>&1`,
        { encoding: 'utf-8' },
      );

      const parsed = JSON.parse(output) as {
        tasks?: Array<{
          text: string;
          assignee?: string;
          priority?: string;
          tags: string[];
          todoistId?: string;
          dueDate?: string;
          completed: boolean;
          completedDate?: string;
        }>;
      };

      // JSON output may be { tasks: [...] } or a flat array
      const tasks = Array.isArray(parsed) ? parsed : (parsed.tasks ?? []);

      expect(tasks).toHaveLength(2);

      // First task: all metadata preserved
      expect(tasks[0]?.text).toBe('Fix bug');
      expect(tasks[0]?.assignee).toBe('alice');
      expect(tasks[0]?.priority).toBe('high');
      expect(tasks[0]?.tags).toEqual(['backend']);
      expect(tasks[0]?.todoistId).toBe('123');
      expect(tasks[0]?.dueDate).toBeDefined();

      // Second task: completion preserved
      expect(tasks[1]?.completed).toBe(true);
      expect(tasks[1]?.completedDate).toBeDefined();
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });
});
