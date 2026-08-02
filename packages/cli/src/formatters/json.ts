import type { Task } from '@md2do/core';

export interface JsonOutput {
  tasks: Array<{
    id: string;
    text: string;
    completed: boolean;
    file: string;
    line: number;
    project?: string;
    person?: string;
    assignee?: string;
    priority?: string;
    dueDate?: string; // ISO string
    tags: string[];
    sources?: Record<string, string>;
    completedDate?: string; // ISO string
  }>;
  metadata: {
    total: number;
    completed: number;
    incomplete: number;
  };
}

/**
 * Format tasks as JSON
 *
 * @param tasks - Tasks to format
 * @returns JSON-formatted string
 */
export function formatAsJson(tasks: Task[]): string {
  const output: JsonOutput = {
    tasks: tasks.map((task) => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      file: task.file,
      line: task.line,
      ...(task.project && { project: task.project }),
      ...(task.person && { person: task.person }),
      ...(task.assignee && { assignee: task.assignee }),
      ...(task.priority && { priority: task.priority }),
      ...(task.dueDate && { dueDate: task.dueDate.toISOString() }),
      tags: task.tags,
      ...(task.sources && { sources: task.sources }),
      ...(task.completedDate && {
        completedDate: task.completedDate.toISOString(),
      }),
    })),
    metadata: {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      incomplete: tasks.filter((t) => !t.completed).length,
    },
  };

  return JSON.stringify(output, null, 2);
}
