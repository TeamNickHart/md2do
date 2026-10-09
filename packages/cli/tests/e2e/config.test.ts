/**
 * E2E Tests: markdown.root and markdown.pattern from .md2do.json
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

const cliPath = join(__dirname, '../../dist/cli.js');

function run(args: string[], cwd: string, home: string): string {
  return execFileSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf-8',
    cwd,
    // Point HOME at an empty dir so a global ~/.md2do.json can't leak in
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
}

describe('E2E: markdown config in list and stats', () => {
  const tempDirs: string[] = [];
  let home: string;

  function listTaskTexts(args: string[], cwd: string): string[] {
    const output = JSON.parse(
      run(['list', '--format', 'json', ...args], cwd, home),
    ) as { tasks: { text: string }[] };
    return output.tasks.map((task) => task.text).sort();
  }

  function stats(args: string[], cwd: string): string {
    return run(['stats', '--no-colors', ...args], cwd, home);
  }

  function makeTempDir(prefix: string): string {
    const dir = mkdtempSync(join(tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
  }

  function makeProject(): string {
    home = makeTempDir('md2do-home-');
    const dir = makeTempDir('md2do-config-');
    mkdirSync(join(dir, 'notes', 'deep'), { recursive: true });
    mkdirSync(join(dir, 'other', 'nested'), { recursive: true });
    writeFileSync(
      join(dir, '.md2do.json'),
      JSON.stringify({ markdown: { root: './notes', pattern: '*.md' } }),
    );
    writeFileSync(join(dir, 'top.md'), '- [ ] Top task\n');
    writeFileSync(join(dir, 'notes', 'a.md'), '- [ ] Notes task\n');
    writeFileSync(join(dir, 'notes', 'deep', 'b.md'), '- [ ] Deep task\n');
    writeFileSync(join(dir, 'other', 'c.md'), '- [ ] Other task\n');
    writeFileSync(
      join(dir, 'other', 'nested', 'd.md'),
      '- [ ] Nested other task\n',
    );
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('list should use markdown.root and markdown.pattern from config', () => {
    const dir = makeProject();

    expect(listTaskTexts([], dir)).toEqual(['Notes task']);
  });

  it('list --pattern should override markdown.pattern', () => {
    const dir = makeProject();

    expect(listTaskTexts(['--pattern', '**/*.md'], dir)).toEqual([
      'Deep task',
      'Notes task',
    ]);
  });

  it('list --path should override markdown.root and keep markdown.pattern', () => {
    const dir = makeProject();

    expect(listTaskTexts(['--path', join(dir, 'other')], dir)).toEqual([
      'Other task',
    ]);
  });

  it('list --path and --pattern should override both', () => {
    const dir = makeProject();

    expect(
      listTaskTexts(
        ['--path', join(dir, 'other'), '--pattern', '**/*.md'],
        dir,
      ),
    ).toEqual(['Nested other task', 'Other task']);
  });

  it('stats should use markdown.root and markdown.pattern from config', () => {
    const dir = makeProject();

    const output = stats([], dir);
    expect(output).toContain('Total tasks: 1');
    expect(output).toContain('Files scanned: 1');
  });

  it('stats --path should override markdown.root and keep markdown.pattern', () => {
    const dir = makeProject();

    const output = stats(['--path', join(dir, 'other')], dir);
    expect(output).toContain('Total tasks: 1');
    expect(output).toContain('Files scanned: 1');
  });
});
