/**
 * Helpers for end-to-end tests that spawn the built CLI.
 */

import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

export const cliPath = join(__dirname, '../../dist/cli.js');
const fakeClockPath = join(__dirname, 'fake-clock.cjs');

export interface RunCliOptions {
  /** Working directory for the CLI process */
  cwd?: string;
  /** Home directory; point at an empty dir so ~/.md2do.json can't leak in */
  home?: string;
  /** Timezone for the CLI process (IANA name, e.g. `Europe/Berlin`) */
  tz?: string;
  /**
   * Freeze the CLI's clock. A string without an offset
   * (`2026-10-09T00:00:30`) is wall-clock time in `tz`.
   */
  now?: string;
}

/**
 * Run the built CLI and return its stdout. Throws if it exits non-zero.
 */
export function runCli(args: string[], options: RunCliOptions = {}): string {
  const { cwd, home, tz, now } = options;

  return execFileSync(
    process.execPath,
    [
      ...(now !== undefined ? ['--require', fakeClockPath] : []),
      cliPath,
      ...args,
    ],
    {
      encoding: 'utf-8',
      ...(cwd !== undefined && { cwd }),
      env: {
        ...process.env,
        ...(home !== undefined && { HOME: home, USERPROFILE: home }),
        ...(tz !== undefined && { TZ: tz }),
        ...(now !== undefined && { MD2DO_TEST_NOW: now }),
      },
    },
  );
}

/**
 * Track temp directories for a test file. Call `cleanup()` in `afterEach`.
 */
export function createTempDirs(): {
  make: (prefix: string, files?: Record<string, string>) => string;
  cleanup: () => void;
} {
  const dirs: string[] = [];

  return {
    make(prefix, files = {}) {
      const dir = mkdtempSync(join(tmpdir(), prefix));
      dirs.push(dir);
      for (const [relativePath, content] of Object.entries(files)) {
        const fullPath = join(dir, relativePath);
        mkdirSync(dirname(fullPath), { recursive: true });
        writeFileSync(fullPath, content);
      }
      return dir;
    },
    cleanup() {
      for (const dir of dirs) {
        rmSync(dir, { recursive: true, force: true });
      }
      dirs.length = 0;
    },
  };
}
