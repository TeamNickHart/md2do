import { describe, it, expect } from 'vitest';
import {
  extractAssignee,
  extractPriority,
  extractTags,
  extractTodoistId,
  extractCompletedDate,
  extractDueDate,
  cleanTaskText,
  parseTask,
} from '../../src/parser/index.js';
import type { ParsingContext } from '../../src/types/index.js';

describe('extractAssignee', () => {
  it('should extract assignee from text', () => {
    expect(extractAssignee('@nick Review PR')).toBe('nick');
  });

  it('should extract assignee with hyphens', () => {
    expect(extractAssignee('@jane-doe Complete task')).toBe('jane-doe');
  });

  it('should extract first assignee if multiple', () => {
    expect(extractAssignee('@alice @bob Collaborate')).toBe('alice');
  });

  it('should return undefined if no assignee', () => {
    expect(extractAssignee('Task without assignee')).toBeUndefined();
  });

  it('should handle assignee at end of text', () => {
    expect(extractAssignee('Review and assign to @sarah')).toBe('sarah');
  });
});

describe('extractPriority', () => {
  it('should extract urgent priority', () => {
    expect(extractPriority('Critical fix !!!')).toBe('urgent');
  });

  it('should extract high priority', () => {
    expect(extractPriority('Important task !!')).toBe('high');
  });

  it('should extract normal priority', () => {
    expect(extractPriority('Regular task !')).toBe('normal');
  });

  it('should return undefined if no priority', () => {
    expect(extractPriority('Low priority task')).toBeUndefined();
  });

  it('should prioritize urgent over high', () => {
    // When checking urgency, code checks !!! first
    expect(extractPriority('Task !!!')).toBe('urgent');
  });

  it('should prioritize high over normal', () => {
    expect(extractPriority('Task !!')).toBe('high');
  });
});

describe('extractTags', () => {
  it('should extract single tag', () => {
    expect(extractTags('Task #backend')).toEqual(['backend']);
  });

  it('should extract multiple tags', () => {
    expect(extractTags('Task #backend #urgent #review')).toEqual([
      'backend',
      'urgent',
      'review',
    ]);
  });

  it('should extract tags with hyphens', () => {
    expect(extractTags('Task #code-review #high-priority')).toEqual([
      'code-review',
      'high-priority',
    ]);
  });

  it('should return empty array if no tags', () => {
    expect(extractTags('Task without tags')).toEqual([]);
  });

  it('should handle tags at different positions', () => {
    expect(extractTags('#frontend Update #ui component #react')).toEqual([
      'frontend',
      'ui',
      'react',
    ]);
  });
});

describe('extractTodoistId', () => {
  it('should extract numeric ID', () => {
    expect(extractTodoistId('Task [todoist:123456]')).toBe('123456');
  });

  it('should extract long ID', () => {
    expect(extractTodoistId('Task [todoist:7891234567]')).toBe('7891234567');
  });

  it('should handle whitespace', () => {
    expect(extractTodoistId('Task [todoist: 123456]')).toBe('123456');
  });

  it('should return undefined if no ID', () => {
    expect(extractTodoistId('Task without Todoist ID')).toBeUndefined();
  });
});

describe('extractCompletedDate', () => {
  it('should extract completion date', () => {
    const result = extractCompletedDate('[completed: 2026-01-18]');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(0);
    expect(result?.getDate()).toBe(18);
  });

  it('should handle case-insensitive', () => {
    const result = extractCompletedDate('[COMPLETED: 2026-01-18]');
    expect(result).toBeInstanceOf(Date);
  });

  it('should return undefined if no completion date', () => {
    expect(extractCompletedDate('Task without completion')).toBeUndefined();
  });

  it('should return undefined for invalid date', () => {
    expect(extractCompletedDate('[completed: invalid]')).toBeUndefined();
  });
});

