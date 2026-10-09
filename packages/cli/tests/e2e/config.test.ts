/**
 * E2E Tests: markdown.root and markdown.pattern from .md2do.json
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

const cliPath = join(__dirname, '../../dist/cli.js');

function run(args: string, cwd: string): string {
  return execSync(`node ${cliPath} ${args}`, {
    encoding: 'utf-8',
    cwd,
    // Keep a global ~/.md2do.json from leaking into the test
    env: { ...process.env, HOME: cwd, USERPROFILE: cwd },
  });
}

function listTaskTexts(args: string, cwd: string): string[] {
  const output = JSON.parse(run(`list --format json ${args}`, cwd)) as {
    tasks: { text: string }[];
  };
  return output.tasks.map((task) => task.text).sort();
}

function stats(args: string, cwd: string): string {
  return run(`stats --no-colors ${args}`, cwd);
}

describe('E2E: markdown config in list and stats', () => {
  const tempDirs: string[] = [];

  function makeProject(): string {
    const dir = mkdtempSync(join(tmpdir(), 'md2do-config-'));
    tempDirs.push(dir);
    mkdirSync(join(dir, 'notes', 'deep'), { recursive: true });
    mkdirSync(join(dir, 'other'));
    writeFileSync(
      join(dir, '.md2do.json'),
      JSON.stringify({ markdown: { root: './notes', pattern: '*.md' } }),
    );
    writeFileSync(join(dir, 'top.md'), '- [ ] Top task\n');
    writeFileSync(join(dir, 'notes', 'a.md'), '- [ ] Notes task\n');
    writeFileSync(join(dir, 'notes', 'deep', 'b.md'), '- [ ] Deep task\n');
    writeFileSync(join(dir, 'other', 'c.md'), '- [ ] Other task\n');
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

    expect(listTaskTexts('', dir)).toEqual(['Notes task']);
  });

  it('list --pattern should override markdown.pattern', () => {
    const dir = makeProject();

    expect(listTaskTexts('--pattern "**/*.md"', dir)).toEqual([
      'Deep task',
      'Notes task',
    ]);
  });

  it('list --path should override markdown.root', () => {
    const dir = makeProject();

    expect(listTaskTexts(`--path "${join(dir, 'other')}"`, dir)).toEqual([
      'Other task',
    ]);
  });

  it('stats should use markdown.root and markdown.pattern from config', () => {
    const dir = makeProject();

    const output = stats('', dir);
    expect(output).toContain('Total tasks: 1');
    expect(output).toContain('Files scanned: 1');
  });
});
