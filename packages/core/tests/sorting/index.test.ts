import { describe, it, expect } from 'vitest';
import type { Task } from '../../src/types/index.js';
import {
  byDueDate,
  byPriority,
  byCreatedDate,
  byFile,
  byProject,
  byPerson,
  byAssignee,
  byCompletionStatus,
  combineComparators,
  reverse,
} from '../../src/sorting/index.js';

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

describe('byDueDate', () => {
  it('should sort tasks by due date ascending', () => {
    const tasks = [
      createTask({ dueDate: new Date('2026-01-25'), text: 'Third' }),
      createTask({ dueDate: new Date('2026-01-18'), text: 'First' }),
      createTask({ dueDate: new Date('2026-01-20'), text: 'Second' }),
    ];

    const sorted = [...tasks].sort(byDueDate());

    expect(sorted[0]?.text).toBe('First');
    expect(sorted[1]?.text).toBe('Second');
    expect(sorted[2]?.text).toBe('Third');
  });

  it('should put tasks without due dates last', () => {
    const tasks = [
      createTask({ dueDate: new Date('2026-01-20'), text: 'With date' }),
      createTask({ text: 'No date 1' }),
      createTask({ text: 'No date 2' }),
      createTask({ dueDate: new Date('2026-01-18'), text: 'Earlier date' }),
    ];

    const sorted = [...tasks].sort(byDueDate());

    expect(sorted[0]?.text).toBe('Earlier date');
    expect(sorted[1]?.text).toBe('With date');
    expect(sorted[2]?.dueDate).toBeUndefined();
    expect(sorted[3]?.dueDate).toBeUndefined();
  });

  it('should handle all tasks without due dates', () => {
    const tasks = [createTask({ text: 'A' }), createTask({ text: 'B' })];

    const sorted = [...tasks].sort(byDueDate());

    expect(sorted).toHaveLength(2);
  });
});

describe('byPriority', () => {
  it('should sort by priority (urgent > high > normal > low)', () => {
    const tasks = [
      createTask({ priority: 'normal', text: 'Normal' }),
      createTask({ priority: 'urgent', text: 'Urgent' }),
      createTask({ text: 'Low (no priority)' }),
      createTask({ priority: 'high', text: 'High' }),
    ];

    const sorted = [...tasks].sort(byPriority());

    expect(sorted[0]?.text).toBe('Urgent');
    expect(sorted[1]?.text).toBe('High');
    expect(sorted[2]?.text).toBe('Normal');
    expect(sorted[3]?.text).toBe('Low (no priority)');
  });

  it('should handle all same priority', () => {
    const tasks = [
      createTask({ priority: 'high', text: 'A' }),
      createTask({ priority: 'high', text: 'B' }),
    ];

    const sorted = [...tasks].sort(byPriority());

    expect(sorted).toHaveLength(2);
    expect(sorted.every((t) => t.priority === 'high')).toBe(true);
  });
});

describe('byCreatedDate', () => {
  it('should sort by context date ascending', () => {
    const tasks = [
      createTask({ contextDate: new Date('2026-01-20'), text: 'Second' }),
      createTask({ contextDate: new Date('2026-01-18'), text: 'First' }),
      createTask({ contextDate: new Date('2026-01-25'), text: 'Third' }),
    ];

    const sorted = [...tasks].sort(byCreatedDate());

    expect(sorted[0]?.text).toBe('First');
    expect(sorted[1]?.text).toBe('Second');
    expect(sorted[2]?.text).toBe('Third');
  });

  it('should put tasks without context dates last', () => {
    const tasks = [
      createTask({ text: 'No date' }),
      createTask({ contextDate: new Date('2026-01-20'), text: 'With date' }),
    ];

    const sorted = [...tasks].sort(byCreatedDate());

    expect(sorted[0]?.text).toBe('With date');
    expect(sorted[1]?.text).toBe('No date');
  });
});

