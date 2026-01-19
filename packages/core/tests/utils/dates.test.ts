import { describe, it, expect } from 'vitest';
import {
  parseAbsoluteDate,
  resolveRelativeDate,
  extractDateFromHeading,
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

describe('extractDateFromHeading', () => {
  describe('Slash format', () => {
    it('should extract date from heading with M/D/YY format', () => {
      const heading = '## Meeting 1/13/26';
      const date = extractDateFromHeading(heading);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });

    it('should extract date from heading with M/D/YYYY format', () => {
      const heading = '### Sprint Planning 1/13/2026';
      const date = extractDateFromHeading(heading);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });

    it('should extract date at start of heading', () => {
      const heading = '## 1/13/26 - Weekly Sync';
      const date = extractDateFromHeading(heading);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });

    it('should work with different heading levels', () => {
      const headings = [
        '# 1/13/26 Top Level',
        '## 1/13/26 Second Level',
        '### 1/13/26 Third Level',
        '#### 1/13/26 Fourth Level',
      ];

      for (const heading of headings) {
        const date = extractDateFromHeading(heading);
        expect(date).toBeInstanceOf(Date);
        expect(date?.getDate()).toBe(13);
      }
    });
  });

  describe('ISO format', () => {
    it('should extract ISO date from heading', () => {
      const heading = '## 2026-01-13 Sprint Planning';
      const date = extractDateFromHeading(heading);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });

    it('should extract date from middle of heading', () => {
      const heading = '### Meeting on 2026-01-13';
      const date = extractDateFromHeading(heading);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });

    it('should work with complex heading text', () => {
      const heading = '## Q1 Planning Session - 2026-01-13 - Building roadmap';
      const date = extractDateFromHeading(heading);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });
  });

  describe('Natural format', () => {
    it('should extract date with full month name', () => {
      const heading = '## January 13, 2026';
      const date = extractDateFromHeading(heading);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });

    it('should extract date with abbreviated month', () => {
      const heading = '### Jan 13, 2026 - Planning';
      const date = extractDateFromHeading(heading);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(13);
    });

    it('should handle all months', () => {
      const tests = [
        { month: 'January', index: 0 },
        { month: 'February', index: 1 },
        { month: 'March', index: 2 },
        { month: 'April', index: 3 },
        { month: 'May', index: 4 },
        { month: 'June', index: 5 },
        { month: 'July', index: 6 },
        { month: 'August', index: 7 },
        { month: 'September', index: 8 },
        { month: 'October', index: 9 },
        { month: 'November', index: 10 },
        { month: 'December', index: 11 },
      ];

      for (const { month, index } of tests) {
        const heading = `## ${month} 15, 2026`;
        const date = extractDateFromHeading(heading);
        expect(date?.getMonth()).toBe(index);
        expect(date?.getDate()).toBe(15);
      }
    });

    it('should handle abbreviated months', () => {
      const tests = [
        { abbr: 'Jan', index: 0 },
        { abbr: 'Feb', index: 1 },
        { abbr: 'Mar', index: 2 },
        { abbr: 'Apr', index: 3 },
        { abbr: 'May', index: 4 },
        { abbr: 'Jun', index: 5 },
        { abbr: 'Jul', index: 6 },
        { abbr: 'Aug', index: 7 },
        { abbr: 'Sep', index: 8 },
        { abbr: 'Oct', index: 9 },
        { abbr: 'Nov', index: 10 },
        { abbr: 'Dec', index: 11 },
      ];

      for (const { abbr, index } of tests) {
        const heading = `## ${abbr} 20, 2026`;
        const date = extractDateFromHeading(heading);
        expect(date?.getMonth()).toBe(index);
        expect(date?.getDate()).toBe(20);
      }
    });
  });

  describe('Format precedence', () => {
    it('should prefer slash format when multiple formats present', () => {
      const heading = '## 1/15/26 January 13, 2026';
      const date = extractDateFromHeading(heading);
      // Should match 1/15/26, not January 13
      expect(date?.getDate()).toBe(15);
    });

    it('should try ISO if slash fails', () => {
      const heading = '## Meeting 2026-01-13';
      const date = extractDateFromHeading(heading);
      expect(date?.getDate()).toBe(13);
    });

    it('should try natural if slash and ISO fail', () => {
      const heading = '## Meeting January 13, 2026';
      const date = extractDateFromHeading(heading);
      expect(date?.getDate()).toBe(13);
    });
  });

  describe('No date in heading', () => {
    it('should return null for heading without date', () => {
      const heading = '## Sprint Planning';
      const date = extractDateFromHeading(heading);
      expect(date).toBeNull();
    });

    it('should return null for plain text', () => {
      const heading = 'Not a heading at all';
      const date = extractDateFromHeading(heading);
      expect(date).toBeNull();
    });

    it('should return null for invalid date format', () => {
      const heading = '## Meeting on the 13th';
      const date = extractDateFromHeading(heading);
      expect(date).toBeNull();
    });
  });
});
