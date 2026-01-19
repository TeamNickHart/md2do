import { describe, it, expect } from 'vitest';
import {
  md2doToTodoistPriority,
  todoistToMd2doPriority,
  extractTaskContent,
  formatTaskContent,
  md2doToTodoist,
  todoistToMd2do,
} from '../src/mapper.js';
import type { Task } from '@md2do/core';
import type { Task as TodoistTask } from '@doist/todoist-api-typescript';

describe('md2doToTodoistPriority', () => {
  it('should map urgent to 4', () => {
    expect(md2doToTodoistPriority('urgent')).toBe(4);
  });

  it('should map high to 3', () => {
    expect(md2doToTodoistPriority('high')).toBe(3);
  });

  it('should map normal to 2', () => {
    expect(md2doToTodoistPriority('normal')).toBe(2);
  });

  it('should map low to 1', () => {
    expect(md2doToTodoistPriority('low')).toBe(1);
  });

  it('should default to 1 for undefined', () => {
    expect(md2doToTodoistPriority(undefined)).toBe(1);
  });
});

describe('todoistToMd2doPriority', () => {
  it('should map 4 to urgent', () => {
    expect(todoistToMd2doPriority(4)).toBe('urgent');
  });

  it('should map 3 to high', () => {
    expect(todoistToMd2doPriority(3)).toBe('high');
  });

  it('should map 2 to normal', () => {
    expect(todoistToMd2doPriority(2)).toBe('normal');
  });

  it('should map 1 to low', () => {
    expect(todoistToMd2doPriority(1)).toBe('low');
  });

  it('should return undefined for invalid priority', () => {
    expect(todoistToMd2doPriority(0)).toBeUndefined();
  });
});

describe('extractTaskContent', () => {
  it('should remove assignee', () => {
    const text = 'Fix bug @nick';
    expect(extractTaskContent(text)).toBe('Fix bug');
  });

  it('should remove priority markers', () => {
    const text = 'Fix bug !!!';
    expect(extractTaskContent(text)).toBe('Fix bug');
  });

  it('should remove tags', () => {
    const text = 'Fix bug #backend #urgent';
    expect(extractTaskContent(text)).toBe('Fix bug');
  });

  it('should remove dates', () => {
    const text = 'Fix bug (2026-01-20)';
    expect(extractTaskContent(text)).toBe('Fix bug');
  });

  it('should remove Todoist ID', () => {
    const text = 'Fix bug [todoist:123456]';
    expect(extractTaskContent(text)).toBe('Fix bug');
  });

  it('should remove all metadata', () => {
    const text = 'Fix bug @nick !!! #backend (2026-01-20) [todoist:123456]';
    expect(extractTaskContent(text)).toBe('Fix bug');
  });

  it('should handle multiple spaces', () => {
    const text = 'Fix   bug   @nick   !!!   #backend';
    expect(extractTaskContent(text)).toBe('Fix bug');
  });
});

describe('formatTaskContent', () => {
  it('should format content with assignee', () => {
    const result = formatTaskContent('Fix bug', { assignee: 'nick' });
    expect(result).toBe('Fix bug @nick');
  });

  it('should format content with urgent priority', () => {
    const result = formatTaskContent('Fix bug', { priority: 'urgent' });
    expect(result).toBe('Fix bug !!!');
  });

  it('should format content with high priority', () => {
    const result = formatTaskContent('Fix bug', { priority: 'high' });
    expect(result).toBe('Fix bug !!');
  });

  it('should format content with normal priority', () => {
    const result = formatTaskContent('Fix bug', { priority: 'normal' });
    expect(result).toBe('Fix bug !');
  });

  it('should format content with tags', () => {
    const result = formatTaskContent('Fix bug', {
      tags: ['backend', 'urgent'],
    });
    expect(result).toBe('Fix bug #backend #urgent');
  });

  it('should format content with due date', () => {
    const result = formatTaskContent('Fix bug', {
      due: new Date('2026-01-20T00:00:00.000Z'),
    });
    expect(result).toBe('Fix bug (2026-01-20)');
  });

  it('should format content with Todoist ID', () => {
    const result = formatTaskContent('Fix bug', { todoistId: '123456' });
    expect(result).toBe('Fix bug [todoist:123456]');
  });

  it('should format content with all metadata', () => {
    const result = formatTaskContent('Fix bug', {
      assignee: 'nick',
      priority: 'urgent',
      tags: ['backend'],
      due: new Date('2026-01-20T00:00:00.000Z'),
      todoistId: '123456',
    });
    expect(result).toBe(
      'Fix bug @nick !!! #backend (2026-01-20) [todoist:123456]',
    );
  });
});

