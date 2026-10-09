import { describe, it, expect } from 'vitest';
import { formatLocalDate, parseAbsoluteDate } from '../../src/utils/dates.js';
import {
  LOCAL_TIME_CASES,
  UTC_TIME_CASES,
  calendarDateIn,
  wallDate,
} from '../helpers/time-cases.js';

// These run in the process timezone. `pnpm test:tz` repeats them per zone.
describe(`date helpers at edge cases (TZ=${process.env.TZ ?? 'system'})`, () => {
  describe('formatLocalDate', () => {
    it.each(LOCAL_TIME_CASES)('$name ($wall)', ({ wall }) => {
      const now = new Date(wall);

      expect(formatLocalDate(now)).toBe(wallDate(wall));
      expect(formatLocalDate(now)).toBe(calendarDateIn(now));
    });

    it.each(UTC_TIME_CASES)('$name ($instant)', ({ instant }) => {
      const now = new Date(instant);

      expect(formatLocalDate(now)).toBe(calendarDateIn(now));
    });
  });

  describe('parseAbsoluteDate', () => {
    it.each(LOCAL_TIME_CASES)(
      'round-trips the date of: $name ($wall)',
      ({ wall }) => {
        const date = wallDate(wall);
        const parsed = parseAbsoluteDate(date);

        expect(parsed).not.toBeNull();
        expect(formatLocalDate(parsed!)).toBe(date);
        // A parsed date is local midnight of that calendar day
        expect(parsed!.getHours()).toBe(0);
        expect(parsed!.getMinutes()).toBe(0);
      },
    );
  });
});
