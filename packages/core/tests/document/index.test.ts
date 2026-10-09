import { describe, it, expect } from 'vitest';
import { parseDocument } from '../../src/document/index.js';

describe('parseDocument', () => {
  it('should parse a file with H1 project, sections, and tasks', () => {
    const content = `# My Project
- [ ] root item 1
- [ ] root item 2

## Backend Tasks
- [ ] fix API endpoint
- [ ] add auth middleware

## Frontend
- [ ] update dashboard
`;
    const tree = parseDocument('test.md', content);

    expect(tree.file).toBe('test.md');
    expect(tree.projectName).toBe('My Project');
    expect(tree.projectHeadingLine).toBe(1);
    expect(tree.projectTodoistId).toBeUndefined();
    expect(tree.rootTasks).toHaveLength(2);
    expect(tree.rootTasks[0]!.content).toBe('root item 1');
    expect(tree.rootTasks[1]!.content).toBe('root item 2');
    expect(tree.sections).toHaveLength(2);
    expect(tree.sections[0]!.name).toBe('Backend Tasks');
    expect(tree.sections[0]!.tasks).toHaveLength(2);
    expect(tree.sections[0]!.tasks[0]!.content).toBe('fix API endpoint');
    expect(tree.sections[1]!.name).toBe('Frontend');
    expect(tree.sections[1]!.tasks).toHaveLength(1);
    expect(tree.sections[1]!.tasks[0]!.content).toBe('update dashboard');
  });

  it('should parse tasks before first H2 as root tasks', () => {
    const content = `- [ ] orphan task 1
- [ ] orphan task 2

## Section A
- [ ] section task
`;
    const tree = parseDocument('test.md', content);

    expect(tree.projectName).toBeUndefined();
    expect(tree.rootTasks).toHaveLength(2);
    expect(tree.sections).toHaveLength(1);
    expect(tree.sections[0]!.tasks).toHaveLength(1);
  });

  it('should parse file with no H1 (just tasks)', () => {
    const content = `- [ ] task one
- [x] task two
- [ ] task three
`;
    const tree = parseDocument('test.md', content);

    expect(tree.projectName).toBeUndefined();
    expect(tree.rootTasks).toHaveLength(3);
    expect(tree.rootTasks[1]!.completed).toBe(true);
    expect(tree.sections).toHaveLength(0);
  });

  it('should parse existing {todoist:NNN} on headings', () => {
    const content = `# My Project {todoist:12345}

## Backend {todoist:67890}
- [ ] task
`;
    const tree = parseDocument('test.md', content);

    expect(tree.projectName).toBe('My Project');
    expect(tree.projectTodoistId).toBe('12345');
    expect(tree.sections[0]!.name).toBe('Backend');
    expect(tree.sections[0]!.todoistId).toBe('67890');
  });

  it('should handle empty sections', () => {
    const content = `# Project

## Empty Section

## Section With Tasks
- [ ] a task
`;
    const tree = parseDocument('test.md', content);

    expect(tree.sections).toHaveLength(2);
    expect(tree.sections[0]!.name).toBe('Empty Section');
    expect(tree.sections[0]!.tasks).toHaveLength(0);
    expect(tree.sections[1]!.tasks).toHaveLength(1);
  });

  it('should parse task metadata', () => {
    const content = `# Project
- [ ] @nick fix bug !! #backend #due/2026-01-25
`;
    const tree = parseDocument('test.md', content);

    expect(tree.rootTasks).toHaveLength(1);
    const task = tree.rootTasks[0]!;
    expect(task.assignee).toBe('nick');
    expect(task.priority).toBe('high');
    expect(task.tags).toContain('backend');
    expect(task.dueDate).toBeDefined();
  });

  it('should preserve rawLine for each task', () => {
    const content = `- [ ] my task !! #tag
`;
    const tree = parseDocument('test.md', content);

    expect(tree.rootTasks[0]!.rawLine).toBe('- [ ] my task !! #tag');
    expect(tree.rootTasks[0]!.line).toBe(1);
  });

  it('should handle empty content', () => {
    const tree = parseDocument('empty.md', '');

    expect(tree.projectName).toBeUndefined();
    expect(tree.rootTasks).toHaveLength(0);
    expect(tree.sections).toHaveLength(0);
  });

  it('should promote H3+ headings to sections', () => {
    const content =
      '# Project\n\n## Section One\n- [ ] task a\n\n### Sub Section\n- [ ] task b\n';
    const tree = parseDocument('test.md', content);

    expect(tree.sections).toHaveLength(2);
    expect(tree.sections[0]!.name).toBe('Section One');
    expect(tree.sections[1]!.name).toBe('Sub Section');
    expect(tree.sections[1]!.tasks).toHaveLength(1);
  });

  it('should treat root tasks after H1 but before first H2 as root', () => {
    const content = `# My Project
- [ ] root task

## Section
- [ ] section task
`;
    const tree = parseDocument('test.md', content);

    expect(tree.rootTasks).toHaveLength(1);
    expect(tree.rootTasks[0]!.content).toBe('root task');
    expect(tree.sections[0]!.tasks).toHaveLength(1);
  });
});
