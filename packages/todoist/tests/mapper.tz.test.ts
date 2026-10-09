import { describe, it, expect } from 'vitest';
import { parseTask, formatLocalDate } from '@md2do/core';
import type { Task as TodoistTask } from '@doist/todoist-api-typescript';
import {
  formatTaskContent,
  md2doToTodoist,
  todoistToMd2do,
} from '../src/mapper.js';

// Calendar dates around DST changes, year end and a leap day
const DATES = [
  '2026-10-09',
  '2026-03-08',
  '2026-11-01',
  '2026-03-29',
  '2026-10-25',
  '2026-12-31',
  '2027-01-01',
  '2028-02-29',
];

function todoistTaskDue(date: string): TodoistTask {
  return {
    id: '123',
    content: 'Fix bug',
    priority: 1,
    labels: [],
    isCompleted: false,
    due: { date, isRecurring: false, string: date },
  } as unknown as TodoistTask;
}

// These run in the process timezone. `pnpm test:tz` repeats them per zone.
describe(`Todoist due date mapping (TZ=${process.env.TZ ?? 'system'})`, () => {
  it.each(DATES)('markdown #due/%s is sent to Todoist as that date', (date) => {
    const { task } = parseTask(`- [ ] Fix bug #due/${date}`, 1, 'tasks.md', {});

    expect(md2doToTodoist(task!).due_date).toBe(date);
  });

  it.each(DATES)(
    'Todoist due %s is written to markdown as that date',
    (date) => {
      const update = todoistToMd2do(todoistTaskDue(date));

      expect(update.text).toContain(`#due/${date}`);
      // The Date handed back is the same calendar day in local time, like
      // dates from the parser
      expect(update.due).toBeInstanceOf(Date);
      expect(formatLocalDate(update.due)).toBe(date);
    },
  );

  it.each(DATES)('%s survives a round trip through both mappings', (date) => {
    const update = todoistToMd2do(todoistTaskDue(date));
    const { task } = parseTask(`- [ ] ${update.text}`, 1, 'tasks.md', {});

    expect(md2doToTodoist(task!).due_date).toBe(date);
  });

  it.each(DATES)(
    'formatTaskContent writes a parsed date %s back unchanged',
    (date) => {
      const { task } = parseTask(
        `- [ ] Fix bug #due/${date}`,
        1,
        'tasks.md',
        {},
      );

      expect(formatTaskContent('Fix bug', { due: task!.dueDate! })).toBe(
        `Fix bug #due/${date}`,
      );
    },
  );
});
