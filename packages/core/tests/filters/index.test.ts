import { describe, it, expect } from 'vitest';
import type { Task } from '../../src/types/index.js';
import {
  byAssignee,
  byCompleted,
  byPriority,
  byProject,
  byPerson,
  byTag,
  byPath,
  isOverdue,
  isDueToday,
  isDueThisWeek,
  isDueWithinDays,
  hasDueDate,
  hasNoDueDate,
  combineFilters,
  combineFiltersOr,
  not,
} from '../../src/filters/index.js';

// Helper to create test tasks
function createTask(overrides: Partial<Task>): Task {
  return {
    id: 'test-id',
    text: 'Test task',
    completed: false,
    file: 'test.md',
    line: 1,
    tags: [],
    ...overrides,
  };
}

describe('byAssignee', () => {
  it('should filter tasks by assignee', () => {
    const tasks = [
      createTask({ assignee: 'alice' }),
      createTask({ assignee: 'bob' }),
      createTask({ assignee: 'alice' }),
      createTask({}), // No assignee
    ];

    const filtered = tasks.filter(byAssignee('alice'));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.assignee === 'alice')).toBe(true);
  });

  it('should return empty array if no matches', () => {
    const tasks = [
      createTask({ assignee: 'alice' }),
      createTask({ assignee: 'bob' }),
    ];

    const filtered = tasks.filter(byAssignee('charlie'));
    expect(filtered).toHaveLength(0);
  });
});

describe('byCompleted', () => {
  it('should filter incomplete tasks', () => {
    const tasks = [
      createTask({ completed: false }),
      createTask({ completed: true }),
      createTask({ completed: false }),
    ];

    const filtered = tasks.filter(byCompleted(false));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => !t.completed)).toBe(true);
  });

  it('should filter completed tasks', () => {
    const tasks = [
      createTask({ completed: false }),
      createTask({ completed: true }),
      createTask({ completed: true }),
    ];

    const filtered = tasks.filter(byCompleted(true));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.completed)).toBe(true);
  });
});

describe('byPriority', () => {
  it('should filter by urgent priority', () => {
    const tasks = [
      createTask({ priority: 'urgent' }),
      createTask({ priority: 'high' }),
      createTask({ priority: 'urgent' }),
      createTask({}), // No priority
    ];

    const filtered = tasks.filter(byPriority('urgent'));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.priority === 'urgent')).toBe(true);
  });

  it('should filter by high priority', () => {
    const tasks = [
      createTask({ priority: 'urgent' }),
      createTask({ priority: 'high' }),
      createTask({ priority: 'normal' }),
    ];

    const filtered = tasks.filter(byPriority('high'));
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.priority).toBe('high');
  });

  it('should filter by normal priority', () => {
    const tasks = [
      createTask({ priority: 'normal' }),
      createTask({ priority: 'high' }),
      createTask({ priority: 'normal' }),
    ];

    const filtered = tasks.filter(byPriority('normal'));
    expect(filtered).toHaveLength(2);
  });
});

describe('byProject', () => {
  it('should filter tasks by project', () => {
    const tasks = [
      createTask({ project: 'acme-app' }),
      createTask({ project: 'widget-co' }),
      createTask({ project: 'acme-app' }),
      createTask({}), // No project
    ];

    const filtered = tasks.filter(byProject('acme-app'));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.project === 'acme-app')).toBe(true);
  });
});

describe('byPerson', () => {
  it('should filter tasks by person', () => {
    const tasks = [
      createTask({ person: 'jane-doe' }),
      createTask({ person: 'alex-chen' }),
      createTask({ person: 'jane-doe' }),
      createTask({}), // No person
    ];

    const filtered = tasks.filter(byPerson('jane-doe'));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.person === 'jane-doe')).toBe(true);
  });
});

describe('byTag', () => {
  it('should filter tasks by single tag', () => {
    const tasks = [
      createTask({ tags: ['backend', 'urgent'] }),
      createTask({ tags: ['frontend'] }),
      createTask({ tags: ['backend', 'api'] }),
      createTask({ tags: [] }),
    ];

    const filtered = tasks.filter(byTag('backend'));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.tags.includes('backend'))).toBe(true);
  });

  it('should return empty if tag not found', () => {
    const tasks = [
      createTask({ tags: ['backend'] }),
      createTask({ tags: ['frontend'] }),
    ];

    const filtered = tasks.filter(byTag('devops'));
    expect(filtered).toHaveLength(0);
  });

  it('should handle tasks with no tags', () => {
    const tasks = [createTask({ tags: [] }), createTask({ tags: ['backend'] })];

    const filtered = tasks.filter(byTag('backend'));
    expect(filtered).toHaveLength(1);
  });
});

