/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { listTasks } from '../src/tools/list-tasks';
import { getTaskStats } from '../src/tools/get-stats';
import { searchTasks } from '../src/tools/search-tasks';
import { getTaskById } from '../src/tools/get-task-by-id';

const TODAY = '2026-10-09';
const NOWS = [`${TODAY}T00:00:30`, `${TODAY}T12:00:00`, `${TODAY}T23:59:30`];

// These run in the process timezone. `pnpm test:tz` repeats them per zone.
describe(`MCP tools and dates (TZ=${process.env.TZ ?? 'system'})`, () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'md2do-mcp-dates-'));
    writeFileSync(
      join(dir, 'tasks.md'),
      [
        '- [ ] Yesterday task @alice #due/2026-10-08',
        '- [ ] Today task @alice #due/2026-10-09',
        '- [ ] Tomorrow task @alice #due/2026-10-10',
        '- [x] Finished task @alice #due/2026-10-01 {completed:2026-10-02}',
        '',
      ].join('\n'),
    );
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function freeze(wall: string): void {
    // Fake only Date, so file system and glob timers keep working
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(wall));
  }

  describe.each(NOWS)('now = %s', (wall) => {
    it('list_tasks overdue keeps only tasks due before today', async () => {
      freeze(wall);
      const parsed = JSON.parse(await listTasks({ path: dir, overdue: true }));

      expect(parsed.tasks.map((t: any) => t.text)).toEqual(['Yesterday task']);
    });

    it('get_task_stats counts a task due today as not overdue', async () => {
      freeze(wall);
      const parsed = JSON.parse(await getTaskStats({ path: dir }));

      expect(parsed.overall.overdue).toBe(1);
    });

    it('get_task_stats grouped counts overdue the same way', async () => {
      freeze(wall);
      const parsed = JSON.parse(
        await getTaskStats({ path: dir, groupBy: 'assignee' }),
      );

      expect(parsed.groups.alice.overdue).toBe(1);
    });
  });

  describe('date output', () => {
    it('list_tasks returns calendar dates, not timestamps', async () => {
      const parsed = JSON.parse(await listTasks({ path: dir }));
      const byText = Object.fromEntries(
        parsed.tasks.map((t: any) => [t.text, t]),
      );

      expect(byText['Today task'].dueDate).toBe('2026-10-09');
      expect(byText['Finished task'].dueDate).toBe('2026-10-01');
      expect(byText['Finished task'].completedDate).toBe('2026-10-02');
    });

    it('search_tasks returns calendar dates', async () => {
      const parsed = JSON.parse(
        await searchTasks({ path: dir, query: 'Finished' }),
      );
      const task = parsed.results[0];

      expect(task.dueDate).toBe('2026-10-01');
      expect(task.completedDate).toBe('2026-10-02');
    });

    it('get_task_by_id returns calendar dates', async () => {
      const listed = JSON.parse(await listTasks({ path: dir }));
      const id = listed.tasks.find((t: any) => t.text === 'Today task').id;
      const parsed = JSON.parse(await getTaskById({ path: dir, id }));

      expect(parsed.task.dueDate).toBe('2026-10-09');
    });
  });
});
