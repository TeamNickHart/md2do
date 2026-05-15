import {
  parse,
  isValid,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  setHours,
  setMinutes,
} from 'date-fns';

/**
 * Parse a time string in HH:MM or H:MM format
 *
 * @param timeStr - Time string to parse (e.g., "17:00", "9:00")
 * @returns Object with hours and minutes, or null if invalid
 *
 * @example
 * parseTime("17:00") // => { hours: 17, minutes: 0 }
 * parseTime("9:30") // => { hours: 9, minutes: 30 }
 * parseTime("25:00") // => null (invalid hour)
 */
export function parseTime(
  timeStr: string,
): { hours: number; minutes: number } | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match || !match[1] || !match[2]) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  // Validate ranges
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

/**
 * Parse an absolute date string in various formats, with optional time
 *
 * Supported formats:
 *   - ISO: 2026-01-25
 *   - US short: 1/25/26
 *   - US full: 1/25/2026
 *
 * @param dateStr - Date string to parse
 * @param timeStr - Optional time string in HH:MM or H:MM format
 * @returns Parsed Date object or null if invalid
 *
 * @example
 * parseAbsoluteDate("2026-01-25") // => Date at midnight
 * parseAbsoluteDate("2026-01-25", "17:00") // => Date at 5 PM
 */
export function parseAbsoluteDate(
  dateStr: string,
  timeStr?: string,
): Date | null {
  const referenceDate = new Date();

  // Try ISO format: 2026-01-25
  let date = parse(dateStr, 'yyyy-MM-dd', referenceDate);
  if (!isValid(date)) {
    // Try US short format with 2-digit year: 1/25/26
    date = parse(dateStr, 'M/d/yy', referenceDate);
  }
  if (!isValid(date)) {
    // Try US full format: 1/25/2026
    date = parse(dateStr, 'M/d/yyyy', referenceDate);
  }

  if (!isValid(date)) return null;

  // Apply time if provided
  if (timeStr) {
    const time = parseTime(timeStr);
    if (time) {
      date = setHours(date, time.hours);
      date = setMinutes(date, time.minutes);
    }
  }

  return date;
}

/**
 * Resolve a relative date keyword against a base date
 *
 * Supported keywords:
 *   - today
 *   - tomorrow
 *   - next week (next Monday)
 *   - next month
 *
 * @param relative - Relative date keyword
 * @param baseDate - Reference date to calculate from
 * @returns Resolved Date object or null if keyword unknown
 */
export function resolveRelativeDate(
  relative: string,
  baseDate: Date,
): Date | null {
  const normalized = relative.toLowerCase().trim();

  switch (normalized) {
    case 'today':
      return baseDate;

    case 'tomorrow':
      return addDays(baseDate, 1);

    case 'next week':
      // Next Monday
      return addWeeks(startOfWeek(baseDate, { weekStartsOn: 1 }), 1);

    case 'next month':
      return addMonths(baseDate, 1);

    default:
      return null;
  }
}