describe('byFile', () => {
  it('should sort by file path alphabetically', () => {
    const tasks = [
      createTask({ file: 'projects/widget-co/notes.md', line: 1 }),
      createTask({ file: 'projects/acme-app/notes.md', line: 1 }),
      createTask({ file: 'general.md', line: 1 }),
    ];

    const sorted = [...tasks].sort(byFile());

    expect(sorted[0]?.file).toBe('general.md');
    expect(sorted[1]?.file).toBe('projects/acme-app/notes.md');
    expect(sorted[2]?.file).toBe('projects/widget-co/notes.md');
  });

  it('should sort by line number within same file', () => {
    const tasks = [
      createTask({ file: 'test.md', line: 15 }),
      createTask({ file: 'test.md', line: 5 }),
      createTask({ file: 'test.md', line: 10 }),
    ];

    const sorted = [...tasks].sort(byFile());

    expect(sorted[0]?.line).toBe(5);
    expect(sorted[1]?.line).toBe(10);
    expect(sorted[2]?.line).toBe(15);
  });

  it('should combine file and line sorting', () => {
    const tasks = [
      createTask({ file: 'b.md', line: 1 }),
      createTask({ file: 'a.md', line: 10 }),
      createTask({ file: 'a.md', line: 5 }),
      createTask({ file: 'b.md', line: 3 }),
    ];

    const sorted = [...tasks].sort(byFile());

    expect(sorted[0]?.file).toBe('a.md');
    expect(sorted[0]?.line).toBe(5);
    expect(sorted[1]?.file).toBe('a.md');
    expect(sorted[1]?.line).toBe(10);
    expect(sorted[2]?.file).toBe('b.md');
    expect(sorted[2]?.line).toBe(1);
    expect(sorted[3]?.file).toBe('b.md');
    expect(sorted[3]?.line).toBe(3);
  });
});

describe('byProject', () => {
  it('should sort by project alphabetically', () => {
    const tasks = [
      createTask({ project: 'widget-co' }),
      createTask({ project: 'acme-app' }),
      createTask({ project: 'zebra-inc' }),
    ];

    const sorted = [...tasks].sort(byProject());

    expect(sorted[0]?.project).toBe('acme-app');
    expect(sorted[1]?.project).toBe('widget-co');
    expect(sorted[2]?.project).toBe('zebra-inc');
  });

  it('should put tasks without projects last', () => {
    const tasks = [
      createTask({ project: 'acme-app' }),
      createTask({}),
      createTask({ project: 'widget-co' }),
    ];

    const sorted = [...tasks].sort(byProject());

    expect(sorted[0]?.project).toBe('acme-app');
    expect(sorted[1]?.project).toBe('widget-co');
    expect(sorted[2]?.project).toBeUndefined();
  });
});

describe('byPerson', () => {
  it('should sort by person alphabetically', () => {
    const tasks = [
      createTask({ person: 'jane-doe' }),
      createTask({ person: 'alex-chen' }),
      createTask({ person: 'zoe-smith' }),
    ];

    const sorted = [...tasks].sort(byPerson());

    expect(sorted[0]?.person).toBe('alex-chen');
    expect(sorted[1]?.person).toBe('jane-doe');
    expect(sorted[2]?.person).toBe('zoe-smith');
  });

  it('should put tasks without person last', () => {
    const tasks = [
      createTask({ person: 'jane-doe' }),
      createTask({}),
      createTask({ person: 'alex-chen' }),
    ];

    const sorted = [...tasks].sort(byPerson());

    expect(sorted[0]?.person).toBe('alex-chen');
    expect(sorted[1]?.person).toBe('jane-doe');
    expect(sorted[2]?.person).toBeUndefined();
  });
});

describe('byAssignee', () => {
  it('should sort by assignee alphabetically', () => {
    const tasks = [
      createTask({ assignee: 'charlie' }),
      createTask({ assignee: 'alice' }),
      createTask({ assignee: 'bob' }),
    ];

    const sorted = [...tasks].sort(byAssignee());

    expect(sorted[0]?.assignee).toBe('alice');
    expect(sorted[1]?.assignee).toBe('bob');
    expect(sorted[2]?.assignee).toBe('charlie');
  });

  it('should put tasks without assignee last', () => {
    const tasks = [
      createTask({ assignee: 'alice' }),
      createTask({}),
      createTask({ assignee: 'bob' }),
    ];

    const sorted = [...tasks].sort(byAssignee());

    expect(sorted[0]?.assignee).toBe('alice');
    expect(sorted[1]?.assignee).toBe('bob');
    expect(sorted[2]?.assignee).toBeUndefined();
  });
});

