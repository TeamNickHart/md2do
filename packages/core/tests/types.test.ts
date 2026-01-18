import { describe, it, expect } from 'vitest';
import type { Task, Priority } from '../src/types/index.js';

describe('Type definitions', () => {
  it('should allow creating a valid Task', () => {
    const task: Task = {
      id: 'test-id',
      text: 'Test task',
      completed: false,
      file: 'test.md',
      line: 1,
      tags: [],
    };

    expect(task.text).toBe('Test task');
    expect(task.completed).toBe(false);
  });

  it('should allow valid Priority values', () => {
    const priorities: Priority[] = ['urgent', 'high', 'normal', 'low'];
    expect(priorities).toHaveLength(4);
  });
});
