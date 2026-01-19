import { describe, it, expect } from 'vitest';
import { generateTaskId } from '../../src/utils/id.js';

describe('generateTaskId', () => {
  it('should generate 8-character hex string', () => {
    const id = generateTaskId('file.md', 1, 'Task text');
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('should generate same ID for identical inputs', () => {
    const id1 = generateTaskId('file.md', 1, 'Task text');
    const id2 = generateTaskId('file.md', 1, 'Task text');
    expect(id1).toBe(id2);
  });

  it('should generate different IDs for different files', () => {
    const id1 = generateTaskId('file1.md', 1, 'Task text');
    const id2 = generateTaskId('file2.md', 1, 'Task text');
    expect(id1).not.toBe(id2);
  });

  it('should generate different IDs for different line numbers', () => {
    const id1 = generateTaskId('file.md', 1, 'Task text');
    const id2 = generateTaskId('file.md', 2, 'Task text');
    expect(id1).not.toBe(id2);
  });

  it('should generate different IDs for different text', () => {
    const id1 = generateTaskId('file.md', 1, 'Task one');
    const id2 = generateTaskId('file.md', 1, 'Task two');
    expect(id1).not.toBe(id2);
  });

  it('should handle empty text', () => {
    const id = generateTaskId('file.md', 1, '');
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('should handle special characters in text', () => {
    const id = generateTaskId('file.md', 1, 'Task with @user #tag !!');
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('should handle unicode characters', () => {
    const id = generateTaskId('file.md', 1, 'Task with émojis 🚀');
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('should handle file paths with directories', () => {
    const id = generateTaskId('projects/acme-app/notes.md', 1, 'Task text');
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('should be deterministic across multiple calls', () => {
    const ids = Array.from({ length: 100 }, () =>
      generateTaskId('file.md', 42, 'Consistent task'),
    );
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(1); // All IDs should be identical
  });

  it('should generate diverse IDs for similar inputs', () => {
    const tasks = [
      'Review PR',
      'Review PR 1',
      'Review PR 2',
      'Review PR 3',
      'Review PR 4',
    ];
    const ids = tasks.map((text) => generateTaskId('file.md', 1, text));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(tasks.length); // All IDs should be different
  });

  it('should handle large line numbers', () => {
    const id = generateTaskId('file.md', 999999, 'Task text');
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('should handle very long text', () => {
    const longText = 'Task '.repeat(1000);
    const id = generateTaskId('file.md', 1, longText);
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  describe('Realistic examples', () => {
    it('should generate stable IDs for real-world tasks', () => {
      const examples = [
        {
          file: 'projects/acme-app/sprint-1.md',
          line: 15,
          text: 'Implement user authentication',
        },
        {
          file: '1-1s/jane-doe.md',
          line: 8,
          text: 'Discuss Q1 goals',
        },
        {
          file: 'projects/widget-co/backlog.md',
          line: 42,
          text: 'Fix production bug in payment flow',
        },
      ];

      for (const example of examples) {
        const id1 = generateTaskId(example.file, example.line, example.text);
        const id2 = generateTaskId(example.file, example.line, example.text);
        expect(id1).toBe(id2);
        expect(id1).toHaveLength(8);
      }
    });

    it('should generate unique IDs for similar tasks in same file', () => {
      const file = 'projects/acme-app/notes.md';
      const tasks = [
        { line: 10, text: 'Write tests for login' },
        { line: 11, text: 'Write tests for signup' },
        { line: 12, text: 'Write tests for logout' },
      ];

      const ids = tasks.map((t) => generateTaskId(file, t.line, t.text));
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(tasks.length);
    });
  });
});
