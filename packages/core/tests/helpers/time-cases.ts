/**
 * Shared timezones and edge-case instants for date tests.
 *
 * Unit tests run in one timezone per process (`pnpm test:tz` runs the suites
 * once per zone in TEST_ZONES), so local cases are wall-clock strings that
 * `new Date()` reads in whatever zone the test runs in. CLI e2e tests pass the
 * same strings to a child process together with an explicit TZ.
 */

/** Keep in sync with scripts/test-tz.mjs */
export const TEST_ZONES = [
  'UTC',
  'America/Los_Angeles', // UTC-8/-7, DST
  'Europe/Berlin', // UTC+1/+2, DST
  'Asia/Kolkata', // UTC+5:30
  'Pacific/Kiritimati', // UTC+14, furthest ahead
  'Pacific/Pago_Pago', // UTC-11, furthest behind
] as const;

export interface LocalTimeCase {
  name: string;
  /** Local wall-clock time, `YYYY-MM-DDTHH:mm:ss` with no offset */
  wall: string;
}

export interface UtcTimeCase {
  name: string;
  /** Absolute instant, ISO 8601 with `Z` */
  instant: string;
}

function aroundMidnight(name: string, date: string): LocalTimeCase[] {
  return [
    { name: `${name}, just after midnight`, wall: `${date}T00:00:30` },
    { name: `${name}, just before midnight`, wall: `${date}T23:59:30` },
  ];
}

/**
 * Wall-clock times that exist in every zone in TEST_ZONES (none of them
 * changes DST at midnight).
 */
export const LOCAL_TIME_CASES: LocalTimeCase[] = [
  { name: 'ordinary day, noon', wall: '2026-10-09T12:00:00' },
  ...aroundMidnight('ordinary day', '2026-10-09'),
  ...aroundMidnight('US DST start', '2026-03-08'),
  ...aroundMidnight('US DST end', '2026-11-01'),
  ...aroundMidnight('EU DST start', '2026-03-29'),
  ...aroundMidnight('EU DST end', '2026-10-25'),
  ...aroundMidnight('last day of year', '2026-12-31'),
  ...aroundMidnight('first day of year', '2027-01-01'),
  ...aroundMidnight('leap day', '2028-02-29'),
  ...aroundMidnight('day after leap day', '2028-03-01'),
  ...aroundMidnight('Sunday', '2026-10-11'),
  ...aroundMidnight('Monday', '2026-10-12'),
];

/** Instants either side of UTC midnight; their local date differs by zone. */
export const UTC_TIME_CASES: UtcTimeCase[] = [
  { name: 'just after UTC midnight', instant: '2026-10-09T00:00:30Z' },
  { name: 'just before UTC midnight', instant: '2026-10-08T23:59:30Z' },
  { name: 'UTC noon', instant: '2026-10-09T12:00:00Z' },
];

/** Calendar date (`YYYY-MM-DD`) of a wall-clock string */
export function wallDate(wall: string): string {
  return wall.slice(0, 10);
}

/** Add whole days to a `YYYY-MM-DD` calendar date, without using local time */
export function addCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

/**
 * Calendar date of an instant in a timezone (default: the process timezone).
 *
 * Uses Intl rather than Date getters or date-fns, so it is an independent
 * check on the code under test.
 */
export function calendarDateIn(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(timeZone !== undefined && { timeZone }),
  }).format(date);
}
