/**
 * E2E Tests: dates the CLI derives from "now", across timezones
 *
 * Each case spawns the CLI with an explicit TZ and a frozen clock, so the
 * result does not depend on when or where the tests run.
 */

import { describe, it, expect } from 'vitest';
import { runCli } from '../helpers/run-cli.js';
import {
  TEST_ZONES,
  LOCAL_TIME_CASES,
  UTC_TIME_CASES,
  addCalendarDays,
  calendarDateIn,
  wallDate,
} from '../../../core/tests/helpers/time-cases.js';

// Spawning is slow, so e2e uses the cases most likely to differ by timezone.
// The full table runs against the date helpers in core's unit tests.
const E2E_CASES = LOCAL_TIME_CASES.filter(({ name }) =>
  /^(ordinary day, just|last day of year|leap day|US DST start)/.test(name),
);
const E2E_TIMEOUT = 30_000;

function addWithDue(due: string, tz: string, now: string): string {
  return runCli(['add', 'Task', '--due', due], { tz, now }).trim();
}

describe.each(TEST_ZONES)('E2E: add --due in %s', (tz) => {
  it(
    'should resolve "today" to the local date around midnight',
    () => {
      for (const { name, wall } of E2E_CASES) {
        expect(addWithDue('today', tz, wall), name).toBe(
          `- [ ] Task #due/${wallDate(wall)}`,
        );
      }
    },
    E2E_TIMEOUT,
  );

  it(
    'should resolve "tomorrow" to the next local date just before midnight',
    () => {
      const beforeMidnight = E2E_CASES.filter(({ wall }) =>
        wall.endsWith('T23:59:30'),
      );

      for (const { name, wall } of beforeMidnight) {
        expect(addWithDue('tomorrow', tz, wall), name).toBe(
          `- [ ] Task #due/${addCalendarDays(wallDate(wall), 1)}`,
        );
      }
    },
    E2E_TIMEOUT,
  );

  it(
    'should resolve "today" to the local date either side of UTC midnight',
    () => {
      for (const { name, instant } of UTC_TIME_CASES) {
        const expected = calendarDateIn(new Date(instant), tz);

        expect(addWithDue('today', tz, instant), name).toBe(
          `- [ ] Task #due/${expected}`,
        );
      }
    },
    E2E_TIMEOUT,
  );
});

describe('E2E: frozen clock helper', () => {
  it('should give different local dates for the same instant', () => {
    const instant = '2026-10-09T00:00:30Z';

    expect(addWithDue('today', 'Pacific/Kiritimati', instant)).toContain(
      '#due/2026-10-09',
    );
    expect(addWithDue('today', 'Pacific/Pago_Pago', instant)).toContain(
      '#due/2026-10-08',
    );
  });
});