describe('byPath', () => {
  describe('Exact file match', () => {
    it('should match exact file path', () => {
      const tasks = [
        createTask({ file: 'projects/acme-app/notes.md' }),
        createTask({ file: 'projects/widget-co/notes.md' }),
        createTask({ file: 'general.md' }),
      ];

      const filtered = tasks.filter(byPath('projects/acme-app/notes.md'));
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.file).toBe('projects/acme-app/notes.md');
    });

    it('should not match different file', () => {
      const tasks = [createTask({ file: 'test.md' })];

      const filtered = tasks.filter(byPath('other.md'));
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Directory match (recursive)', () => {
    it('should match all files in directory', () => {
      const tasks = [
        createTask({ file: 'projects/acme-app/notes.md' }),
        createTask({ file: 'projects/acme-app/sprint.md' }),
        createTask({ file: 'projects/widget-co/notes.md' }),
      ];

      const filtered = tasks.filter(byPath('projects/acme-app'));
      expect(filtered).toHaveLength(2);
      expect(
        filtered.every((t) => t.file.startsWith('projects/acme-app/')),
      ).toBe(true);
    });

    it('should match files in subdirectories', () => {
      const tasks = [
        createTask({ file: 'projects/acme-app/sprint-1/notes.md' }),
        createTask({ file: 'projects/acme-app/sprint-2/notes.md' }),
        createTask({ file: 'projects/widget-co/notes.md' }),
      ];

      const filtered = tasks.filter(byPath('projects/acme-app'));
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Directory match (non-recursive)', () => {
    it('should match only direct children', () => {
      const tasks = [
        createTask({ file: 'projects/acme-app/notes.md' }),
        createTask({ file: 'projects/acme-app/sprint-1/tasks.md' }),
        createTask({ file: 'projects/acme-app/backlog.md' }),
      ];

      const filtered = tasks.filter(
        byPath('projects/acme-app', { recursive: false }),
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.some((t) => t.file.includes('sprint-1'))).toBe(false);
    });

    it('should not match files in subdirectories', () => {
      const tasks = [
        createTask({ file: 'projects/acme-app/deep/nested/file.md' }),
        createTask({ file: 'projects/acme-app/file.md' }),
      ];

      const filtered = tasks.filter(
        byPath('projects/acme-app', { recursive: false }),
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.file).toBe('projects/acme-app/file.md');
    });
  });

  describe('Path normalization', () => {
    it('should handle backslashes (Windows paths)', () => {
      const tasks = [createTask({ file: 'projects\\acme-app\\notes.md' })];

      const filtered = tasks.filter(byPath('projects/acme-app'));
      expect(filtered).toHaveLength(1);
    });
  });
});

describe('Due date filters', () => {
  const now = new Date('2026-01-18T12:00:00Z');

  describe('isOverdue', () => {
    it('should filter overdue tasks', () => {
      const tasks = [
        createTask({ dueDate: new Date('2026-01-17T00:00:00Z') }), // Yesterday
        createTask({ dueDate: new Date('2026-01-18T00:00:00Z') }), // Today
        createTask({ dueDate: new Date('2026-01-19T00:00:00Z') }), // Tomorrow
        createTask({}), // No due date
      ];

      const filtered = tasks.filter(isOverdue(now));
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.dueDate?.getUTCDate()).toBe(17);
    });

    it('should not include completed tasks', () => {
      const tasks = [
        createTask({
          dueDate: new Date('2026-01-17T00:00:00Z'),
          completed: true,
        }),
        createTask({
          dueDate: new Date('2026-01-17T00:00:00Z'),
          completed: false,
        }),
      ];

      const filtered = tasks.filter(isOverdue(now));
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.completed).toBe(false);
    });

    it('should not include tasks with no due date', () => {
      const tasks = [
        createTask({}),
        createTask({ dueDate: new Date('2026-01-17T00:00:00Z') }),
      ];

      const filtered = tasks.filter(isOverdue(now));
      expect(filtered).toHaveLength(1);
    });
  });

  describe('isDueToday', () => {
    it('should filter tasks due today', () => {
      const tasks = [
        createTask({ dueDate: new Date('2026-01-17T00:00:00Z') }), // Yesterday
        createTask({ dueDate: new Date('2026-01-18T00:00:00Z') }), // Today
        createTask({ dueDate: new Date('2026-01-19T00:00:00Z') }), // Tomorrow
      ];

      const filtered = tasks.filter(isDueToday(now));
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.dueDate?.getUTCDate()).toBe(18);
    });

    it('should not include completed tasks', () => {
      const tasks = [
        createTask({
          dueDate: new Date('2026-01-18T00:00:00Z'),
          completed: true,
        }),
        createTask({
          dueDate: new Date('2026-01-18T00:00:00Z'),
          completed: false,
        }),
      ];

      const filtered = tasks.filter(isDueToday(now));
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.completed).toBe(false);
    });
  });

  describe('isDueThisWeek', () => {
    it('should filter tasks due this week', () => {
      // 2026-01-18 is a Sunday
      const tasks = [
        createTask({ dueDate: new Date('2026-01-12T00:00:00Z') }), // Previous week (Monday)
        createTask({ dueDate: new Date('2026-01-18T00:00:00Z') }), // This week (Sunday)
        createTask({ dueDate: new Date('2026-01-19T00:00:00Z') }), // This week (Monday)
        createTask({ dueDate: new Date('2026-01-25T00:00:00Z') }), // Next week (Sunday)
      ];

      const filtered = tasks.filter(isDueThisWeek(now));
      // Week starts on Monday, so 18th (Sunday) and 19th (Monday) are in same week
      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every(
          (t) =>
            t.dueDate &&
            t.dueDate >= new Date('2026-01-12T00:00:00Z') &&
            t.dueDate <= new Date('2026-01-25T23:59:59Z'),
        ),
      ).toBe(true);
    });

    it('should not include completed tasks', () => {
      const tasks = [
        createTask({
          dueDate: new Date('2026-01-19T00:00:00Z'),
          completed: true,
        }),
        createTask({
          dueDate: new Date('2026-01-19T00:00:00Z'),
          completed: false,
        }),
      ];

      const filtered = tasks.filter(isDueThisWeek(now));
      expect(filtered.every((t) => !t.completed)).toBe(true);
    });
  });

  describe('isDueWithinDays', () => {
    it('should filter tasks due within N days', () => {
      const tasks = [
        createTask({ dueDate: new Date('2026-01-18T00:00:00Z') }), // 0 days
        createTask({ dueDate: new Date('2026-01-20T00:00:00Z') }), // 2 days
        createTask({ dueDate: new Date('2026-01-25T00:00:00Z') }), // 7 days
        createTask({ dueDate: new Date('2026-01-26T00:00:00Z') }), // 8 days
      ];

      const filtered = tasks.filter(isDueWithinDays(7, now));
      expect(filtered).toHaveLength(3);
      // Should include tasks from today (18th) through 7 days later (25th at end of day)
      expect(
        filtered.every((t) => {
          if (!t.dueDate) return false;
          const endDate = new Date('2026-01-25T23:59:59Z');
          return t.dueDate <= endDate;
        }),
      ).toBe(true);
    });

    it('should not include completed tasks', () => {
      const tasks = [
        createTask({
          dueDate: new Date('2026-01-20T00:00:00Z'),
          completed: true,
        }),
        createTask({
          dueDate: new Date('2026-01-20T00:00:00Z'),
          completed: false,
        }),
      ];

      const filtered = tasks.filter(isDueWithinDays(7, now));
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.completed).toBe(false);
    });
  });

  describe('hasDueDate', () => {
    it('should filter tasks with due dates', () => {
      const tasks = [
        createTask({ dueDate: new Date('2026-01-18') }),
        createTask({}),
        createTask({ dueDate: new Date('2026-01-19') }),
      ];

      const filtered = tasks.filter(hasDueDate());
      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.dueDate !== undefined)).toBe(true);
    });
  });

  describe('hasNoDueDate', () => {
    it('should filter tasks without due dates', () => {
      const tasks = [
        createTask({ dueDate: new Date('2026-01-18') }),
        createTask({}),
        createTask({ dueDate: new Date('2026-01-19') }),
        createTask({}),
      ];

      const filtered = tasks.filter(hasNoDueDate());
      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.dueDate === undefined)).toBe(true);
    });
  });
});

