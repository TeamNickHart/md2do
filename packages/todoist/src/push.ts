import type { TodoistClient } from './client.js';
import type { DocumentTree, DocumentTask } from '@md2do/core';
import { md2doToTodoistPriority, extractTaskContent } from './mapper.js';

export interface PushResult {
  projectId: string;
  projectName: string;
  sectionIds: Map<number, string>;
  taskCount: number;
  sectionCount: number;
}

function buildTaskParams(
  task: DocumentTask,
  projectId: string,
  sectionId?: string,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    content: extractTaskContent(task.content),
    projectId,
    priority: md2doToTodoistPriority(task.priority),
  };

  if (sectionId) {
    params.sectionId = sectionId;
  }

  if (task.tags.length > 0) {
    params.labels = task.tags;
  }

  if (task.dueDate) {
    const year = task.dueDate.getUTCFullYear();
    const month = String(task.dueDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(task.dueDate.getUTCDate()).padStart(2, '0');
    params.dueDate = `${year}-${month}-${day}`;
  }

  return params;
}

export async function pushDocument(
  client: TodoistClient,
  tree: DocumentTree,
): Promise<PushResult> {
  if (tree.projectTodoistId) {
    throw new Error(
      `This document already has a Todoist project ID: ${tree.projectTodoistId}. ` +
        'Remove the {todoist:ID} from the H1 heading to push again.',
    );
  }

  const projectName = tree.projectName || tree.file;

  // Create project
  const project = await client.addProject({ name: projectName });
  const projectId = project.id;

  let taskCount = 0;
  const sectionIds = new Map<number, string>();

  // Create root tasks (no section)
  for (const task of tree.rootTasks) {
    if (task.completed) continue;
    await client.createTask(buildTaskParams(task, projectId));
    taskCount++;
  }

  // Create sections and their tasks
  for (let i = 0; i < tree.sections.length; i++) {
    const section = tree.sections[i]!;

    const todoistSection = await client.addSection({
      name: section.name,
      projectId,
      order: i + 1,
    });
    sectionIds.set(section.headingLine, todoistSection.id);

    for (const task of section.tasks) {
      if (task.completed) continue;
      await client.createTask(
        buildTaskParams(task, projectId, todoistSection.id),
      );
      taskCount++;
    }
  }

  return {
    projectId,
    projectName,
    sectionIds,
    taskCount,
    sectionCount: tree.sections.length,
  };
}