describe('extractDueDate', () => {
  const baseDate = new Date('2026-01-18T12:00:00Z');
  const context: ParsingContext = { currentDate: baseDate };

  describe('Absolute dates', () => {
    it('should extract ISO format date', () => {
      const result = extractDueDate('[due: 2026-01-25]', {});
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date?.getFullYear()).toBe(2026);
      expect(result.date?.getMonth()).toBe(0);
      expect(result.date?.getDate()).toBe(25);
      expect(result.warning).toBeUndefined();
    });

    it('should extract short format date', () => {
      const result = extractDueDate('[due: 1/25/26]', {});
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date?.getFullYear()).toBe(2026);
      expect(result.warning).toBeUndefined();
    });

    it('should not parse M/D format without year', () => {
      // parseAbsoluteDate doesn't support M/D without year
      const result = extractDueDate('[due: 1/25]', {});
      expect(result.date).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });

  describe('Relative dates', () => {
    it('should extract "today" with context', () => {
      const result = extractDueDate('[due: today]', context);
      expect(result.date?.getTime()).toBe(baseDate.getTime());
      expect(result.warning).toBeUndefined();
    });

    it('should extract "tomorrow" with context', () => {
      const result = extractDueDate('[due: tomorrow]', context);
      expect(result.date?.getDate()).toBe(19);
      expect(result.warning).toBeUndefined();
    });

    it('should extract "next week" with context', () => {
      const result = extractDueDate('[due: next week]', context);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.warning).toBeUndefined();
    });

    it('should extract "next month" with context', () => {
      const result = extractDueDate('[due: next month]', context);
      expect(result.date?.getMonth()).toBe(1); // February
      expect(result.warning).toBeUndefined();
    });
  });

  describe('Relative dates without context', () => {
    it('should return warning for relative date without context', () => {
      const result = extractDueDate('[due: tomorrow]', {});
      expect(result.date).toBeUndefined();
      expect(result.warning).toBeDefined();
      expect(result.warning?.reason).toContain(
        'Relative due date without context',
      );
    });

    it('should handle "today" without context', () => {
      const result = extractDueDate('[due: today]', {});
      expect(result.date).toBeUndefined();
      expect(result.warning).toBeDefined();
    });
  });

  describe('No due date', () => {
    it('should return undefined for text without due date', () => {
      const result = extractDueDate('Task without due date', {});
      expect(result.date).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });
});

describe('cleanTaskText', () => {
  it('should remove assignee', () => {
    expect(cleanTaskText('@nick Review PR')).toBe('Review PR');
  });

  it('should remove due date', () => {
    expect(cleanTaskText('Task [due: 2026-01-25]')).toBe('Task');
  });

  it('should remove priority markers', () => {
    expect(cleanTaskText('Critical fix !!!')).toBe('Critical fix');
    expect(cleanTaskText('Important task !!')).toBe('Important task');
    expect(cleanTaskText('Regular task !')).toBe('Regular task');
  });

  it('should remove tags', () => {
    expect(cleanTaskText('Task #backend #urgent')).toBe('Task');
  });

  it('should remove Todoist ID', () => {
    expect(cleanTaskText('Task [todoist:123456]')).toBe('Task');
  });

  it('should remove completion date', () => {
    expect(cleanTaskText('Task [completed: 2026-01-18]')).toBe('Task');
  });

  it('should remove all metadata at once', () => {
    const text = '@nick Review PR !! #backend [due: 2026-01-25] [todoist:123]';
    expect(cleanTaskText(text)).toBe('Review PR');
  });

  it('should clean up extra whitespace', () => {
    expect(cleanTaskText('Task   with    spaces')).toBe('Task with spaces');
  });

  it('should preserve meaningful text', () => {
    expect(cleanTaskText('Implement authentication system')).toBe(
      'Implement authentication system',
    );
  });

  it('should handle short format dates', () => {
    expect(cleanTaskText('Task [due: 1/25/26]')).toBe('Task');
    expect(cleanTaskText('Task [due: 1/25]')).toBe('Task');
  });
});

describe('parseTask', () => {
  const file = 'test.md';

  describe('Task detection', () => {
    it('should parse unchecked task', () => {
      const result = parseTask('- [ ] Task text', 1, file, {});
      expect(result.task).not.toBeNull();
      expect(result.task?.completed).toBe(false);
      expect(result.task?.text).toBe('Task text');
    });

    it('should parse checked task with lowercase x', () => {
      const result = parseTask('- [x] Completed task', 1, file, {});
      expect(result.task).not.toBeNull();
      expect(result.task?.completed).toBe(true);
    });

    it('should parse checked task with uppercase X', () => {
      const result = parseTask('- [X] Completed task', 1, file, {});
      expect(result.task).not.toBeNull();
      expect(result.task?.completed).toBe(true);
    });

    it('should return null for non-task lines', () => {
      expect(parseTask('Regular text', 1, file, {}).task).toBeNull();
      expect(parseTask('## Heading', 1, file, {}).task).toBeNull();
      expect(parseTask('- Regular list item', 1, file, {}).task).toBeNull();
    });
  });

  describe('Metadata extraction', () => {
    it('should extract assignee', () => {
      const result = parseTask('- [ ] @nick Review PR', 1, file, {});
      expect(result.task?.assignee).toBe('nick');
      expect(result.task?.text).toBe('Review PR');
    });

    it('should extract priority', () => {
      const urgent = parseTask('- [ ] Critical fix !!!', 1, file, {});
      expect(urgent.task?.priority).toBe('urgent');

      const high = parseTask('- [ ] Important task !!', 1, file, {});
      expect(high.task?.priority).toBe('high');

      const normal = parseTask('- [ ] Regular task !', 1, file, {});
      expect(normal.task?.priority).toBe('normal');
    });

    it('should extract tags', () => {
      const result = parseTask('- [ ] Task #backend #urgent', 1, file, {});
      expect(result.task?.tags).toEqual(['backend', 'urgent']);
    });

    it('should extract due date', () => {
      const result = parseTask('- [ ] Task [due: 2026-01-25]', 1, file, {});
      expect(result.task?.dueDate).toBeInstanceOf(Date);
      expect(result.task?.dueDate?.getDate()).toBe(25);
    });

    it('should extract Todoist ID', () => {
      const result = parseTask('- [ ] Task [todoist:123456]', 1, file, {});
      expect(result.task?.todoistId).toBe('123456');
    });

    it('should extract completion date', () => {
      const result = parseTask(
        '- [x] Task [completed: 2026-01-18]',
        1,
        file,
        {},
      );
      expect(result.task?.completedDate).toBeInstanceOf(Date);
    });

    it('should extract all metadata at once', () => {
      const text =
        '- [ ] @nick Fix bug !! #backend #urgent [due: 2026-01-25] [todoist:123]';
      const result = parseTask(text, 1, file, {});

      expect(result.task?.assignee).toBe('nick');
      expect(result.task?.priority).toBe('high');
      expect(result.task?.tags).toEqual(['backend', 'urgent']);
      expect(result.task?.dueDate).toBeInstanceOf(Date);
      expect(result.task?.todoistId).toBe('123');
      expect(result.task?.text).toBe('Fix bug');
    });
  });

  describe('Context application', () => {
    it('should apply project context', () => {
      const context: ParsingContext = { project: 'acme-app' };
      const result = parseTask('- [ ] Task', 1, file, context);
      expect(result.task?.project).toBe('acme-app');
    });

    it('should apply person context', () => {
      const context: ParsingContext = { person: 'jane-doe' };
      const result = parseTask('- [ ] Task', 1, file, context);
      expect(result.task?.person).toBe('jane-doe');
    });

    it('should apply context date', () => {
      const contextDate = new Date('2026-01-13');
      const context: ParsingContext = { currentDate: contextDate };
      const result = parseTask('- [ ] Task', 1, file, context);
      expect(result.task?.contextDate).toBe(contextDate);
    });

    it('should apply context heading', () => {
      const context: ParsingContext = { currentHeading: '## Sprint 1' };
      const result = parseTask('- [ ] Task', 1, file, context);
      expect(result.task?.contextHeading).toBe('## Sprint 1');
    });

    it('should apply all context fields', () => {
      const contextDate = new Date('2026-01-13');
      const context: ParsingContext = {
        project: 'acme-app',
        person: 'jane-doe',
        currentDate: contextDate,
        currentHeading: '## Planning 1/13/26',
      };
      const result = parseTask('- [ ] Task', 1, file, context);

      expect(result.task?.project).toBe('acme-app');
      expect(result.task?.person).toBe('jane-doe');
      expect(result.task?.contextDate).toBe(contextDate);
      expect(result.task?.contextHeading).toBe('## Planning 1/13/26');
    });
  });

  describe('Relative dates with context', () => {
    it('should resolve relative dates with context', () => {
      const context: ParsingContext = {
        currentDate: new Date('2026-01-18T12:00:00Z'),
      };
      const result = parseTask('- [ ] Task [due: tomorrow]', 1, file, context);

      expect(result.task?.dueDate).toBeInstanceOf(Date);
      // Tomorrow from 2026-01-18 is 2026-01-19
      // But the actual date returned depends on timezone handling
      // Let's just verify it's defined and a day has been added
      if (context.currentDate) {
        const daysDiff = Math.round(
          (result.task!.dueDate!.getTime() - context.currentDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        expect(daysDiff).toBe(1);
      }
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn on relative dates without context', () => {
      const result = parseTask('- [ ] Task [due: tomorrow]', 1, file, {});

      expect(result.task?.dueDate).toBeUndefined();
      expect(result.warnings).toHaveLength(2); // Relative date + missing date warnings
      expect(result.warnings[0]?.reason).toContain(
        'Relative due date without context',
      );
      expect(result.warnings[0]?.file).toBe(file);
      expect(result.warnings[0]?.line).toBe(1);
    });
  });

  describe('Task ID generation', () => {
    it('should generate stable ID', () => {
      const result1 = parseTask('- [ ] Same task', 1, file, {});
      const result2 = parseTask('- [ ] Same task', 1, file, {});
      expect(result1.task?.id).toBe(result2.task?.id);
    });

    it('should generate different IDs for different lines', () => {
      const result1 = parseTask('- [ ] Task', 1, file, {});
      const result2 = parseTask('- [ ] Task', 2, file, {});
      expect(result1.task?.id).not.toBe(result2.task?.id);
    });

    it('should generate different IDs for different text', () => {
      const result1 = parseTask('- [ ] Task one', 1, file, {});
      const result2 = parseTask('- [ ] Task two', 1, file, {});
      expect(result1.task?.id).not.toBe(result2.task?.id);
    });
  });

  describe('Base fields', () => {
    it('should always include required fields', () => {
      const result = parseTask('- [ ] Basic task', 5, file, {});
      const task = result.task;

      expect(task?.id).toBeDefined();
      expect(task?.text).toBe('Basic task');
      expect(task?.completed).toBe(false);
      expect(task?.file).toBe(file);
      expect(task?.line).toBe(5);
      expect(task?.tags).toEqual([]);
    });

    it('should not include optional fields when undefined', () => {
      const result = parseTask('- [ ] Simple task', 1, file, {});
      const task = result.task;

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('text');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('file');
      expect(task).toHaveProperty('line');
      expect(task).toHaveProperty('tags');

      // Optional fields should not be present
      expect(task).not.toHaveProperty('assignee');
      expect(task).not.toHaveProperty('priority');
      expect(task).not.toHaveProperty('dueDate');
      expect(task).not.toHaveProperty('todoistId');
      expect(task).not.toHaveProperty('completedDate');
      expect(task).not.toHaveProperty('project');
      expect(task).not.toHaveProperty('person');
      expect(task).not.toHaveProperty('contextDate');
      expect(task).not.toHaveProperty('contextHeading');
    });
  });

  describe('Realistic examples', () => {
    it('should parse project task', () => {
      const context: ParsingContext = {
        project: 'acme-app',
        currentDate: new Date('2026-01-13'),
        currentHeading: '## Sprint 1 Planning',
      };
      const text = '- [ ] @alice Implement auth !! #backend [due: next week]';
      const result = parseTask(
        text,
        15,
        'projects/acme-app/sprint-1.md',
        context,
      );

      expect(result.task?.text).toBe('Implement auth');
      expect(result.task?.assignee).toBe('alice');
      expect(result.task?.priority).toBe('high');
      expect(result.task?.tags).toEqual(['backend']);
      expect(result.task?.dueDate).toBeInstanceOf(Date);
      expect(result.task?.project).toBe('acme-app');
      expect(result.task?.contextHeading).toBe('## Sprint 1 Planning');
      expect(result.warnings).toHaveLength(0);
    });

    it('should parse 1-1 task', () => {
      const context: ParsingContext = {
        person: 'jane-doe',
        currentDate: new Date('2026-01-13'),
      };
      const text = '- [ ] Discuss Q1 goals [due: 1/20/26]';
      const result = parseTask(text, 8, '1-1s/jane-doe.md', context);

      expect(result.task?.text).toBe('Discuss Q1 goals');
      expect(result.task?.person).toBe('jane-doe');
      expect(result.task?.dueDate?.getDate()).toBe(20);
      expect(result.warnings).toHaveLength(0);
    });

    it('should parse completed task with Todoist sync', () => {
      const text =
        '- [x] Fix payment bug [todoist:987654] [completed: 2026-01-17]';
      const result = parseTask(text, 42, 'backlog.md', {});

      expect(result.task?.completed).toBe(true);
      expect(result.task?.text).toBe('Fix payment bug');
      expect(result.task?.todoistId).toBe('987654');
      expect(result.task?.completedDate).toBeInstanceOf(Date);
    });
  });

  describe('Malformed checkbox warnings', () => {
    it('should warn on asterisk bullet marker', () => {
      const result = parseTask('* [x] Task with asterisk', 1, file, {});
      expect(result.task).toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain(
        'Unsupported bullet marker (* or +)',
      );
      expect(result.warnings[0]?.file).toBe(file);
      expect(result.warnings[0]?.line).toBe(1);
    });

    it('should warn on plus bullet marker', () => {
      const result = parseTask('+ [ ] Task with plus', 1, file, {});
      expect(result.task).toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain(
        'Unsupported bullet marker (* or +)',
      );
    });

    it('should warn on extra space after x', () => {
      const result = parseTask('- [x ] Task with extra space', 1, file, {});
      expect(result.task).toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain('Malformed checkbox');
    });

    it('should warn on extra space before x', () => {
      const result = parseTask('- [ x] Task with extra space', 1, file, {});
      expect(result.task).toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain('Malformed checkbox');
    });

    it('should warn on missing space before checkbox', () => {
      const result = parseTask('-[x] Task without space', 1, file, {});
      expect(result.task).toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain(
        'Missing space before checkbox',
      );
    });

    it('should warn on missing space after checkbox', () => {
      const result = parseTask('- [x]Task without space', 1, file, {});
      expect(result.task).toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain(
        'Missing space after checkbox',
      );
    });
  });

  describe('Missing date warnings', () => {
    it('should warn on incomplete task without date or context', () => {
      const result = parseTask('- [ ] Task without date', 1, file, {});
      expect(result.task).not.toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain('Task has no due date');
    });

    it('should not warn on task with explicit due date', () => {
      const result = parseTask('- [ ] Task [due: 2026-01-30]', 1, file, {});
      expect(result.task).not.toBeNull();
      expect(result.warnings).toHaveLength(0);
    });

    it('should not warn on task with context date', () => {
      const context: ParsingContext = {
        currentDate: new Date('2026-01-30'),
      };
      const result = parseTask('- [ ] Task with context', 1, file, context);
      expect(result.task).not.toBeNull();
      expect(result.warnings).toHaveLength(0);
    });

    it('should not warn on completed tasks without date', () => {
      const result = parseTask('- [x] Completed task', 1, file, {});
      expect(result.task).not.toBeNull();
      // Should only warn about missing completion date, not due date
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain('completion date');
    });

    it('should warn on completed task without completion date', () => {
      const result = parseTask('- [x] Completed task', 1, file, {});
      expect(result.task).not.toBeNull();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.reason).toContain(
        'Completed task missing completion date',
      );
    });

    it('should not warn on completed task with completion date', () => {
      const result = parseTask(
        '- [x] Task [completed: 2026-01-25]',
        1,
        file,
        {},
      );
      expect(result.task).not.toBeNull();
      expect(result.warnings).toHaveLength(0);
    });
  });
});
