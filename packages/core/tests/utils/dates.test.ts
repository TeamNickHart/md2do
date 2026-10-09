import { describe, it, expect, vi } from 'vitest';
import {
  formatLocalDate,
  parseAbsoluteDate,
  resolveRelativeDate,
} from '../../src/utils/dates.js';

describe('parseAbsoluteDate', () => {
  describe('ISO format (YYYY-MM-DD)', () => {
    it('should parse valid ISO date', () => {
      const date = parseAbsoluteDate('2026-01-25');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0); // January is 0
      expect(date?.getDate()).toBe(25);
    });

    it('should parse dates in different months', () => {
      const date = parseAbsoluteDate('2026-12-31');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMonth()).toBe(11); // December is 11
      expect(date?.getDate()).toBe(31);
    });

    it('should parse leap year date', () => {
      const date = parseAbsoluteDate('2024-02-29');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMonth()).toBe(1); // February
      expect(date?.getDate()).toBe(29);
    });
  });

  describe('US short format (M/D/YY)', () => {
    it('should parse 2-digit year format', () => {
      const date = parseAbsoluteDate('1/25/26');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(25);
    });

    it('should parse single-digit month and day', () => {
      const date = parseAbsoluteDate('3/5/26');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMonth()).toBe(2); // March
      expect(date?.getDate()).toBe(5);
    });

    it('should parse double-digit month and day', () => {
      const date = parseAbsoluteDate('12/31/26');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMonth()).toBe(11); // December
      expect(date?.getDate()).toBe(31);
    });
  });

  describe('US full format (M/D/YYYY)', () => {
    it('should parse 4-digit year format', () => {
      const date = parseAbsoluteDate('1/25/2026');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(25);
    });

    it('should parse dates in past years', () => {
      const date = parseAbsoluteDate('6/15/2023');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2023);
      expect(date?.getMonth()).toBe(5); // June
      expect(date?.getDate()).toBe(15);
    });
  });

  describe('Invalid dates', () => {
    it('should return null for invalid format', () => {
      const date = parseAbsoluteDate('not-a-date');
      expect(date).toBeNull();
    });

    it('should return null for empty string', () => {
      const date = parseAbsoluteDate('');
      expect(date).toBeNull();
    });

    it('should return null for invalid date values', () => {
      const date = parseAbsoluteDate('2026-13-45'); // Invalid month and day
      expect(date).toBeNull();
    });

    it('should return null for non-leap year Feb 29', () => {
      const date = parseAbsoluteDate('2023-02-29');
      expect(date).toBeNull();
    });
  });
});

describe('resolveRelativeDate', () => {
  const baseDate = new Date('2026-01-18T12:00:00Z');

  describe('Today', () => {
    it('should return the same date for "today"', () => {
      const result = resolveRelativeDate('today', baseDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(baseDate.getTime());
    });

    it('should be case-insensitive', () => {
      const result = resolveRelativeDate('TODAY', baseDate);
      expect(result?.getTime()).toBe(baseDate.getTime());
    });

    it('should handle extra whitespace', () => {
      const result = resolveRelativeDate('  today  ', baseDate);
      expect(result?.getTime()).toBe(baseDate.getTime());
    });
  });

  describe('Tomorrow', () => {
    it('should return next day for "tomorrow"', () => {
      const result = resolveRelativeDate('tomorrow', baseDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDate()).toBe(19);
      expect(result?.getMonth()).toBe(0); // Still January
    });

    it('should handle month boundary', () => {
      const endOfMonth = new Date('2026-01-31T12:00:00Z');
      const result = resolveRelativeDate('tomorrow', endOfMonth);
      expect(result?.getDate()).toBe(1);
      expect(result?.getMonth()).toBe(1); // February
    });

    it('should be case-insensitive', () => {
      const result = resolveRelativeDate('TOMORROW', baseDate);
      expect(result?.getDate()).toBe(19);
    });
  });

  describe('Next week', () => {
    it('should return next Monday', () => {
      // 2026-01-18 is a Sunday
      const result = resolveRelativeDate('next week', baseDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDate()).toBe(19); // Next Monday
      expect(result?.getMonth()).toBe(0);
    });

    it('should return next Monday when base is Monday', () => {
      const monday = new Date('2026-01-19T12:00:00Z');
      const result = resolveRelativeDate('next week', monday);
      expect(result?.getDate()).toBe(26); // Next Monday
    });

    it('should return next Monday when base is Friday', () => {
      const friday = new Date('2026-01-23T12:00:00Z');
      const result = resolveRelativeDate('next week', friday);
      expect(result?.getDate()).toBe(26); // Next Monday
    });

    it('should be case-insensitive', () => {
      const result = resolveRelativeDate('NEXT WEEK', baseDate);
      expect(result?.getDate()).toBe(19);
    });
  });

  describe('Next month', () => {
    it('should return same day next month', () => {
      const result = resolveRelativeDate('next month', baseDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDate()).toBe(18);
      expect(result?.getMonth()).toBe(1); // February
    });

    it('should handle year boundary', () => {
      const december = new Date('2025-12-15T12:00:00Z');
      const result = resolveRelativeDate('next month', december);
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getFullYear()).toBe(2026);
    });

    it('should be case-insensitive', () => {
      const result = resolveRelativeDate('NEXT MONTH', baseDate);
      expect(result?.getMonth()).toBe(1);
    });
  });

  describe('Invalid keywords', () => {
    it('should return null for unknown keyword', () => {
      const result = resolveRelativeDate('next year', baseDate);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = resolveRelativeDate('', baseDate);
      expect(result).toBeNull();
    });

    it('should return null for partial match', () => {
      const result = resolveRelativeDate('next', baseDate);
      expect(result).toBeNull();
    });
  });
});

describe('formatLocalDate', () => {
  it('should run in a timezone other than UTC (see vitest.config.ts)', () => {
    // Without this, the midnight tests below also pass with a UTC date
    expect(new Date(2026, 9, 9).getTimezoneOffset()).not.toBe(0);
  });

  it('should format a date as YYYY-MM-DD', () => {
    expect(formatLocalDate(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05');
  });

  it('should use the local date just after local midnight', () => {
    // In timezones east of UTC this instant is still the previous day in UTC
    expect(formatLocalDate(new Date(2026, 9, 9, 0, 30))).toBe('2026-10-09');
  });

  it('should use the local date just before local midnight', () => {
    // In timezones west of UTC this instant is already the next day in UTC
    expect(formatLocalDate(new Date(2026, 9, 8, 23, 59))).toBe('2026-10-08');
  });

  it('should default to now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 9, 0, 30));
    try {
      expect(formatLocalDate()).toBe('2026-10-09');
    } finally {
      vi.useRealTimers();
    }
  });
});
