/**
 * E2E Tests: md2do add command
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
} from 'fs';
import { tmpdir } from 'os';
import { format, addDays, nextMonday, nextFriday } from 'date-fns';

const cliPath = join(__dirname, '../../dist/cli.js');

function run(args: string): string {
  return execSync(`node ${cliPath} ${args}`, { encoding: 'utf-8' }).trim();
}

function createTempDir(files?: Record<string, string>): string {
  const tmpDir = mkdtempSync(join(tmpdir(), 'md2do-add-'));
  if (files) {
    for (const [filename, content] of Object.entries(files)) {
      writeFileSync(join(tmpDir, filename), content);
    }
  }
  return tmpDir;
}

describe('E2E: md2do add', () => {
  const tempDirs: string[] = [];

  function makeTempDir(files?: Record<string, string>): string {
    const dir = createTempDir(files);
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('should add a basic task', () => {
    const tmpDir = makeTempDir({ 'tasks.md': '# Tasks\n' });
    const file = join(tmpDir, 'tasks.md');

    const output = run(`add "Buy milk" --file "${file}"`);
    expect(output).toBe('- [ ] Buy milk');

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('- [ ] Buy milk');
  });

  it('should add a task with all metadata', () => {
    const tmpDir = makeTempDir({ 'tasks.md': '# Tasks\n' });
    const file = join(tmpDir, 'tasks.md');

    const output = run(
      `add "Fix login bug" --file "${file}" --assignee ben --priority high --due 2026-06-01 --tag grocery --tag errand`,
    );
    expect(output).toBe(
      '- [ ] Fix login bug @ben !! #grocery #errand #due/2026-06-01',
    );

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain(
      '- [ ] Fix login bug @ben !! #grocery #errand #due/2026-06-01',
    );
  });

  it('should resolve --due tomorrow', () => {
    const tmpDir = makeTempDir({ 'tasks.md': '' });
    const file = join(tmpDir, 'tasks.md');
    const expected = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const output = run(`add "Task" --file "${file}" --due tomorrow`);
    expect(output).toContain(`#due/${expected}`);
  });

  it('should resolve --due today', () => {
    const tmpDir = makeTempDir({ 'tasks.md': '' });
    const file = join(tmpDir, 'tasks.md');
    const expected = format(new Date(), 'yyyy-MM-dd');

    const output = run(`add "Task" --file "${file}" --due today`);
    expect(output).toContain(`#due/${expected}`);
  });

  it('should resolve --due with day names', () => {
    const tmpDir = makeTempDir({ 'tasks.md': '' });
    const file = join(tmpDir, 'tasks.md');
    const now = new Date();
    const expected = format(nextFriday(now), 'yyyy-MM-dd');

    const output = run(`add "Task" --file "${file}" --due friday`);
    expect(output).toContain(`#due/${expected}`);
  });

  it('should resolve --due "next week" to next monday', () => {
    const tmpDir = makeTempDir({ 'tasks.md': '' });
    const file = join(tmpDir, 'tasks.md');
    const expected = format(nextMonday(new Date()), 'yyyy-MM-dd');

    const output = run(`add "Task" --file "${file}" --due "next week"`);
    expect(output).toContain(`#due/${expected}`);
  });

  it('should create a completed task with --completed', () => {
    const tmpDir = makeTempDir({ 'tasks.md': '' });
    const file = join(tmpDir, 'tasks.md');

    const output = run(`add "Done task" --file "${file}" --completed`);
    expect(output).toBe('- [x] Done task');

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('- [x] Done task');
  });

  it('should insert at a specific line with --line', () => {
    const tmpDir = makeTempDir({
      'tasks.md': '# Tasks\n- [ ] First task\n- [ ] Third task\n',
    });
    const file = join(tmpDir, 'tasks.md');

    run(`add "Second task" --file "${file}" --line 3`);

    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    expect(lines[2]).toBe('- [ ] Second task');
    expect(lines[3]).toBe('- [ ] Third task');
  });

  it('should print to stdout when --file is omitted', () => {
    const output = run('add "Stdout task"');
    expect(output).toBe('- [ ] Stdout task');
  });

  it('should print to stdout with metadata when --file is omitted', () => {
    const output = run('add "Task" --assignee nick --priority high');
    expect(output).toBe('- [ ] Task @nick !!');
  });

  it('should print to stdout with --due when --file is omitted', () => {
    const expected = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const output = run('add "Task" --due tomorrow');
    expect(output).toBe(`- [ ] Task #due/${expected}`);
  });

  it('should error when --line is used without --file', () => {
    try {
      execSync(`node ${cliPath} add "Task" --line 3`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      const err = error as { stderr: string };
      expect(err.stderr).toContain('--line requires --file');
    }
  });

  it('should create the file if it does not exist', () => {
    const tmpDir = makeTempDir();
    const file = join(tmpDir, 'new-file.md');
    expect(existsSync(file)).toBe(false);

    const output = run(`add "Fresh task" --file "${file}"`);
    expect(output).toBe('- [ ] Fresh task');
    expect(existsSync(file)).toBe(true);

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('- [ ] Fresh task');
  });

  it('should map priority levels correctly', () => {
    const tmpDir = makeTempDir();

    // urgent → !!!
    let file = join(tmpDir, 'urgent.md');
    run(`add "Task" --file "${file}" --priority urgent`);
    expect(readFileSync(file, 'utf-8')).toContain('!!!');

    // high → !!
    file = join(tmpDir, 'high.md');
    run(`add "Task" --file "${file}" --priority high`);
    let content = readFileSync(file, 'utf-8');
    expect(content).toContain('!!');
    expect(content).not.toContain('!!!');

    // normal → no priority marker
    file = join(tmpDir, 'normal.md');
    run(`add "Task" --file "${file}" --priority normal`);
    content = readFileSync(file, 'utf-8');
    expect(content).toContain('- [ ] Task');
    expect(content).not.toContain('!');

    // low → !
    file = join(tmpDir, 'low.md');
    run(`add "Task" --file "${file}" --priority low`);
    content = readFileSync(file, 'utf-8');
    expect(content).toContain('!');
    expect(content).not.toContain('!!');
  });

  it('should resolve --due today correctly regardless of timezone', () => {
    const tz = 'America/Los_Angeles';
    const output = execSync(`node ${cliPath} add "TZ task" --due today`, {
      encoding: 'utf-8',
      env: { ...process.env, TZ: tz },
    }).trim();
    // Compute expected date in the same timezone
    const expected = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    expect(output).toBe(`- [ ] TZ task #due/${expected}`);
  });

  it('should error on invalid date', () => {
    const tmpDir = makeTempDir();
    const file = join(tmpDir, 'tasks.md');

    try {
      execSync(
        `node ${cliPath} add "Task" --file "${file}" --due "not-a-date"`,
        {
          encoding: 'utf-8',
          stdio: 'pipe',
        },
      );
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      const err = error as { stderr: string };
      expect(err.stderr).toContain('Invalid date');
    }
  });
});
