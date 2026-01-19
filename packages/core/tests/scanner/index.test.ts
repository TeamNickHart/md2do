import { describe, it, expect } from 'vitest';
import {
  MarkdownScanner,
  extractProjectFromPath,
  extractPersonFromFilename,
} from '../../src/scanner/index.js';

describe('extractProjectFromPath', () => {
  it('should extract project from projects/ directory', () => {
    expect(extractProjectFromPath('projects/acme-app/notes.md')).toBe(
      'acme-app',
    );
  });

  it('should extract project from nested path', () => {
    expect(extractProjectFromPath('projects/widget-co/sprint-1/tasks.md')).toBe(
      'widget-co',
    );
  });

  it('should return undefined for non-project paths', () => {
    expect(extractProjectFromPath('1-1s/jane.md')).toBeUndefined();
    expect(extractProjectFromPath('backlog.md')).toBeUndefined();
    expect(extractProjectFromPath('notes/general.md')).toBeUndefined();
  });

  it('should handle paths with leading slash', () => {
    expect(extractProjectFromPath('/projects/acme-app/notes.md')).toBe(
      'acme-app',
    );
  });

  it('should handle relative paths', () => {
    expect(extractProjectFromPath('./projects/acme-app/notes.md')).toBe(
      'acme-app',
    );
  });
});

describe('extractPersonFromFilename', () => {
  it('should extract person from 1-1s/ directory', () => {
    expect(extractPersonFromFilename('1-1s/jane-doe.md')).toBe('jane-doe');
  });

  it('should extract person with simple name', () => {
    expect(extractPersonFromFilename('1-1s/alice.md')).toBe('alice');
  });

  it('should return undefined for non-1-1 paths', () => {
    expect(extractPersonFromFilename('projects/acme/notes.md')).toBeUndefined();
    expect(extractPersonFromFilename('backlog.md')).toBeUndefined();
  });

  it('should handle paths with leading slash', () => {
    expect(extractPersonFromFilename('/1-1s/bob.md')).toBe('bob');
  });

  it('should only match .md files', () => {
    expect(extractPersonFromFilename('1-1s/alice.txt')).toBeUndefined();
  });
});

