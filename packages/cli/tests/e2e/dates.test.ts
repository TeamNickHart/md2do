/**
 * E2E Tests: date filters and date display, across timezones
 *
 * Due dates are calendar dates in the user's timezone. A task due today is
 * due today from just after local midnight until just before the next one,
 * wherever the user is.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { runCli, createTempDirs } from '../helpers/run-cli.js';
import { TEST_ZONES } from '../../../core/tests/helpers/time-cases.js';

const TODAY = '2026-10-09';
const NOWS = [`${TODAY}T00:00:30`, `${TODAY}T12:00:00`, `${TODAY}T23:59:30`];
const E2E_TIMEOUT = 30_000;

describe.each(TEST_ZONES)('E2E: due dates in %s', (tz) => {
  const tempDirs = createTempDirs();
  let home: string;
  let cwd: string;

  function makeProject(): void {
    home = tempDirs.make('md2do-home-');
    cwd = tempDirs.make('md2do-dates-', {
      'tasks.md': [
        '- [ ] Yesterday task @alice #due/2026-10-08',
        '- [ ] Today task @alice #due/2026-10-09',
        '- [ ] Tomorrow task @alice #due/2026-10-10',
        '- [ ] Undated task @alice',
        '',
      ].join('\n'),
    });
  }

  function listTexts(args: string[], now: string): string[] {
    const output = JSON.parse(
      runCli(['list', '--format', 'json', ...args], { cwd, home, tz, now }),
    ) as { tasks: { text: string }[] };
    return output.tasks.map((task) => task.text).sort();
  }

  afterEach(() => {
    tempDirs.cleanup();
  });

  it(
    'list date filters should follow the local calendar day',
    () => {
      makeProject();

      for (const now of NOWS) {
        expect(listTexts(['--overdue'], now), now).toEqual(['Yesterday task']);
        expect(listTexts(['--due-today'], now), now).toEqual(['Today task']);
        expect(listTexts(['--due-within', '1'], now), now).toEqual([
          'Today task',
          'Tomorrow task',
        ]);
      }
    },
    E2E_TIMEOUT,
  );

  it(
    'stats should count overdue and due today like list does',
    () => {
      makeProject();

      for (const now of NOWS) {
        const output = runCli(['stats', '--no-colors'], { cwd, home, tz, now });

        expect(output, now).toContain('Overdue: 1');
        expect(output, now).toContain('Due today: 1');
      }
    },
    E2E_TIMEOUT,
  );

  it(
    'stats --by should count overdue like list does',
    () => {
      makeProject();

      for (const now of NOWS) {
        const output = runCli(['stats', '--by', 'assignee', '--no-colors'], {
          cwd,
          home,
          tz,
          now,
        });
        // Table row: name | total | completed | incomplete | overdue
        const row = output.split('\n').find((line) => line.includes('alice'));
        const counts = (row ?? '').match(/\d+/g)?.map(Number);

        expect(counts, now).toEqual([4, 0, 4, 1]);
      }
    },
    E2E_TIMEOUT,
  );

  it(
    'pretty output should describe due dates by calendar day',
    () => {
      makeProject();

      for (const now of NOWS) {
        const lines = runCli(['list', '--no-colors'], { cwd, home, tz, now })
          .split('\n')
          .filter((line) => line.includes('task'));
        const lineFor = (text: string): string =>
          lines.find((line) => line.includes(text)) ?? '';

        expect(lineFor('Yesterday task'), now).toContain(
          'due yesterday (overdue)',
        );
        expect(lineFor('Today task'), now).toContain('due today');
        expect(lineFor('Today task'), now).not.toContain('overdue');
        expect(lineFor('Tomorrow task'), now).toContain('due tomorrow');
        expect(lineFor('Tomorrow task'), now).not.toContain('overdue');
      }
    },
    E2E_TIMEOUT,
  );
});