describe('Filter combinators', () => {
  describe('combineFilters (AND)', () => {
    it('should combine multiple filters with AND logic', () => {
      const tasks = [
        createTask({ assignee: 'alice', priority: 'urgent', completed: false }),
        createTask({ assignee: 'alice', priority: 'high', completed: false }),
        createTask({ assignee: 'bob', priority: 'urgent', completed: false }),
        createTask({ assignee: 'alice', priority: 'urgent', completed: true }),
      ];

      const filtered = tasks.filter(
        combineFilters([
          byAssignee('alice'),
          byPriority('urgent'),
          byCompleted(false),
        ]),
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.assignee).toBe('alice');
      expect(filtered[0]?.priority).toBe('urgent');
      expect(filtered[0]?.completed).toBe(false);
    });

    it('should return empty array if any filter fails', () => {
      const tasks = [createTask({ assignee: 'alice', priority: 'high' })];

      const filtered = tasks.filter(
        combineFilters([byAssignee('alice'), byPriority('urgent')]),
      );

      expect(filtered).toHaveLength(0);
    });

    it('should work with empty filters array', () => {
      const tasks = [createTask({}), createTask({})];

      const filtered = tasks.filter(combineFilters([]));
      expect(filtered).toHaveLength(2);
    });
  });

  describe('combineFiltersOr (OR)', () => {
    it('should combine multiple filters with OR logic', () => {
      const tasks = [
        createTask({ priority: 'urgent' }),
        createTask({ priority: 'high' }),
        createTask({ priority: 'normal' }),
        createTask({}),
      ];

      const filtered = tasks.filter(
        combineFiltersOr([byPriority('urgent'), byPriority('high')]),
      );

      expect(filtered).toHaveLength(2);
      expect(
        filtered.every((t) => t.priority === 'urgent' || t.priority === 'high'),
      ).toBe(true);
    });

    it('should return match if any filter passes', () => {
      const tasks = [
        createTask({ assignee: 'alice', priority: 'high' }),
        createTask({ assignee: 'bob', priority: 'urgent' }),
      ];

      const filtered = tasks.filter(
        combineFiltersOr([byAssignee('alice'), byPriority('urgent')]),
      );

      expect(filtered).toHaveLength(2);
    });

    it('should work with empty filters array', () => {
      const tasks = [createTask({}), createTask({})];

      const filtered = tasks.filter(combineFiltersOr([]));
      expect(filtered).toHaveLength(0);
    });
  });

  describe('not', () => {
    it('should negate a filter', () => {
      const tasks = [
        createTask({ completed: true }),
        createTask({ completed: false }),
        createTask({ completed: false }),
      ];

      const filtered = tasks.filter(not(byCompleted(true)));
      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => !t.completed)).toBe(true);
    });

    it('should work with complex filters', () => {
      const tasks = [
        createTask({ assignee: 'alice' }),
        createTask({ assignee: 'bob' }),
        createTask({}),
      ];

      const filtered = tasks.filter(not(byAssignee('alice')));
      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.assignee !== 'alice')).toBe(true);
    });
  });
});

