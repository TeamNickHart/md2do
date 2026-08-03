import type { SourceProvider, SourceTask, FetchOptions } from '@md2do/core';
import { todoistToMd2doPriority } from './mapper.js';
import type { TodoistClient } from './client.js';

/**
 * Todoist implementation of the SourceProvider interface
 */
export class TodoistProvider implements SourceProvider {
  readonly slug = 'todoist';
  readonly name = 'Todoist';

  constructor(private client: TodoistClient) {}

  async fetchTasks(options?: FetchOptions): Promise<SourceTask[]> {
    const todoistTasks = await this.client.getTasks(
      options?.filter as { projectId?: string; labelId?: string } | undefined,
    );

    return todoistTasks.map((task) => {
      const sourceTask: SourceTask = {
        externalId: task.id,
        text: task.content,
        completed: task.isCompleted ?? false,
      };

      const priority = todoistToMd2doPriority(task.priority);
      if (
        priority === 'urgent' ||
        priority === 'high' ||
        priority === 'normal' ||
        priority === 'low'
      ) {
        sourceTask.priority = priority;
      }

      if (task.due?.date) sourceTask.dueDate = task.due.date;

      if (task.labels.length > 0) sourceTask.tags = task.labels;

      return sourceTask;
    });
  }

  async completeTask(externalId: string): Promise<void> {
    await this.client.completeTask(externalId);
  }

  async reopenTask(externalId: string): Promise<void> {
    await this.client.reopenTask(externalId);
  }
}
