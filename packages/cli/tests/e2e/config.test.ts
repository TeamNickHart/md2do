/**
 * E2E Tests: markdown.root and markdown.pattern from .md2do.json
 */

import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'path';
import { runCli, createTempDirs } from '../helpers/run-cli.js';

describe('E2E: markdown config in list and stats', () => {
  const tempDirs = createTempDirs();
  let home: string;

  function listTaskTexts(args: string[], cwd: string): string[] {
    const output = JSON.parse(
      runCli(['list', '--format', 'json', ...args], { cwd, home }),
    ) as { tasks: { text: string }[] };
    return output.tasks.map((task) => task.text).sort();
  }

  function stats(args: string[], cwd: string): string {
    return runCli(['stats', '--no-colors', ...args], { cwd, home });
  }

  function makeProject(): string {
    // An empty home dir so a global ~/.md2do.json can't leak in
    home = tempDirs.make('md2do-home-');
    return tempDirs.make('md2do-config-', {
      '.md2do.json': JSON.stringify({
        markdown: { root: './notes', pattern: '*.md' },
      }),
      'top.md': '- [ ] Top task\n',
      'notes/a.md': '- [ ] Notes task\n',
      'notes/deep/b.md': '- [ ] Deep task\n',
      'other/c.md': '- [ ] Other task\n',
      'other/nested/d.md': '- [ ] Nested other task\n',
    });
  }

  afterEach(() => {
    tempDirs.cleanup();
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
