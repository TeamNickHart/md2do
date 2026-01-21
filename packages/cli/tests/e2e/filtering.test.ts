/**
 * E2E Tests: Filtering
 *
 * Tests all filtering capabilities of the CLI with snapshot testing.
 * Uses date mocking to ensure consistent results regardless of when tests run.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';

// Freeze time to 2026-01-19 for consistent date-based filtering
beforeAll(() => {
  vi.setSystemTime(new Date('2026-01-19T12:00:00Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

// Helper to run CLI commands
function runCLI(args: string): string {
  const cliPath = join(__dirname, '../../dist/cli.js');
  const examplesPath = join(__dirname, '../../../examples');

  const fullArgs = `${args} --path ${examplesPath} --no-colors`;

  return execSync(`node ${cliPath} ${fullArgs}`, {
    encoding: 'utf-8',
    cwd: join(__dirname, '../../..'),
  });
}

// NOTE: These tests are proof-of-concept for snapshot testing approach.
// They're currently skipped because date mocking doesn't work across process boundaries.
// The real E2E tests are in scripts/e2e-test.sh
describe.skip('E2E: Filtering by Assignee', () => {
  it('should filter tasks assigned to alice', () => {
    const output = runCLI('list --assignee alice');
    expect(output).toMatchSnapshot();
  });

  it('should filter tasks assigned to bob', () => {
    const output = runCLI('list --assignee bob');
    expect(output).toMatchSnapshot();
  });

  it('should filter tasks assigned to charlie', () => {
    const output = runCLI('list --assignee charlie');
    expect(output).toMatchSnapshot();
  });

  it('should handle non-existent assignee', () => {
    const output = runCLI('list --assignee nonexistent');
    expect(output).toContain('Found 0 tasks');
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: Filtering by Priority', () => {
  it('should filter urgent priority tasks', () => {
    const output = runCLI('list --priority urgent');
    expect(output).toContain('!!!');
    expect(output).toMatchSnapshot();
  });

  it('should filter high priority tasks', () => {
    const output = runCLI('list --priority high');
    expect(output).toContain('!!');
    expect(output).toMatchSnapshot();
  });

  it('should filter normal priority tasks', () => {
    const output = runCLI('list --priority normal');
    expect(output).toContain('!');
    expect(output).toMatchSnapshot();
  });

  it('should filter low priority tasks', () => {
    const output = runCLI('list --priority low');
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: Filtering by Tags', () => {
  it('should filter backend tasks', () => {
    const output = runCLI('list --tag backend');
    expect(output).toContain('#backend');
    expect(output).toMatchSnapshot();
  });

  it('should filter frontend tasks', () => {
    const output = runCLI('list --tag frontend');
    expect(output).toContain('#frontend');
    expect(output).toMatchSnapshot();
  });

  it('should filter bug tasks', () => {
    const output = runCLI('list --tag bug');
    expect(output).toContain('#bug');
    expect(output).toMatchSnapshot();
  });

  it('should filter docs tasks', () => {
    const output = runCLI('list --tag docs');
    expect(output).toContain('#docs');
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: Filtering by Completion Status', () => {
  it('should filter incomplete tasks', () => {
    const output = runCLI('list --incomplete');
    expect(output).toContain('incomplete');
    expect(output).toMatchSnapshot();
  });

  it('should filter completed tasks', () => {
    const output = runCLI('list --completed');
    expect(output).toContain('completed');
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: Filtering by Date', () => {
  // These tests rely on mocked date of 2026-01-19

  it('should filter overdue tasks', () => {
    const output = runCLI('list --overdue');
    expect(output).toMatchSnapshot();
  });

  it('should filter tasks due today (2026-01-19)', () => {
    const output = runCLI('list --due-today');
    expect(output).toMatchSnapshot();
  });

  it('should filter tasks due this week', () => {
    const output = runCLI('list --due-this-week');
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: Filtering by Project', () => {
  it('should filter acme-app project tasks', () => {
    const output = runCLI('list --project acme-app');
    expect(output).toMatchSnapshot();
  });

  it('should filter widget-co project tasks', () => {
    const output = runCLI('list --project widget-co');
    expect(output).toMatchSnapshot();
  });
});

describe.skip('E2E: Combined Filters', () => {
  it('should filter by assignee and priority', () => {
    const output = runCLI('list --assignee alice --priority urgent');
    expect(output).toMatchSnapshot();
  });

  it('should filter by tag, priority, and status', () => {
    const output = runCLI('list --tag backend --priority high --incomplete');
    expect(output).toMatchSnapshot();
  });

  it('should filter by project, assignee, and date', () => {
    const output = runCLI('list --project acme-app --assignee nick --overdue');
    expect(output).toMatchSnapshot();
  });
});
