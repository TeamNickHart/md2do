import { describe, it, expect } from 'vitest';
import { PATTERNS } from '../../src/parser/patterns.js';

describe('Task Checkbox Pattern', () => {
  it('should match unchecked task', () => {
    const line = '- [ ] Task text';
    const match = line.match(PATTERNS.TASK_CHECKBOX);
    expect(match).toBeTruthy();
    expect(match?.[2]).toBe(' ');
  });

  it('should match checked task with lowercase x', () => {
    const line = '- [x] Completed task';
    const match = line.match(PATTERNS.TASK_CHECKBOX);
    expect(match).toBeTruthy();
    expect(match?.[2]).toBe('x');
  });

  it('should match checked task with uppercase X', () => {
    const line = '- [X] Completed task';
    const match = line.match(PATTERNS.TASK_CHECKBOX);
    expect(match).toBeTruthy();
    expect(match?.[2]).toBe('X');
  });

  it('should match task with leading whitespace', () => {
    const line = '  - [ ] Indented task';
    const match = line.match(PATTERNS.TASK_CHECKBOX);
    expect(match).toBeTruthy();
    expect(match?.[1]).toBe('  ');
  });

  it('should not match regular list items', () => {
    const line = '- Regular list item';
    const match = line.match(PATTERNS.TASK_CHECKBOX);
    expect(match).toBeNull();
  });

  it('should not match headings', () => {
    const line = '## Heading';
    const match = line.match(PATTERNS.TASK_CHECKBOX);
    expect(match).toBeNull();
  });
});

describe('Assignee Pattern', () => {
  it('should extract username with @', () => {
    const text = '@nick Review PR';
    const match = text.match(PATTERNS.ASSIGNEE);
    expect(match?.[1]).toBe('nick');
  });

  it('should extract username with hyphens', () => {
    const text = '@jane-doe Complete task';
    const match = text.match(PATTERNS.ASSIGNEE);
    expect(match?.[1]).toBe('jane-doe');
  });

  it('should extract first assignee if multiple', () => {
    const text = '@alice and @bob Review';
    const match = text.match(PATTERNS.ASSIGNEE);
    expect(match?.[1]).toBe('alice');
  });

  it('should return null if no assignee', () => {
    const text = 'Task without assignee';
    const match = text.match(PATTERNS.ASSIGNEE);
    expect(match).toBeNull();
  });
});

describe('Priority Patterns', () => {
  it('should match urgent priority (!!!)', () => {
    const text = 'Critical bug fix !!!';
    expect(PATTERNS.PRIORITY_URGENT.test(text)).toBe(true);
    expect(PATTERNS.PRIORITY_HIGH.test(text)).toBe(true); // Also matches !!
    // PRIORITY_NORMAL uses negative lookbehind/ahead, so won't match within !!!
    expect(PATTERNS.PRIORITY_NORMAL.test(text)).toBe(false);
  });

  it('should match high priority (!!)', () => {
    const text = 'Important task !!';
    expect(PATTERNS.PRIORITY_URGENT.test(text)).toBe(false);
    expect(PATTERNS.PRIORITY_HIGH.test(text)).toBe(true);
    // PRIORITY_NORMAL uses negative lookbehind/ahead, so won't match within !!
    expect(PATTERNS.PRIORITY_NORMAL.test(text)).toBe(false);
  });

  it('should match normal priority (!)', () => {
    const text = 'Regular task !';
    expect(PATTERNS.PRIORITY_URGENT.test(text)).toBe(false);
    expect(PATTERNS.PRIORITY_HIGH.test(text)).toBe(false);
    expect(PATTERNS.PRIORITY_NORMAL.test(text)).toBe(true);
  });

  it('should not match text without priority', () => {
    const text = 'Low priority task';
    expect(PATTERNS.PRIORITY_URGENT.test(text)).toBe(false);
    expect(PATTERNS.PRIORITY_HIGH.test(text)).toBe(false);
    expect(PATTERNS.PRIORITY_NORMAL.test(text)).toBe(false);
  });

  it('should match standalone exclamation', () => {
    const text = 'Hello! World';
    // This should match because ! is followed by space, not another !
    expect(PATTERNS.PRIORITY_NORMAL.test(text)).toBe(true);
  });
});

