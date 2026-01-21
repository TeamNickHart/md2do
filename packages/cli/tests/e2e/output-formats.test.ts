/**
 * E2E Tests: Output Formats
 *
 * Tests all output formats (pretty, table, JSON) with proper schema validation.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';

beforeAll(() => {
  vi.setSystemTime(new Date('2026-01-19T12:00:00Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

function runCLI(args: string): string {
  const cliPath = join(__dirname, '../../dist/cli.js');
  const examplesPath = join(__dirname, '../../../examples');

  const fullArgs = `${args} --path ${examplesPath}`;

  return execSync(`node ${cliPath} ${fullArgs}`, {
    encoding: 'utf-8',
    cwd: join(__dirname, '../../..'),
  });
}

// NOTE: These tests are proof-of-concept for snapshot testing approach.
// They're currently skipped because date mocking doesn't work across process boundaries.
// The real E2E tests are in scripts/e2e-test.sh
describe.skip('E2E: Pretty Format (Default)', () => {
  it('should output in pretty format', () => {
    const output = runCLI('list --format pretty --no-colors');

    // Basic assertions
    expect(output).toContain('Found');
    expect(output).toContain('tasks');
    expect(output).toContain('file://');

    // Snapshot full output
    expect(output).toMatchSnapshot();
  });

  it('should show completed and incomplete counts', () => {
    const output = runCLI('list --format pretty --no-colors');

    expect(output).toMatch(/✓.*completed.*○.*incomplete/);
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: Table Format', () => {
  it('should output in table format', () => {
    const output = runCLI('list --format table --no-colors');

    // Should contain table structure
    expect(output).toContain('Found');
    expect(output).toContain('tasks');

    // Snapshot full output
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: JSON Format', () => {
  it('should output valid JSON', () => {
    const output = runCLI('list --format json');

    // Should be parseable JSON
    const json = JSON.parse(output);

    expect(json).toBeDefined();
    expect(output).toMatchSnapshot();
  });

  it('should have correct JSON schema', () => {
    const output = runCLI('list --format json');
    const json = JSON.parse(output);

    // Top-level structure
    expect(json).toHaveProperty('tasks');
    expect(json).toHaveProperty('metadata');

    // Tasks array
    expect(Array.isArray(json.tasks)).toBe(true);

    // Metadata structure
    expect(json.metadata).toMatchObject({
      total: expect.any(Number),
      completed: expect.any(Number),
      incomplete: expect.any(Number),
    });

    // Each task should have required fields
    if (json.tasks.length > 0) {
      const task = json.tasks[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('text');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('file');
      expect(task).toHaveProperty('line');
    }

    // Snapshot entire structure
    expect(json).toMatchSnapshot();
  });

  it('should handle filters in JSON format', () => {
    const output = runCLI('list --format json --assignee alice');
    const json = JSON.parse(output);

    expect(json.tasks).toBeDefined();

    // All tasks should have assignee 'alice'
    json.tasks.forEach((task: any) => {
      expect(task.assignee).toBe('alice');
    });

    expect(json).toMatchSnapshot();
  });

  it('should include all metadata in JSON tasks', () => {
    const output = runCLI('list --format json --priority urgent');
    const json = JSON.parse(output);

    if (json.tasks.length > 0) {
      const task = json.tasks[0];

      // Should include priority
      expect(task.priority).toBe('urgent');

      // May include optional fields
      // assignee, tags[], dueDate, todoistId
    }

    expect(json).toMatchSnapshot();
  });
});

describe.skip('E2E: Output Options', () => {
  it.skip('should respect --limit option', () => {
    // TODO: Implement --limit option in CLI
    const output = runCLI('list --format json --limit 3');
    const json = JSON.parse(output);

    expect(json.tasks.length).toBeLessThanOrEqual(3);
    expect(json).toMatchSnapshot();
  });

  it('should hide paths with --no-paths', () => {
    const output = runCLI('list --no-paths --no-colors');

    expect(output).not.toContain('file://');
    expect(output).toMatchSnapshot();
  });

  it('should show context with --context', () => {
    const output = runCLI('list --context --no-colors');

    expect(output).toMatchSnapshot();
  });
});
