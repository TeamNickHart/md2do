import { describe, it, expect, vi } from 'vitest';
import { pushDocument } from '../src/push.js';
import type { TodoistClient } from '../src/client.js';
import type { DocumentTree } from '@md2do/core';
import type { Project, Section, Task } from '@doist/todoist-api-typescript';

function makeProject(id: string, name: string): Project {
  return {
    id,
    name,
    isInboxProject: false,
    isTeamInbox: false,
    isFavorite: false,
    isShared: false,
    color: 'blue',
    commentCount: 0,
    order: 1,
    url: '',
  };
}

function makeSection(id: string, name: string): Section {
  return { id, name, projectId: 'proj-1', order: 1 };
}

function makeTask(id: string, content: string): Task {
  return {
    id,
    content,
    description: '',
    priority: 1,
    labels: [],
    isCompleted: false,
    createdAt: '',
    creatorId: '',
    projectId: 'proj-1',
    commentCount: 0,
    url: '',
    order: 1,
  };
}

function makeClient(): TodoistClient {
  return {
    addProject: vi.fn().mockResolvedValue(makeProject('proj-1', 'My Project')),
    addSection: vi
      .fn()
      .mockResolvedValueOnce(makeSection('sec-1', 'Backend'))
      .mockResolvedValueOnce(makeSection('sec-2', 'Frontend')),
    createTask: vi.fn().mockResolvedValue(makeTask('task-1', 'do thing')),
    getTasks: vi.fn(),
    getTask: vi.fn(),
    updateTask: vi.fn(),
    completeTask: vi.fn(),
    reopenTask: vi.fn(),
    deleteTask: vi.fn(),
    getProjects: vi.fn(),
    getProject: vi.fn(),
    getSections: vi.fn(),
    findProjectByName: vi.fn(),
    getLabels: vi.fn(),
    ensureLabel: vi.fn(),
    test: vi.fn(),
  } as unknown as TodoistClient;
}

function makeTree(overrides: Partial<DocumentTree> = {}): DocumentTree {
  return {
    file: 'plan.md',
    projectName: 'My Project',
    projectHeadingLine: 1,
    rootTasks: [],
    sections: [],
    ...overrides,
  };
}

describe('pushDocument', () => {
  it('creates a project with the document name', async () => {
    const client = makeClient();
    const tree = makeTree();

    await pushDocument(client, tree);

    expect(vi.mocked(client.addProject)).toHaveBeenCalledWith({
      name: 'My Project',
    });
  });

  it('uses file path as project name when no H1', async () => {
    const client = makeClient();
    const tree = makeTree({ projectName: undefined, file: 'plan.md' });

    await pushDocument(client, tree);

    expect(vi.mocked(client.addProject)).toHaveBeenCalledWith({
      name: 'plan.md',
    });
  });

  it('creates sections for each document section', async () => {
    const client = makeClient();
    const tree = makeTree({
      sections: [
        { name: 'Backend', headingLine: 3, tasks: [] },
        { name: 'Frontend', headingLine: 6, tasks: [] },
      ],
    });

    await pushDocument(client, tree);

    expect(vi.mocked(client.addSection)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(client.addSection)).toHaveBeenCalledWith({
      name: 'Backend',
      projectId: 'proj-1',
      order: 1,
    });
    expect(vi.mocked(client.addSection)).toHaveBeenCalledWith({
      name: 'Frontend',
      projectId: 'proj-1',
      order: 2,
    });
  });

  it('creates tasks under the correct section', async () => {
    const client = makeClient();
    const tree = makeTree({
      sections: [
        {
          name: 'Backend',
          headingLine: 3,
          tasks: [
            {
              content: 'fix bug',
              rawLine: '- [ ] fix bug',
              line: 4,
              completed: false,
              tags: [],
            },
          ],
        },
      ],
    });

    await pushDocument(client, tree);

    expect(vi.mocked(client.createTask)).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'fix bug',
        sectionId: 'sec-1',
        projectId: 'proj-1',
      }),
    );
  });

  it('creates root tasks without a section', async () => {
    const client = makeClient();
    const tree = makeTree({
      rootTasks: [
        {
          content: 'root task',
          rawLine: '- [ ] root task',
          line: 2,
          completed: false,
          tags: [],
        },
      ],
    });

    await pushDocument(client, tree);

    const calls = vi.mocked(client.createTask).mock.calls;
    const firstCall = calls[0] as [Record<string, unknown>];
    expect(firstCall[0].sectionId).toBeUndefined();
    expect(firstCall[0].content).toBe('root task');
  });

  it('skips completed tasks', async () => {
    const client = makeClient();
    const tree = makeTree({
      rootTasks: [
        {
          content: 'done task',
          rawLine: '- [x] done task',
          line: 2,
          completed: true,
          tags: [],
        },
      ],
      sections: [
        {
          name: 'Work',
          headingLine: 4,
          tasks: [
            {
              content: 'also done',
              rawLine: '- [x] also done',
              line: 5,
              completed: true,
              tags: [],
            },
          ],
        },
      ],
    });

    await pushDocument(client, tree);

    expect(vi.mocked(client.createTask)).not.toHaveBeenCalled();
  });

  it('returns correct counts', async () => {
    const client = makeClient();
    const tree = makeTree({
      rootTasks: [
        {
          content: 'root task',
          rawLine: '- [ ] root task',
          line: 2,
          completed: false,
          tags: [],
        },
      ],
      sections: [
        {
          name: 'Backend',
          headingLine: 4,
          tasks: [
            {
              content: 'sec task',
              rawLine: '- [ ] sec task',
              line: 5,
              completed: false,
              tags: [],
            },
          ],
        },
      ],
    });

    const result = await pushDocument(client, tree);

    expect(result.taskCount).toBe(2);
    expect(result.sectionCount).toBe(1);
    expect(result.projectId).toBe('proj-1');
    expect(result.projectName).toBe('My Project');
  });

  it('maps section heading lines to section IDs in result', async () => {
    const client = makeClient();
    const tree = makeTree({
      sections: [
        { name: 'Backend', headingLine: 3, tasks: [] },
        { name: 'Frontend', headingLine: 6, tasks: [] },
      ],
    });

    const result = await pushDocument(client, tree);

    expect(result.sectionIds.get(3)).toBe('sec-1');
    expect(result.sectionIds.get(6)).toBe('sec-2');
  });

  it('throws if document already has a Todoist project ID', async () => {
    const client = makeClient();
    const tree = makeTree({ projectTodoistId: '99999' });

    await expect(pushDocument(client, tree)).rejects.toThrow(
      'already has a Todoist project ID',
    );
    expect(vi.mocked(client.addProject)).not.toHaveBeenCalled();
  });

  it('maps task priority and tags', async () => {
    const client = makeClient();
    const tree = makeTree({
      rootTasks: [
        {
          content: 'urgent task',
          rawLine: '- [ ] urgent task !!! #backend',
          line: 2,
          completed: false,
          priority: 'urgent',
          tags: ['backend'],
        },
      ],
    });

    await pushDocument(client, tree);

    expect(vi.mocked(client.createTask)).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 4, labels: ['backend'] }),
    );
  });

  it('maps task due date', async () => {
    const client = makeClient();
    const tree = makeTree({
      rootTasks: [
        {
          content: 'due task',
          rawLine: '- [ ] due task #due/2026-08-01',
          line: 2,
          completed: false,
          tags: [],
          dueDate: new Date('2026-08-01T00:00:00.000Z'),
        },
      ],
    });

    await pushDocument(client, tree);

    expect(vi.mocked(client.createTask)).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: '2026-08-01' }),
    );
  });
});
