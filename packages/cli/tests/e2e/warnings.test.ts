/**
 * E2E Tests: Warning Configuration Profiles
 *
 * Tests warning filtering with different configuration profiles using snapshots.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

function runCLIWithConfig(
  config: object,
  testFiles: Record<string, string>,
): string {
  const tmpDir = mkdtempSync(join(tmpdir(), 'md2do-test-'));

  try {
    // Write config
    writeFileSync(join(tmpDir, '.md2do.json'), JSON.stringify(config, null, 2));

    // Write test files
    for (const [filename, content] of Object.entries(testFiles)) {
      writeFileSync(join(tmpDir, filename), content);
    }

    // Run CLI - need to capture both stdout and stderr since warnings go to stderr
    const cliPath = join(__dirname, '../../dist/cli.js');
    const output = execSync(
      `node ${cliPath} list --path ${tmpDir} --no-colors 2>&1`,
      {
        encoding: 'utf-8',
      },
    );

    // Normalize file paths for consistent snapshots across environments
    // Replace absolute paths with relative paths
    return output.replace(new RegExp('file://[^\\s]+/packages/cli/', 'g'), '');
  } finally {
    rmSync(tmpDir, { recursive: true });
  }
}

describe('E2E: Warning Configuration Profiles', () => {
  const testFiles = {
    'tasks.md': `
# Tasks

* [x] Wrong bullet type task
- [ ]Missing space after checkbox task
-[x] Missing space before checkbox task
- [ ] Valid task @alice !! #bug (2026-02-01)
- [x] Completed task without completion date
- [ ] Task without a due date
    `.trim(),
  };

  it('recommended profile (default)', () => {
    const output = runCLIWithConfig({}, testFiles);

    // Format warnings shown
    expect(output).toContain('⚠️');
    expect(output).toContain('Unsupported bullet');
    expect(output).toContain('Missing space');

    // Metadata warnings NOT shown (stylistic choice)
    expect(output).not.toContain('No due date');
    expect(output).not.toContain('Completed without date');

    expect(output).toMatchSnapshot('recommended-default');
  });

  it('strict profile', () => {
    const output = runCLIWithConfig(
      {
        warnings: {
          enabled: true,
          rules: {
            'unsupported-bullet': 'error',
            'malformed-checkbox': 'error',
            'missing-space-after': 'error',
            'missing-space-before': 'error',
            'relative-date-no-context': 'error',
            'missing-due-date': 'warn',
            'missing-completed-date': 'warn',
            'duplicate-todoist-id': 'error',
            'file-read-error': 'error',
          },
        },
      },
      testFiles,
    );

    // ALL warnings shown
    expect(output).toContain('⚠️');
    expect(output).toContain('Unsupported bullet');
    expect(output).toContain('Missing space');
    expect(output).toContain('Task has no due date');
    expect(output).toContain('Completed task missing completion date');

    expect(output).toMatchSnapshot('strict-all-warnings');
  });

  it('custom: all disabled', () => {
    const output = runCLIWithConfig(
      {
        warnings: { enabled: false },
      },
      testFiles,
    );

    expect(output).not.toContain('⚠️');
    expect(output).toMatchSnapshot('all-disabled');
  });

  it('custom: only spacing errors', () => {
    const output = runCLIWithConfig(
      {
        warnings: {
          enabled: true,
          rules: {
            'unsupported-bullet': 'off',
            'malformed-checkbox': 'off',
            'missing-space-after': 'error',
            'missing-space-before': 'error',
            'relative-date-no-context': 'off',
            'missing-due-date': 'off',
            'missing-completed-date': 'off',
            'duplicate-todoist-id': 'error',
            'file-read-error': 'error',
          },
        },
      },
      testFiles,
    );

    // Only space warnings
    expect(output).toContain('Missing space');
    expect(output).not.toContain('Unsupported bullet');
    expect(output).not.toContain('Task has no due date');

    expect(output).toMatchSnapshot('custom-space-only');
  });
});

describe('E2E: Warning Filtering Edge Cases', () => {
  it('shows warnings correctly with truncation', () => {
    // Create many warnings to test truncation
    const testFiles = {
      'many-warnings.md': Array.from(
        { length: 20 },
        (_, i) => `* [ ] Task ${i}`,
      ).join('\n'),
    };

    const output = runCLIWithConfig({}, testFiles);

    // Should show first 5, then "... and N more"
    expect(output).toMatch(/and \d+ more warning/);
    expect(output).toMatchSnapshot('truncated-warnings');
  });

  it('respects CLI --no-warnings override', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'md2do-test-'));

    try {
      const testFile = '* [x] Wrong bullet';
      writeFileSync(join(tmpDir, 'tasks.md'), testFile);

      const cliPath = join(__dirname, '../../dist/cli.js');
      const output = execSync(
        `node ${cliPath} list --path ${tmpDir} --no-warnings --no-colors`,
        {
          encoding: 'utf-8',
        },
      );

      // Should not show warnings even though config has them enabled
      expect(output).not.toContain('⚠️');
      expect(output).toMatchSnapshot('cli-no-warnings-override');
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });
});
