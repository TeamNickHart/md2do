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
    todoistId?: string;
    completedDate?: string; // ISO string
    contextDate?: string; // ISO string
    contextHeading?: string;
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
      ...(task.todoistId && { todoistId: task.todoistId }),
      ...(task.completedDate && {
        completedDate: task.completedDate.toISOString(),
      }),
      ...(task.contextDate && {
        contextDate: task.contextDate.toISOString(),
      }),
      ...(task.contextHeading && { contextHeading: task.contextHeading }),
    })),
    metadata: {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      incomplete: tasks.filter((t) => !t.completed).length,
    },
  };

  return JSON.stringify(output, null, 2);
}
