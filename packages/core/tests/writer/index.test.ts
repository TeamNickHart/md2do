import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { updateTask, updateTasks, addTask } from '../../src/writer/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('updateTask', () => {
  let tempDir: string;
  let testFile: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md2do-writer-test-'));
    testFile = path.join(tempDir, 'test.md');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should mark task as completed', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3');

    const result = await updateTask({
      file: testFile,
      line: 2,
      updates: { completed: true },
    });

    expect(result.success).toBe(true);
    expect(result.task?.completed).toBe(true);

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3');
  });

  it('should mark task as incomplete', async () => {
    await fs.writeFile(testFile, '- [x] Task 1\n- [x] Task 2\n- [x] Task 3');

    const result = await updateTask({
      file: testFile,
      line: 2,
      updates: { completed: false },
    });

    expect(result.success).toBe(true);
    expect(result.task?.completed).toBe(false);

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('- [x] Task 1\n- [ ] Task 2\n- [x] Task 3');
  });

  it('should update task text', async () => {
    await fs.writeFile(testFile, '- [ ] Old task text');

    const result = await updateTask({
      file: testFile,
      line: 1,
      updates: { text: 'New task text @nick !!! #urgent' },
    });

    expect(result.success).toBe(true);
    // Parser cleans metadata from text
    expect(result.task?.text).toBe('New task text');
    expect(result.task?.assignee).toBe('nick');
    expect(result.task?.priority).toBe('urgent');
    expect(result.task?.tags).toContain('urgent');

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('- [ ] New task text @nick !!! #urgent');
  });

  it('should replace entire line', async () => {
    await fs.writeFile(testFile, '- [ ] Old task');

    const result = await updateTask({
      file: testFile,
      line: 1,
      updates: { replaceLine: '- [x] Completely new task @alice !! #backend' },
    });

    expect(result.success).toBe(true);

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('- [x] Completely new task @alice !! #backend');
  });

  it('should return error for invalid line number', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1\n- [ ] Task 2');

    const result = await updateTask({
      file: testFile,
      line: 10,
      updates: { completed: true },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid line number');
  });

  it('should return error for non-task line', async () => {
    await fs.writeFile(testFile, '# Heading\n- [ ] Task\nRegular text');

    const result = await updateTask({
      file: testFile,
      line: 3,
      updates: { completed: true },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not a task');
  });

  it('should handle file read errors', async () => {
    const result = await updateTask({
      file: '/nonexistent/file.md',
      line: 1,
      updates: { completed: true },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to update task');
  });
});

describe('updateTasks', () => {
  let tempDir: string;
  let testFile: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md2do-writer-test-'));
    testFile = path.join(tempDir, 'test.md');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should update multiple tasks in one operation', async () => {
    await fs.writeFile(
      testFile,
      '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n- [ ] Task 4',
    );

    const result = await updateTasks(testFile, [
      { line: 1, updates: { completed: true } },
      { line: 3, updates: { completed: true } },
      { line: 4, updates: { text: 'Updated task' } },
    ]);

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(3);
    expect(result.errors).toHaveLength(0);

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe(
      '- [x] Task 1\n- [ ] Task 2\n- [x] Task 3\n- [ ] Updated task',
    );
  });

  it('should collect errors for invalid updates', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1\nRegular text\n- [ ] Task 3');

    const result = await updateTasks(testFile, [
      { line: 1, updates: { completed: true } },
      { line: 2, updates: { completed: true } }, // Not a task
      { line: 10, updates: { completed: true } }, // Out of range
    ]);

    expect(result.success).toBe(false);
    expect(result.updatedCount).toBe(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]?.line).toBe(2);
    expect(result.errors[1]?.line).toBe(10);
  });

  it('should handle empty updates array', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1');

    const result = await updateTasks(testFile, []);

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(0);
  });
});

describe('addTask', () => {
  let tempDir: string;
  let testFile: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md2do-writer-test-'));
    testFile = path.join(tempDir, 'test.md');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should append task to end of file', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1\n- [ ] Task 2');

    const result = await addTask(testFile, 'New task @nick !!! #urgent');

    expect(result.success).toBe(true);
    // Parser cleans metadata from text
    expect(result.task?.text).toBe('New task');
    expect(result.task?.assignee).toBe('nick');
    expect(result.task?.priority).toBe('urgent');
    expect(result.task?.tags).toContain('urgent');
    expect(result.task?.completed).toBe(false);

    const content = await fs.readFile(testFile, 'utf-8');
    // When file doesn't end with newline, addTask adds blank line for spacing
    expect(content).toBe(
      '- [ ] Task 1\n- [ ] Task 2\n\n- [ ] New task @nick !!! #urgent',
    );
  });

  it('should insert task at specific line', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1\n- [ ] Task 3');

    const result = await addTask(testFile, 'Task 2', { line: 2 });

    expect(result.success).toBe(true);

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3');
  });

  it('should create completed task', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1');

    const result = await addTask(testFile, 'Completed task', {
      completed: true,
    });

    expect(result.success).toBe(true);
    expect(result.task?.completed).toBe(true);

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toContain('- [x] Completed task');
  });

  it('should create file if it does not exist', async () => {
    const newFile = path.join(tempDir, 'new.md');

    const result = await addTask(newFile, 'First task');

    expect(result.success).toBe(true);

    const content = await fs.readFile(newFile, 'utf-8');
    expect(content).toContain('- [ ] First task');
  });

  it('should return error for invalid line number', async () => {
    await fs.writeFile(testFile, '- [ ] Task 1');

    const result = await addTask(testFile, 'New task', { line: 100 });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid line number');
  });
});