describe('Tag Pattern', () => {
  it('should extract single tag', () => {
    const text = 'Task with #backend tag';
    const matches = Array.from(text.matchAll(PATTERNS.TAG));
    expect(matches).toHaveLength(1);
    expect(matches[0]?.[1]).toBe('backend');
  });

  it('should extract multiple tags', () => {
    const text = 'Task #backend #urgent #review';
    const matches = Array.from(text.matchAll(PATTERNS.TAG));
    expect(matches).toHaveLength(3);
    expect(matches[0]?.[1]).toBe('backend');
    expect(matches[1]?.[1]).toBe('urgent');
    expect(matches[2]?.[1]).toBe('review');
  });

  it('should extract tags with hyphens', () => {
    const text = 'Task #code-review #high-priority';
    const matches = Array.from(text.matchAll(PATTERNS.TAG));
    expect(matches).toHaveLength(2);
    expect(matches[0]?.[1]).toBe('code-review');
    expect(matches[1]?.[1]).toBe('high-priority');
  });

  it('should return empty array if no tags', () => {
    const text = 'Task without tags';
    const matches = Array.from(text.matchAll(PATTERNS.TAG));
    expect(matches).toHaveLength(0);
  });
});

describe('Due Date Patterns', () => {
  describe('Absolute dates', () => {
    it('should match ISO format date', () => {
      const text = 'Task [due: 2026-01-25]';
      const match = text.match(PATTERNS.DUE_DATE_ABSOLUTE);
      expect(match?.[1]).toBe('2026-01-25');
    });

    it('should match case-insensitive', () => {
      const text = 'Task [DUE: 2026-01-25]';
      const match = text.match(PATTERNS.DUE_DATE_ABSOLUTE);
      expect(match?.[1]).toBe('2026-01-25');
    });

    it('should match with extra whitespace', () => {
      const text = 'Task [due:   2026-01-25  ]';
      const match = text.match(PATTERNS.DUE_DATE_ABSOLUTE);
      expect(match?.[1]).toBe('2026-01-25');
    });
  });

  describe('Short format dates', () => {
    it('should match M/D format', () => {
      const text = 'Task [due: 1/25]';
      const match = text.match(PATTERNS.DUE_DATE_SHORT);
      expect(match?.[1]).toBe('1/25');
    });

    it('should match M/D/YY format', () => {
      const text = 'Task [due: 1/25/26]';
      const match = text.match(PATTERNS.DUE_DATE_SHORT);
      expect(match?.[1]).toBe('1/25/26');
    });

    it('should match M/D/YYYY format', () => {
      const text = 'Task [due: 1/25/2026]';
      const match = text.match(PATTERNS.DUE_DATE_SHORT);
      expect(match?.[1]).toBe('1/25/2026');
    });
  });

  describe('Relative dates', () => {
    it('should match "today"', () => {
      const text = 'Task [due: today]';
      const match = text.match(PATTERNS.DUE_DATE_RELATIVE);
      expect(match?.[1]).toBe('today');
    });

    it('should match "tomorrow"', () => {
      const text = 'Task [due: tomorrow]';
      const match = text.match(PATTERNS.DUE_DATE_RELATIVE);
      expect(match?.[1]).toBe('tomorrow');
    });

    it('should match "next week"', () => {
      const text = 'Task [due: next week]';
      const match = text.match(PATTERNS.DUE_DATE_RELATIVE);
      expect(match?.[1]).toBe('next week');
    });

    it('should match "next month"', () => {
      const text = 'Task [due: next month]';
      const match = text.match(PATTERNS.DUE_DATE_RELATIVE);
      expect(match?.[1]).toBe('next month');
    });
  });
});