describe('MarkdownScanner', () => {
  const scanner = new MarkdownScanner();

  describe('Basic task scanning', () => {
    it('should scan simple unchecked task', () => {
      const content = '- [ ] Simple task';
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]?.text).toBe('Simple task');
      expect(result.tasks[0]?.completed).toBe(false);
      expect(result.warnings).toHaveLength(0);
    });

    it('should scan multiple tasks', () => {
      const content = `
- [ ] First task
- [x] Second task
- [ ] Third task
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0]?.text).toBe('First task');
      expect(result.tasks[0]?.completed).toBe(false);
      expect(result.tasks[1]?.text).toBe('Second task');
      expect(result.tasks[1]?.completed).toBe(true);
      expect(result.tasks[2]?.text).toBe('Third task');
      expect(result.tasks[2]?.completed).toBe(false);
    });

    it('should skip non-task lines', () => {
      const content = `
# Heading

Regular text

- Regular list item
- [ ] Actual task
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]?.text).toBe('Actual task');
    });

    it('should handle empty content', () => {
      const result = scanner.scanFile('test.md', '');
      expect(result.tasks).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle content with no tasks', () => {
      const content = `
# Notes

Just some regular text here.
No tasks at all.
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(0);
    });
  });

  describe('Project context extraction', () => {
    it('should extract project from path', () => {
      const content = '- [ ] Project task';
      const result = scanner.scanFile('projects/acme-app/sprint-1.md', content);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]?.project).toBe('acme-app');
    });

    it('should apply project to all tasks in file', () => {
      const content = `
- [ ] First task
- [ ] Second task
- [ ] Third task
`.trim();
      const result = scanner.scanFile('projects/widget-co/backlog.md', content);

      expect(result.tasks).toHaveLength(3);
      result.tasks.forEach((task) => {
        expect(task.project).toBe('widget-co');
      });
    });

    it('should not set project for non-project files', () => {
      const content = '- [ ] General task';
      const result = scanner.scanFile('notes.md', content);

      expect(result.tasks[0]?.project).toBeUndefined();
    });
  });

  describe('Person context extraction', () => {
    it('should extract person from 1-1 file path', () => {
      const content = '- [ ] Discuss goals';
      const result = scanner.scanFile('1-1s/jane-doe.md', content);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]?.person).toBe('jane-doe');
    });

    it('should apply person to all tasks in file', () => {
      const content = `
- [ ] Q1 planning
- [ ] Promotion discussion
- [ ] Feedback session
`.trim();
      const result = scanner.scanFile('1-1s/alice.md', content);

      expect(result.tasks).toHaveLength(3);
      result.tasks.forEach((task) => {
        expect(task.person).toBe('alice');
      });
    });

    it('should not set person for non-1-1 files', () => {
      const content = '- [ ] General task';
      const result = scanner.scanFile('backlog.md', content);

      expect(result.tasks[0]?.person).toBeUndefined();
    });
  });

  describe('Heading date context', () => {
    it('should extract date from heading and apply to subsequent tasks', () => {
      const content = `
## Meeting 1/13/26

- [ ] First task
- [ ] Second task
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0]?.contextDate).toBeInstanceOf(Date);
      expect(result.tasks[0]?.contextDate?.getMonth()).toBe(0); // January
      expect(result.tasks[0]?.contextDate?.getDate()).toBe(13);
      expect(result.tasks[1]?.contextDate).toEqual(
        result.tasks[0]?.contextDate,
      );
    });

    it('should update context when encountering new heading', () => {
      const content = `
## Meeting 1/13/26

- [ ] Task from first meeting

## Meeting 1/20/26

- [ ] Task from second meeting
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0]?.contextDate?.getDate()).toBe(13);
      expect(result.tasks[1]?.contextDate?.getDate()).toBe(20);
    });

    it('should preserve heading text in context', () => {
      const content = `
## Sprint Planning 1/13/26

- [ ] Task
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks[0]?.contextHeading).toBe(
        '## Sprint Planning 1/13/26',
      );
    });

    it('should handle ISO date format in headings', () => {
      const content = `
## 2026-01-13 Daily Standup

- [ ] Task
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks[0]?.contextDate).toBeInstanceOf(Date);
      expect(result.tasks[0]?.contextDate?.getDate()).toBe(13);
    });

    it('should handle natural date format in headings', () => {
      const content = `
## January 13, 2026 - Team Sync

- [ ] Task
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks[0]?.contextDate).toBeInstanceOf(Date);
      expect(result.tasks[0]?.contextDate?.getMonth()).toBe(0);
      expect(result.tasks[0]?.contextDate?.getDate()).toBe(13);
    });
  });

  describe('Relative dates with heading context', () => {
    it('should resolve relative dates using heading date', () => {
      const content = `
## Meeting 1/13/26

- [ ] Task [due: tomorrow]
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks[0]?.dueDate).toBeInstanceOf(Date);
      expect(result.tasks[0]?.dueDate?.getDate()).toBe(14); // Tomorrow from 1/13
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn on relative date without heading context', () => {
      const content = '- [ ] Task [due: tomorrow]';
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks[0]?.dueDate).toBeUndefined();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain(
        'Relative due date without context',
      );
    });

    it('should resolve multiple relative dates in same section', () => {
      const content = `
## Planning 1/13/26

- [ ] Task 1 [due: today]
- [ ] Task 2 [due: tomorrow]
- [ ] Task 3 [due: next week]
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0]?.dueDate?.getDate()).toBe(13);
      expect(result.tasks[1]?.dueDate?.getDate()).toBe(14);
      expect(result.tasks[2]?.dueDate).toBeInstanceOf(Date); // Next Monday
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Line number tracking', () => {
    it('should track correct line numbers', () => {
      const content = `
Line 1
Line 2
- [ ] Task on line 3
Line 4
- [ ] Task on line 5
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0]?.line).toBe(3);
      expect(result.tasks[1]?.line).toBe(5);
    });

    it('should track file path', () => {
      const content = '- [ ] Task';
      const filePath = 'projects/acme-app/notes.md';
      const result = scanner.scanFile(filePath, content);

      expect(result.tasks[0]?.file).toBe(filePath);
    });
  });

  describe('Realistic examples', () => {
    it('should scan project sprint file', () => {
      const content = `
# Sprint 1 Planning

## 1/13/26 - Sprint Start

- [ ] @alice Setup development environment !! #devops
- [ ] @bob Review architecture docs #backend
- [x] Create project repository [completed: 2026-01-13]

## 1/20/26 - Mid-Sprint Check-in

- [ ] @alice Deploy staging environment [due: 1/22/26] #devops
- [ ] Integration tests [due: next week] !!
`.trim();
      const result = scanner.scanFile('projects/acme-app/sprint-1.md', content);

      expect(result.tasks).toHaveLength(5);

      // First task
      expect(result.tasks[0]?.assignee).toBe('alice');
      expect(result.tasks[0]?.priority).toBe('high');
      expect(result.tasks[0]?.tags).toContain('devops');
      expect(result.tasks[0]?.project).toBe('acme-app');
      expect(result.tasks[0]?.contextDate?.getDate()).toBe(13);

      // Completed task
      expect(result.tasks[2]?.completed).toBe(true);
      expect(result.tasks[2]?.completedDate).toBeInstanceOf(Date);

      // Task with absolute due date
      expect(result.tasks[3]?.dueDate?.getDate()).toBe(22);
      expect(result.tasks[3]?.contextDate?.getDate()).toBe(20);

      // Task with relative due date resolved from heading
      expect(result.tasks[4]?.dueDate).toBeInstanceOf(Date);
      expect(result.warnings).toHaveLength(0);
    });

    it('should scan 1-1 meeting notes', () => {
      const content = `
# 1-1 with Jane

## January 13, 2026

- [ ] Discuss Q1 goals [due: 1/20/26]
- [ ] Review performance feedback
- [x] Schedule team offsite [completed: 2026-01-13]

## January 20, 2026

- [ ] Follow up on promotion discussion [due: next week]
`.trim();
      const result = scanner.scanFile('1-1s/jane-doe.md', content);

      expect(result.tasks).toHaveLength(4);

      // All tasks should have person context
      result.tasks.forEach((task) => {
        expect(task.person).toBe('jane-doe');
      });

      // Check due dates
      expect(result.tasks[0]?.dueDate?.getDate()).toBe(20);
      expect(result.tasks[3]?.dueDate).toBeInstanceOf(Date);
      expect(result.warnings).toHaveLength(0);
    });

    it('should scan mixed content with metadata', () => {
      const content = `
# Backlog

## High Priority

- [ ] @alice Fix critical bug !!! #backend #urgent [due: 2026-01-18]
- [ ] Security audit !! #security [todoist:123456]

## Medium Priority

- [ ] Update documentation #docs
- [x] Code review [completed: 2026-01-15] [todoist:789012]
`.trim();
      const result = scanner.scanFile('backlog.md', content);

      expect(result.tasks).toHaveLength(4);

      // Urgent task
      expect(result.tasks[0]?.priority).toBe('urgent');
      expect(result.tasks[0]?.tags).toEqual(['backend', 'urgent']);

      // Task with Todoist ID
      expect(result.tasks[1]?.todoistId).toBe('123456');
      expect(result.tasks[3]?.todoistId).toBe('789012');
    });
  });

  describe('scanFiles (multiple files)', () => {
    it('should scan multiple files', () => {
      const files = [
        {
          path: 'projects/acme-app/notes.md',
          content: '- [ ] Task from acme',
        },
        {
          path: 'projects/widget-co/notes.md',
          content: '- [ ] Task from widget',
        },
      ];

      const result = scanner.scanFiles(files);

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0]?.project).toBe('acme-app');
      expect(result.tasks[1]?.project).toBe('widget-co');
    });

    it('should combine warnings from multiple files', () => {
      const files = [
        {
          path: 'file1.md',
          content: '- [ ] Task [due: tomorrow]',
        },
        {
          path: 'file2.md',
          content: '- [ ] Task [due: next week]',
        },
      ];

      const result = scanner.scanFiles(files);

      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]?.file).toBe('file1.md');
      expect(result.warnings[1]?.file).toBe('file2.md');
    });

    it('should handle empty file array', () => {
      const result = scanner.scanFiles([]);

      expect(result.tasks).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should scan diverse file types', () => {
      const files = [
        {
          path: 'projects/acme-app/sprint.md',
          content: `
## 1/13/26
- [ ] Project task [due: tomorrow]
`.trim(),
        },
        {
          path: '1-1s/alice.md',
          content: '- [ ] 1-1 task',
        },
        {
          path: 'general.md',
          content: '- [ ] General task',
        },
      ];

      const result = scanner.scanFiles(files);

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0]?.project).toBe('acme-app');
      expect(result.tasks[0]?.dueDate).toBeInstanceOf(Date);
      expect(result.tasks[1]?.person).toBe('alice');
      expect(result.tasks[2]?.project).toBeUndefined();
      expect(result.tasks[2]?.person).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle tasks with indentation', () => {
      const content = `
- [ ] Level 1
  - [ ] Level 2
    - [ ] Level 3
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(3);
    });

    it('should handle empty lines between tasks', () => {
      const content = `
- [ ] Task 1

- [ ] Task 2


- [ ] Task 3
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(3);
    });

    it('should handle tasks with very long text', () => {
      const longText = 'Very long task text '.repeat(100);
      const content = `- [ ] ${longText}`;
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]?.text.length).toBeGreaterThan(1000);
    });

    it('should handle unicode in task text', () => {
      const content = '- [ ] Task with émojis 🚀 and ünïçödé';
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]?.text).toContain('émojis');
      expect(result.tasks[0]?.text).toContain('🚀');
    });

    it('should handle file with only headings', () => {
      const content = `
## Heading 1
### Heading 2
#### Heading 3
`.trim();
      const result = scanner.scanFile('test.md', content);

      expect(result.tasks).toHaveLength(0);
    });
  });
});