describe('byCompletionStatus', () => {
  it('should sort incomplete tasks first', () => {
    const tasks = [
      createTask({ completed: true, text: 'Completed 1' }),
      createTask({ completed: false, text: 'Incomplete 1' }),
      createTask({ completed: true, text: 'Completed 2' }),
      createTask({ completed: false, text: 'Incomplete 2' }),
    ];

    const sorted = [...tasks].sort(byCompletionStatus());

    expect(sorted[0]?.completed).toBe(false);
    expect(sorted[1]?.completed).toBe(false);
    expect(sorted[2]?.completed).toBe(true);
    expect(sorted[3]?.completed).toBe(true);
  });
});

describe('combineComparators', () => {
  it('should combine multiple comparators in order', () => {
    const tasks = [
      createTask({
        priority: 'normal',
        dueDate: new Date('2026-01-20'),
        text: 'Normal, Jan 20',
      }),
      createTask({
        priority: 'urgent',
        dueDate: new Date('2026-01-25'),
        text: 'Urgent, Jan 25',
      }),
      createTask({
        priority: 'urgent',
        dueDate: new Date('2026-01-18'),
        text: 'Urgent, Jan 18',
      }),
      createTask({
        priority: 'high',
        dueDate: new Date('2026-01-19'),
        text: 'High, Jan 19',
      }),
    ];

    // Sort by priority first, then by due date
    const sorted = [...tasks].sort(
      combineComparators([byPriority(), byDueDate()]),
    );

    expect(sorted[0]?.text).toBe('Urgent, Jan 18');
    expect(sorted[1]?.text).toBe('Urgent, Jan 25');
    expect(sorted[2]?.text).toBe('High, Jan 19');
    expect(sorted[3]?.text).toBe('Normal, Jan 20');
  });

  it('should only apply next comparator if previous returns 0', () => {
    const tasks = [
      createTask({ file: 'a.md', line: 10 }),
      createTask({ file: 'b.md', line: 5 }),
      createTask({ file: 'a.md', line: 5 }),
    ];

    // Sort by file, then by line
    const sorted = [...tasks].sort(combineComparators([byFile()]));

    expect(sorted[0]?.file).toBe('a.md');
    expect(sorted[0]?.line).toBe(5); // Line sorting is part of byFile
    expect(sorted[1]?.file).toBe('a.md');
    expect(sorted[1]?.line).toBe(10);
    expect(sorted[2]?.file).toBe('b.md');
  });

  it('should work with empty comparators array', () => {
    const tasks = [createTask({ text: 'A' }), createTask({ text: 'B' })];

    const sorted = [...tasks].sort(combineComparators([]));

    expect(sorted).toHaveLength(2);
  });

  it('should handle three-level sorting', () => {
    const tasks = [
      createTask({
        project: 'acme-app',
        priority: 'high',
        dueDate: new Date('2026-01-20'),
        text: 'acme-high-20',
      }),
      createTask({
        project: 'acme-app',
        priority: 'urgent',
        dueDate: new Date('2026-01-18'),
        text: 'acme-urgent-18',
      }),
      createTask({
        project: 'widget-co',
        priority: 'urgent',
        dueDate: new Date('2026-01-19'),
        text: 'widget-urgent-19',
      }),
      createTask({
        project: 'acme-app',
        priority: 'urgent',
        dueDate: new Date('2026-01-25'),
        text: 'acme-urgent-25',
      }),
    ];

    // Sort by project, then priority, then due date
    const sorted = [...tasks].sort(
      combineComparators([byProject(), byPriority(), byDueDate()]),
    );

    expect(sorted[0]?.text).toBe('acme-urgent-18');
    expect(sorted[1]?.text).toBe('acme-urgent-25');
    expect(sorted[2]?.text).toBe('acme-high-20');
    expect(sorted[3]?.text).toBe('widget-urgent-19');
  });
});

