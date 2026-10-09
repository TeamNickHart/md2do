import { describe, it, expect } from 'vitest';
import {
  isOverdue,
  isDueToday,
  isDueThisWeek,
  isDueWithinDays,
} from '../../src/filters/index.js';
import { parseTask } from '../../src/parser/index.js';
import type { Task } from '../../src/types/index.js';
import {
  LOCAL_TIME_CASES,
  UTC_TIME_CASES,
  addCalendarDays,
  calendarDateIn,
  wallDate,
} from '../helpers/time-cases.js';

/** A task due on a calendar date, built the way real tasks are: by the parser */
function taskDue(date: string): Task {
  const { task } = parseTask(
    `- [ ] Due ${date} #due/${date}`,
    1,
    'tasks.md',
    {},
  );
  if (!task) {
    throw new Error(`parseTask returned no task for ${date}`);
  }
  return task;
}

/** Due dates of the tasks a filter keeps, relative to `today` */
function kept(
  filter: (task: Task) => boolean,
  today: string,
  offsets: number[],
): number[] {
  return offsets.filter((offset) =>
    filter(taskDue(addCalendarDays(today, offset))),
  );
}

const AROUND_TODAY = [-2, -1, 0, 1, 2];

// These run in the process timezone. `pnpm test:tz` repeats them per zone.
describe(`due date filters at edge cases (TZ=${process.env.TZ ?? 'system'})`, () => {
  const cases = [
    ...LOCAL_TIME_CASES.map(({ name, wall }) => ({
      name: `${name} (${wall})`,
      now: new Date(wall),
      today: wallDate(wall),
    })),
    ...UTC_TIME_CASES.map(({ name, instant }) => ({
      name: `${name} (${instant})`,
      now: new Date(instant),
      today: calendarDateIn(new Date(instant)),
    })),
  ];

  describe.each(cases)('now = $name', ({ now, today }) => {
    it('isOverdue keeps only tasks due before today', () => {
      expect(kept(isOverdue(now), today, AROUND_TODAY)).toEqual([-2, -1]);
    });

    it('isDueToday keeps only tasks due today', () => {
      expect(kept(isDueToday(now), today, AROUND_TODAY)).toEqual([0]);
    });

    it('isDueWithinDays(1) keeps today and tomorrow', () => {
      expect(kept(isDueWithinDays(1, now), today, AROUND_TODAY)).toEqual([
        0, 1,
      ]);
    });

    it('isDueWithinDays(0) keeps only today', () => {
      expect(kept(isDueWithinDays(0, now), today, AROUND_TODAY)).toEqual([0]);
    });
  });

  describe('isDueThisWeek (weeks run Monday to Sunday)', () => {
    // 2026-10-05 is a Monday, 2026-10-11 a Sunday
    const week = [
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ];
    const candidates = ['2026-10-04', ...week, '2026-10-12'];

    it.each([
      ['Monday just after midnight', '2026-10-05T00:00:30'],
      ['midweek', '2026-10-08T12:00:00'],
      ['Sunday just before midnight', '2026-10-11T23:59:30'],
    ])('%s keeps Monday to Sunday of that week', (_name, wall) => {
      const filter = isDueThisWeek(new Date(wall));

      expect(candidates.filter((date) => filter(taskDue(date)))).toEqual(week);
    });

    it('the following Monday just after midnight is a new week', () => {
      const filter = isDueThisWeek(new Date('2026-10-12T00:00:30'));

      expect(candidates.filter((date) => filter(taskDue(date)))).toEqual([
        '2026-10-12',
      ]);
    });
  });

  it('a due time during the day does not make a task due today overdue', () => {
    const { task } = parseTask('- [ ] Report #due/2026-10-09', 1, 'tasks.md', {
      workdayEndTime: '17:00',
      defaultDueTime: 'end',
    });
    const evening = new Date('2026-10-09T23:59:30');

    expect(isOverdue(evening)(task!)).toBe(false);
    expect(isDueToday(evening)(task!)).toBe(true);
  });
});
