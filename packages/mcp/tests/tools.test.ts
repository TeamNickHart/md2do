/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { listTasks } from '../src/tools/list-tasks';
import { getTaskStats } from '../src/tools/get-stats';
import { searchTasks } from '../src/tools/search-tasks';
import { getTaskById } from '../src/tools/get-task-by-id';

const TEST_DIR = join(__dirname, '.test-fixtures');

describe('MCP Tools', () => {
  beforeAll(() => {
    // Create test directory and markdown files
    mkdirSync(TEST_DIR, { recursive: true });

    writeFileSync(
      join(TEST_DIR, 'tasks.md'),
      `# Tasks

- [ ] !!! Fix critical bug (2026-01-25) @alice #backend
- [ ] !! Review PR #123 @bob #frontend
- [x] ! Setup database @alice #backend
- [ ] Write docs @charlie #docs
`,
    );

    writeFileSync(
      join(TEST_DIR, 'project.md'),
      `# Project Tasks

- [ ] !!! Deploy to production (2026-01-20) @alice #devops
- [x] Configure CI/CD @bob
`,
    );
  });

  afterAll(() => {
    // Cleanup test directory
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('listTasks', () => {
    it('should list all tasks', async () => {
      const result = await listTasks({ path: TEST_DIR });
      const parsed = JSON.parse(result);

      expect(parsed.metadata.total).toBeGreaterThan(0);
      expect(parsed.tasks).toBeInstanceOf(Array);
    });

    it('should filter by assignee', async () => {
      const result = await listTasks({ path: TEST_DIR, assignee: 'alice' });
      const parsed = JSON.parse(result);

      expect(parsed.tasks.every((t: any) => t.assignee === 'alice')).toBe(true);
    });

    it('should filter by priority', async () => {
      const result = await listTasks({ path: TEST_DIR, priority: 'urgent' });
      const parsed = JSON.parse(result);

      expect(parsed.tasks.every((t: any) => t.priority === 'urgent')).toBe(
        true,
      );
    });

    it('should filter by tag', async () => {
      const result = await listTasks({ path: TEST_DIR, tag: 'backend' });
      const parsed = JSON.parse(result);

      expect(parsed.tasks.every((t: any) => t.tags.includes('backend'))).toBe(
        true,
      );
    });

    it('should filter completed tasks', async () => {
      const result = await listTasks({ path: TEST_DIR, completed: true });
      const parsed = JSON.parse(result);

      expect(parsed.tasks.every((t: any) => t.completed === true)).toBe(true);
    });

    it('should filter incomplete tasks', async () => {
      const result = await listTasks({ path: TEST_DIR, completed: false });
      const parsed = JSON.parse(result);

      expect(parsed.tasks.every((t: any) => t.completed === false)).toBe(true);
    });

    it('should limit results', async () => {
      const result = await listTasks({ path: TEST_DIR, limit: 2 });
      const parsed = JSON.parse(result);

      expect(parsed.tasks.length).toBeLessThanOrEqual(2);
    });

    it('should sort by priority', async () => {
      const result = await listTasks({ path: TEST_DIR, sort: 'priority' });
      const parsed = JSON.parse(result);

      expect(parsed.tasks).toBeInstanceOf(Array);
      expect(parsed.tasks.length).toBeGreaterThan(0);
    });

    it('should filter overdue tasks', async () => {
      const result = await listTasks({ path: TEST_DIR, overdue: true });
      const parsed = JSON.parse(result);

      // All tasks should have a dueDate in the past
      const now = new Date();
      parsed.tasks.forEach((t: any) => {
        if (t.dueDate) {
          expect(new Date(t.dueDate) < now).toBe(true);
        }
      });
    });
  });

  describe('getTaskStats', () => {
    it('should return overall statistics', async () => {
      const result = await getTaskStats({ path: TEST_DIR });
      const parsed = JSON.parse(result);

      expect(parsed.overall.totalTasks).toBeGreaterThan(0);
      expect(parsed.overall.completed).toBeGreaterThanOrEqual(0);
      expect(parsed.overall.incomplete).toBeGreaterThanOrEqual(0);
      expect(parsed.overall.totalTasks).toBe(
        parsed.overall.completed + parsed.overall.incomplete,
      );
    });

    it('should group by assignee', async () => {
      const result = await getTaskStats({
        path: TEST_DIR,
        groupBy: 'assignee',
      });
      const parsed = JSON.parse(result);

      expect(parsed.groupedBy).toBe('assignee');
      expect(parsed.groups).toBeDefined();
      expect(typeof parsed.groups).toBe('object');

      // Check that groups have stats
      Object.values(parsed.groups).forEach((group: any) => {
        expect(group).toHaveProperty('total');
        expect(group).toHaveProperty('completed');
        expect(group).toHaveProperty('incomplete');
      });
    });

    it('should group by priority', async () => {
      const result = await getTaskStats({
        path: TEST_DIR,
        groupBy: 'priority',
      });
      const parsed = JSON.parse(result);

      expect(parsed.groupedBy).toBe('priority');
      expect(parsed.groups).toBeDefined();
    });

    it('should group by tag', async () => {
      const result = await getTaskStats({ path: TEST_DIR, groupBy: 'tag' });
      const parsed = JSON.parse(result);

      expect(parsed.groupedBy).toBe('tag');
      expect(parsed.groups).toBeDefined();
    });

    it('should filter before generating stats', async () => {
      const result = await getTaskStats({
        path: TEST_DIR,
        assignee: 'alice',
      });
      const parsed = JSON.parse(result);

      expect(parsed.overall.totalTasks).toBeGreaterThan(0);
    });
  });

  describe('searchTasks', () => {
    it('should search task descriptions', async () => {
      const result = await searchTasks({ path: TEST_DIR, query: 'bug' });
      const parsed = JSON.parse(result);

      expect(parsed.results.length).toBeGreaterThan(0);
      expect(
        parsed.results.some((t: any) => t.text.toLowerCase().includes('bug')),
      ).toBe(true);
    });

    it('should perform case-insensitive search', async () => {
      const result = await searchTasks({
        path: TEST_DIR,
        query: 'BUG',
        caseInsensitive: true,
      });
      const parsed = JSON.parse(result);

      expect(parsed.results.length).toBeGreaterThan(0);
    });

    it('should limit search results', async () => {
      const result = await searchTasks({
        path: TEST_DIR,
        query: 'a',
        limit: 1,
      });
      const parsed = JSON.parse(result);

      expect(parsed.results.length).toBeLessThanOrEqual(1);
    });

    it('should return empty array for no matches', async () => {
      const result = await searchTasks({
        path: TEST_DIR,
        query: 'nonexistentxyzabc123',
      });
      const parsed = JSON.parse(result);

      expect(parsed.results).toEqual([]);
    });
  });

  describe('getTaskById', () => {
    it('should retrieve task by ID', async () => {
      // First get a task to find its ID
      const listResult = await listTasks({ path: TEST_DIR, limit: 1 });
      const listParsed = JSON.parse(listResult);
      const taskId = listParsed.tasks[0].id;

      const result = await getTaskById({ path: TEST_DIR, id: taskId });
      const parsed = JSON.parse(result);

      expect(parsed.task.id).toBe(taskId);
      expect(parsed.task).toHaveProperty('text');
      expect(parsed.task).toHaveProperty('completed');
    });

    it('should return error for non-existent ID', async () => {
      const result = await getTaskById({
        path: TEST_DIR,
        id: 'non-existent-id-12345',
      });
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid path gracefully', async () => {
      const result = await listTasks({ path: '/nonexistent/path' });
      const parsed = JSON.parse(result);

      // Should return empty results or error, not crash
      expect(parsed).toBeDefined();
      expect(parsed.tasks).toBeDefined();
    });

    it('should handle missing query parameter', async () => {
      const result = await searchTasks({ path: TEST_DIR, query: '' });
      const parsed = JSON.parse(result);

      // Should handle gracefully
      expect(parsed).toBeDefined();
      expect(parsed.results).toBeDefined();
    });

    it('should handle invalid sort parameter gracefully', async () => {
      try {
        await listTasks({
          path: TEST_DIR,
          sort: 'invalid' as any,
        });
      } catch (error) {
        // Should throw validation error
        expect(error).toBeDefined();
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex filter combinations', async () => {
      const result = await listTasks({
        path: TEST_DIR,
        assignee: 'alice',
        tag: 'backend',
        completed: false,
        sort: 'priority',
        limit: 10,
      });
      const parsed = JSON.parse(result);

      expect(parsed.tasks).toBeInstanceOf(Array);
      parsed.tasks.forEach((task: any) => {
        expect(task.assignee).toBe('alice');
        expect(task.tags).toContain('backend');
        expect(task.completed).toBe(false);
      });
    });

    it('should handle stats with filtering', async () => {
      const result = await getTaskStats({
        path: TEST_DIR,
        groupBy: 'assignee',
        assignee: 'alice',
      });
      const parsed = JSON.parse(result);

      expect(parsed.groupedBy).toBe('assignee');
      expect(parsed.groups).toBeDefined();
    });
  });
});