describe('reverse', () => {
  it('should reverse sort order', () => {
    const tasks = [
      createTask({ dueDate: new Date('2026-01-18'), text: 'First' }),
      createTask({ dueDate: new Date('2026-01-20'), text: 'Second' }),
      createTask({ dueDate: new Date('2026-01-25'), text: 'Third' }),
    ];

    const sorted = [...tasks].sort(reverse(byDueDate()));

    expect(sorted[0]?.text).toBe('Third');
    expect(sorted[1]?.text).toBe('Second');
    expect(sorted[2]?.text).toBe('First');
  });

  it('should work with priority sorting', () => {
    const tasks = [
      createTask({ priority: 'urgent', text: 'Urgent' }),
      createTask({ priority: 'normal', text: 'Normal' }),
      createTask({ priority: 'high', text: 'High' }),
    ];

    const sorted = [...tasks].sort(reverse(byPriority()));

    // Reverse: low > normal > high > urgent
    expect(sorted[0]?.text).toBe('Normal');
    expect(sorted[1]?.text).toBe('High');
    expect(sorted[2]?.text).toBe('Urgent');
  });
});

describe('Realistic sorting scenarios', () => {
  it('should sort my tasks by priority then due date', () => {
    const tasks = [
      createTask({
        assignee: 'nick',
        priority: 'normal',
        dueDate: new Date('2026-01-18'),
        text: 'Normal Jan 18',
      }),
      createTask({
        assignee: 'nick',
        priority: 'urgent',
        dueDate: new Date('2026-01-25'),
        text: 'Urgent Jan 25',
      }),
      createTask({
        assignee: 'nick',
        priority: 'urgent',
        dueDate: new Date('2026-01-20'),
        text: 'Urgent Jan 20',
      }),
      createTask({
        assignee: 'nick',
        priority: 'high',
        dueDate: new Date('2026-01-19'),
        text: 'High Jan 19',
      }),
    ];

    const sorted = [...tasks].sort(
      combineComparators([byPriority(), byDueDate()]),
    );

    expect(sorted[0]?.text).toBe('Urgent Jan 20');
    expect(sorted[1]?.text).toBe('Urgent Jan 25');
    expect(sorted[2]?.text).toBe('High Jan 19');
    expect(sorted[3]?.text).toBe('Normal Jan 18');
  });

  it('should sort project tasks by file location', () => {
    const tasks = [
      createTask({
        project: 'acme-app',
        file: 'projects/acme-app/sprint-2.md',
        line: 10,
      }),
      createTask({
        project: 'acme-app',
        file: 'projects/acme-app/sprint-1.md',
        line: 5,
      }),
      createTask({
        project: 'acme-app',
        file: 'projects/acme-app/sprint-1.md',
        line: 15,
      }),
    ];

    const sorted = [...tasks].sort(byFile());

    expect(sorted[0]?.file).toBe('projects/acme-app/sprint-1.md');
    expect(sorted[0]?.line).toBe(5);
    expect(sorted[1]?.file).toBe('projects/acme-app/sprint-1.md');
    expect(sorted[1]?.line).toBe(15);
    expect(sorted[2]?.file).toBe('projects/acme-app/sprint-2.md');
  });

  it('should sort incomplete tasks before completed, then by due date', () => {
    const tasks = [
      createTask({
        completed: true,
        dueDate: new Date('2026-01-18'),
        text: 'Completed early',
      }),
      createTask({
        completed: false,
        dueDate: new Date('2026-01-25'),
        text: 'Incomplete late',
      }),
      createTask({
        completed: false,
        dueDate: new Date('2026-01-20'),
        text: 'Incomplete early',
      }),
      createTask({
        completed: true,
        dueDate: new Date('2026-01-22'),
        text: 'Completed late',
      }),
    ];

    const sorted = [...tasks].sort(
      combineComparators([byCompletionStatus(), byDueDate()]),
    );

    expect(sorted[0]?.text).toBe('Incomplete early');
    expect(sorted[1]?.text).toBe('Incomplete late');
    expect(sorted[2]?.text).toBe('Completed early');
    expect(sorted[3]?.text).toBe('Completed late');
  });
});
