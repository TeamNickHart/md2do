import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoistProvider } from '../src/provider.js';
import type { Task as TodoistTask } from '@doist/todoist-api-typescript';

function makeTodoistTask(overrides: Partial<TodoistTask> = {}): TodoistTask {
  return {
    id: 'task-1',
    content: 'Test task',
    description: '',
    projectId: 'proj-1',
    sectionId: null,
    parentId: null,
    order: 1,
    priority: 1,
    labels: [],
    due: null,
    url: 'https://todoist.com/task/1',
    commentCount: 0,
    isCompleted: false,
    createdAt: '2026-08-01T00:00:00Z',
    creatorId: 'user-1',
    assigneeId: null,
    assignerId: null,
    duration: null,
    ...overrides,
  };
}

describe('TodoistProvider', () => {
  const getTasks = vi.fn().mockResolvedValue([]);
  const completeTask = vi.fn().mockResolvedValue(true);
  const reopenTask = vi.fn().mockResolvedValue(true);

  const mockClient = {
    getTasks,
    getTask: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    completeTask,
    reopenTask,
    deleteTask: vi.fn(),
    getProjects: vi.fn(),
    getProject: vi.fn(),
    findProjectByName: vi.fn(),
    getLabels: vi.fn(),
    ensureLabel: vi.fn(),
    test: vi.fn(),
  };

  let provider: TodoistProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    getTasks.mockResolvedValue([]);
    provider = new TodoistProvider(mockClient as any);
  });

  it('has slug "todoist" and name "Todoist"', () => {
    expect(provider.slug).toBe('todoist');
    expect(provider.name).toBe('Todoist');
  });

  describe('fetchTasks', () => {
    it('returns empty array when no tasks', async () => {
      const tasks = await provider.fetchTasks();
      expect(tasks).toEqual([]);
    });

    it('maps basic task fields', async () => {
      getTasks.mockResolvedValue([
        makeTodoistTask({ id: 'abc', content: 'Do the thing' }),
      ]);

      const tasks = await provider.fetchTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].externalId).toBe('abc');
      expect(tasks[0].text).toBe('Do the thing');
      expect(tasks[0].completed).toBe(false);
    });

    it('maps completed status', async () => {
      getTasks.mockResolvedValue([makeTodoistTask({ isCompleted: true })]);
      const [task] = await provider.fetchTasks();
      expect(task.completed).toBe(true);
    });

    it('maps priority 4 → urgent', async () => {
      getTasks.mockResolvedValue([makeTodoistTask({ priority: 4 })]);
      const [task] = await provider.fetchTasks();
      expect(task.priority).toBe('urgent');
    });

    it('maps priority 3 → high', async () => {
      getTasks.mockResolvedValue([makeTodoistTask({ priority: 3 })]);
      const [task] = await provider.fetchTasks();
      expect(task.priority).toBe('high');
    });

    it('maps priority 2 → normal', async () => {
      getTasks.mockResolvedValue([makeTodoistTask({ priority: 2 })]);
      const [task] = await provider.fetchTasks();
      expect(task.priority).toBe('normal');
    });

    it('maps priority 1 → low', async () => {
      getTasks.mockResolvedValue([makeTodoistTask({ priority: 1 })]);
      const [task] = await provider.fetchTasks();
      expect(task.priority).toBe('low');
    });

    it('maps dueDate when present', async () => {
      getTasks.mockResolvedValue([
        makeTodoistTask({
          due: {
            date: '2026-08-15',
            isRecurring: false,
            string: 'Aug 15',
            timezone: null,
            datetime: null,
          },
        }),
      ]);
      const [task] = await provider.fetchTasks();
      expect(task.dueDate).toBe('2026-08-15');
    });

    it('omits dueDate when not present', async () => {
      getTasks.mockResolvedValue([makeTodoistTask({ due: null })]);
      const [task] = await provider.fetchTasks();
      expect(task.dueDate).toBeUndefined();
    });

    it('maps labels as tags', async () => {
      getTasks.mockResolvedValue([
        makeTodoistTask({ labels: ['eng', 'backend'] }),
      ]);
      const [task] = await provider.fetchTasks();
      expect(task.tags).toEqual(['eng', 'backend']);
    });

    it('omits tags when labels is empty', async () => {
      getTasks.mockResolvedValue([makeTodoistTask({ labels: [] })]);
      const [task] = await provider.fetchTasks();
      expect(task.tags).toBeUndefined();
    });

    it('passes options.filter to client.getTasks', async () => {
      await provider.fetchTasks({ filter: { projectId: 'proj-42' } });
      expect(getTasks).toHaveBeenCalledWith({ projectId: 'proj-42' });
    });

    it('maps multiple tasks', async () => {
      getTasks.mockResolvedValue([
        makeTodoistTask({ id: '1', content: 'First' }),
        makeTodoistTask({ id: '2', content: 'Second' }),
      ]);
      const tasks = await provider.fetchTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].externalId).toBe('1');
      expect(tasks[1].externalId).toBe('2');
    });
  });

  describe('completeTask', () => {
    it('delegates to client.completeTask', async () => {
      await provider.completeTask('task-99');
      expect(completeTask).toHaveBeenCalledWith('task-99');
    });
  });

  describe('reopenTask', () => {
    it('delegates to client.reopenTask', async () => {
      await provider.reopenTask('task-99');
      expect(reopenTask).toHaveBeenCalledWith('task-99');
    });
  });
});