describe('Realistic filtering scenarios', () => {
  const now = new Date('2026-01-18T12:00:00Z');

  it('should filter my urgent overdue tasks', () => {
    const tasks = [
      createTask({
        assignee: 'nick',
        priority: 'urgent',
        dueDate: new Date('2026-01-17'),
      }),
      createTask({
        assignee: 'nick',
        priority: 'high',
        dueDate: new Date('2026-01-17'),
      }),
      createTask({
        assignee: 'alice',
        priority: 'urgent',
        dueDate: new Date('2026-01-17'),
      }),
      createTask({
        assignee: 'nick',
        priority: 'urgent',
        dueDate: new Date('2026-01-20'),
      }),
    ];

    const filtered = tasks.filter(
      combineFilters([
        byAssignee('nick'),
        byPriority('urgent'),
        isOverdue(now),
      ]),
    );

    expect(filtered).toHaveLength(1);
  });

  it('should filter project tasks due this week', () => {
    // 2026-01-18 is Sunday, so this week (Mon-Sun) is Jan 12-18
    // Tasks due on Jan 13 (Mon), 15 (Wed), 17 (Fri) are this week
    // Task due on Jan 20 (next Monday) is next week
    const tasks = [
      createTask({
        project: 'acme-app',
        dueDate: new Date('2026-01-15T00:00:00Z'), // This week (Wednesday)
      }),
      createTask({
        project: 'widget-co',
        dueDate: new Date('2026-01-15T00:00:00Z'), // This week
      }),
      createTask({
        project: 'acme-app',
        dueDate: new Date('2026-01-27T00:00:00Z'), // Next week
      }),
      createTask({ project: 'acme-app' }), // No due date
    ];

    const filtered = tasks.filter(
      combineFilters([byProject('acme-app'), isDueThisWeek(now)]),
    );

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((t) => t.project === 'acme-app')).toBe(true);
  });

  it('should filter backend tasks tagged urgent', () => {
    const tasks = [
      createTask({ tags: ['backend', 'urgent'] }),
      createTask({ tags: ['backend', 'api'] }),
      createTask({ tags: ['frontend', 'urgent'] }),
      createTask({ tags: ['backend'] }),
    ];

    const filtered = tasks.filter(
      combineFilters([byTag('backend'), byTag('urgent')]),
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.tags).toContain('backend');
    expect(filtered[0]?.tags).toContain('urgent');
  });
});
