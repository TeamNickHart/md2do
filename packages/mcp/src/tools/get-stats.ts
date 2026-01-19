import type { Task } from '@md2do/core';
import { filters } from '@md2do/core';
import { scanMarkdownFiles } from '../utils/scanner.js';
import { GetTaskStatsInputSchema } from '../types.js';

/**
 * Get task statistics with optional grouping
 */
export async function getTaskStats(input: unknown): Promise<string> {
  // Validate input
  const validated = GetTaskStatsInputSchema.parse(input);

  // Scan markdown files
  const scanResult = await scanMarkdownFiles({
    root: validated.path || process.cwd(),
  });

  let tasks = scanResult.tasks;

  // Apply filters
  const taskFilters: filters.TaskFilter[] = [];

  if (validated.assignee) {
    taskFilters.push(filters.byAssignee(validated.assignee));
  }

  if (validated.project) {
    taskFilters.push(filters.byProject(validated.project));
  }

  if (taskFilters.length > 0) {
    tasks = tasks.filter(filters.combineFilters(taskFilters));
  }

  // Generate stats
  if (validated.groupBy) {
    return JSON.stringify(getGroupedStats(tasks, validated.groupBy), null, 2);
  } else {
    return JSON.stringify(
      getOverallStats(tasks, scanResult.metadata.filesScanned),
      null,
      2,
    );
  }
}

/**
 * Get overall statistics
 */
function getOverallStats(tasks: Task[], filesScanned: number) {
  const completed = tasks.filter((t) => t.completed).length;
  const incomplete = tasks.filter((t) => !t.completed).length;
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < new Date(),
  ).length;

  const priorityStats = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    normal: tasks.filter((t) => t.priority === 'normal').length,
    low: tasks.filter((t) => !t.priority).length,
  };

  const assigneeStats = groupBy(tasks, 'assignee');
  const projectStats = groupBy(tasks, 'project');

  return {
    overall: {
      filesScanned,
      totalTasks: tasks.length,
      completed,
      incomplete,
      overdue,
    },
    byPriority: priorityStats,
    byAssignee: assigneeStats,
    byProject: projectStats,
  };
}

/**
 * Get grouped statistics
 */
function getGroupedStats(
  tasks: Task[],
  groupBy: 'assignee' | 'project' | 'person' | 'priority' | 'tag',
) {
  const groups = new Map<string, Task[]>();

  for (const task of tasks) {
    let keys: string[];

    switch (groupBy) {
      case 'assignee':
        keys = [task.assignee || '(unassigned)'];
        break;
      case 'project':
        keys = [task.project || '(no project)'];
        break;
      case 'person':
        keys = [task.person || '(no person)'];
        break;
      case 'priority':
        keys = [task.priority || 'low'];
        break;
      case 'tag':
        keys = task.tags.length > 0 ? task.tags : ['(no tags)'];
        break;
      default:
        keys = ['(unknown)'];
    }

    for (const key of keys) {
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(task);
    }
  }

  // Calculate stats for each group
  const stats: Record<
    string,
    {
      total: number;
      completed: number;
      incomplete: number;
      overdue: number;
    }
  > = {};

  for (const [name, groupTasks] of groups.entries()) {
    const completed = groupTasks.filter((t) => t.completed).length;
    const incomplete = groupTasks.length - completed;
    const overdue = groupTasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < new Date(),
    ).length;

    stats[name] = {
      total: groupTasks.length,
      completed,
      incomplete,
      overdue,
    };
  }

  return {
    groupedBy: groupBy,
    groups: stats,
  };
}

/**
 * Group tasks by a field and count them
 */
function groupBy(tasks: Task[], field: keyof Task): Record<string, number> {
  const groups: Record<string, number> = {};

  for (const task of tasks) {
    const value = task[field];
    const key = value !== undefined ? String(value) : '(none)';

    if (!groups[key]) {
      groups[key] = 0;
    }
    groups[key]++;
  }

  return groups;
}