describe('md2doToTodoist', () => {
  it('should convert md2do task to Todoist params', () => {
    const task: Task = {
      id: 'test-id',
      text: 'Fix bug @nick !!! #backend (2026-01-20)',
      completed: false,
      file: 'test.md',
      line: 1,
      tags: ['backend'],
      assignee: 'nick',
      priority: 'urgent',
      dueDate: new Date('2026-01-20T00:00:00.000Z'),
    };

    const params = md2doToTodoist(task);

    expect(params).toEqual({
      content: 'Fix bug',
      priority: 4,
      labels: ['backend'],
      due_date: '2026-01-20',
    });
  });

  it('should include project ID if provided', () => {
    const task: Task = {
      id: 'test-id',
      text: 'Fix bug',
      completed: false,
      file: 'test.md',
      line: 1,
      tags: [],
    };

    const params = md2doToTodoist(task, 'project-123');

    expect(params.project_id).toBe('project-123');
  });

  it('should handle task without optional fields', () => {
    const task: Task = {
      id: 'test-id',
      text: 'Fix bug',
      completed: false,
      file: 'test.md',
      line: 1,
      tags: [],
    };

    const params = md2doToTodoist(task);

    expect(params).toEqual({
      content: 'Fix bug',
      priority: 1,
    });
  });
});

describe('todoistToMd2do', () => {
  it('should convert Todoist task to md2do update', () => {
    const todoistTask: TodoistTask = {
      id: '123456',
      order: 1,
      content: 'Fix bug',
      description: '',
      priority: 4,
      labels: ['backend'],
      due: { date: '2026-01-20', isRecurring: false, string: '2026-01-20' },
      isCompleted: false,
      createdAt: '2026-01-18T10:00:00Z',
      creatorId: 'user-id',
      projectId: 'project-id',
      commentCount: 0,
      url: 'https://todoist.com/app/task/123456',
    };

    const update = todoistToMd2do(todoistTask, 'nick');

    expect(update).toEqual({
      text: 'Fix bug @nick !!! #backend (2026-01-20) [todoist:123456]',
      completed: false,
      priority: 'urgent',
      tags: ['backend'],
      due: new Date('2026-01-20T00:00:00.000Z'),
      todoistId: '123456',
    });
  });

  it('should handle completed task', () => {
    const todoistTask: TodoistTask = {
      id: '123456',
      order: 1,
      content: 'Fix bug',
      description: '',
      priority: 1,
      labels: [],
      isCompleted: true,
      createdAt: '2026-01-18T10:00:00Z',
      creatorId: 'user-id',
      projectId: 'project-id',
      commentCount: 0,
      url: 'https://todoist.com/app/task/123456',
    };

    const update = todoistToMd2do(todoistTask);

    expect(update.completed).toBe(true);
    expect(update.text).toBe('Fix bug [todoist:123456]');
  });

  it('should handle task without optional fields', () => {
    const todoistTask: TodoistTask = {
      id: '123456',
      order: 1,
      content: 'Fix bug',
      description: '',
      priority: 1,
      labels: [],
      isCompleted: false,
      createdAt: '2026-01-18T10:00:00Z',
      creatorId: 'user-id',
      projectId: 'project-id',
      commentCount: 0,
      url: 'https://todoist.com/app/task/123456',
    };

    const update = todoistToMd2do(todoistTask);

    expect(update).toEqual({
      text: 'Fix bug [todoist:123456]',
      completed: false,
      priority: 'low',
      todoistId: '123456',
    });
  });
});