describe('Todoist ID Pattern', () => {
  it('should extract numeric ID', () => {
    const text = 'Task [todoist:123456]';
    const match = text.match(PATTERNS.TODOIST_ID);
    expect(match?.[1]).toBe('123456');
  });

  it('should extract long ID', () => {
    const text = 'Task [todoist:7891234567]';
    const match = text.match(PATTERNS.TODOIST_ID);
    expect(match?.[1]).toBe('7891234567');
  });

  it('should return null if no ID', () => {
    const text = 'Task without Todoist ID';
    const match = text.match(PATTERNS.TODOIST_ID);
    expect(match).toBeNull();
  });
});

describe('Completed Date Pattern', () => {
  it('should extract completion date', () => {
    const text = '[completed: 2026-01-18]';
    const match = text.match(PATTERNS.COMPLETED_DATE);
    expect(match?.[1]).toBe('2026-01-18');
  });

  it('should match case-insensitive', () => {
    const text = '[COMPLETED: 2026-01-18]';
    const match = text.match(PATTERNS.COMPLETED_DATE);
    expect(match?.[1]).toBe('2026-01-18');
  });

  it('should return null if no completion date', () => {
    const text = 'Task without completion date';
    const match = text.match(PATTERNS.COMPLETED_DATE);
    expect(match).toBeNull();
  });
});

describe('Heading Date Patterns', () => {
  describe('Slash format', () => {
    it('should match M/D/YY format', () => {
      const heading = '## Meeting 1/13/26';
      const match = heading.match(PATTERNS.HEADING_DATE_SLASH);
      expect(match?.[1]).toBe('1/13/26');
    });

    it('should match M/D/YYYY format', () => {
      const heading = '### Sprint Planning 1/13/2026';
      const match = heading.match(PATTERNS.HEADING_DATE_SLASH);
      expect(match?.[1]).toBe('1/13/2026');
    });

    it('should match with trailing text', () => {
      const heading = '## 1/13/26 - Weekly Sync';
      const match = heading.match(PATTERNS.HEADING_DATE_SLASH);
      expect(match?.[1]).toBe('1/13/26');
    });
  });

  describe('ISO format', () => {
    it('should match YYYY-MM-DD format', () => {
      const heading = '## 2026-01-13 Sprint Planning';
      const match = heading.match(PATTERNS.HEADING_DATE_ISO);
      expect(match?.[1]).toBe('2026-01-13');
    });

    it('should match in middle of heading', () => {
      const heading = '### Meeting on 2026-01-13';
      const match = heading.match(PATTERNS.HEADING_DATE_ISO);
      expect(match?.[1]).toBe('2026-01-13');
    });
  });

  describe('Natural format', () => {
    it('should match full month name', () => {
      const heading = '## January 13, 2026';
      const match = heading.match(PATTERNS.HEADING_DATE_NATURAL);
      // Pattern captures only 3-letter abbreviation, rest matched by [a-z]*
      expect(match?.[1]).toBe('Jan');
      expect(match?.[2]).toBe('13');
      expect(match?.[3]).toBe('2026');
    });

    it('should match abbreviated month', () => {
      const heading = '### Jan 13, 2026 - Planning';
      const match = heading.match(PATTERNS.HEADING_DATE_NATURAL);
      expect(match?.[1]).toBe('Jan');
      expect(match?.[2]).toBe('13');
      expect(match?.[3]).toBe('2026');
    });

    it('should match various months', () => {
      const monthAbbrs = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const fullMonths = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      for (let i = 0; i < fullMonths.length; i++) {
        const heading = `## ${fullMonths[i]} 15, 2026`;
        const match = heading.match(PATTERNS.HEADING_DATE_NATURAL);
        // Pattern captures only 3-letter abbreviation
        expect(match?.[1]).toBe(monthAbbrs[i]);
        expect(match?.[2]).toBe('15');
        expect(match?.[3]).toBe('2026');
      }
    });
  });
});
