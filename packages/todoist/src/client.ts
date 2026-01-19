import { TodoistApi } from '@doist/todoist-api-typescript';
import type { Task, Project, Label } from '@doist/todoist-api-typescript';
import type { TodoistTaskParams } from './mapper.js';

/**
 * Configuration for Todoist client
 */
export interface TodoistClientConfig {
  apiToken: string;
}

/**
 * Wrapper around Todoist API with error handling and convenience methods
 */
export class TodoistClient {
  private api: TodoistApi;

  constructor(config: TodoistClientConfig) {
    this.api = new TodoistApi(config.apiToken);
  }

  /**
   * Get all active tasks
   */
  async getTasks(options?: {
    projectId?: string;
    labelId?: string;
  }): Promise<Task[]> {
    try {
      return await this.api.getTasks(options);
    } catch (error) {
      throw new Error(
        `Failed to get tasks: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    try {
      return await this.api.getTask(taskId);
    } catch (error) {
      throw new Error(
        `Failed to get task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new task
   */
  async createTask(
    params: TodoistTaskParams | Record<string, unknown>,
  ): Promise<Task> {
    try {
      return await this.api.addTask(params as TodoistTaskParams);
    } catch (error) {
      throw new Error(
        `Failed to create task: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    params: Partial<TodoistTaskParams>,
  ): Promise<Task> {
    try {
      return await this.api.updateTask(taskId, params);
    } catch (error) {
      throw new Error(
        `Failed to update task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string): Promise<boolean> {
    try {
      return await this.api.closeTask(taskId);
    } catch (error) {
      throw new Error(
        `Failed to complete task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Reopen a completed task
   */
  async reopenTask(taskId: string): Promise<boolean> {
    try {
      return await this.api.reopenTask(taskId);
    } catch (error) {
      throw new Error(
        `Failed to reopen task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      return await this.api.deleteTask(taskId);
    } catch (error) {
      throw new Error(
        `Failed to delete task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      return await this.api.getProjects();
    } catch (error) {
      throw new Error(
        `Failed to get projects: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    try {
      return await this.api.getProject(projectId);
    } catch (error) {
      throw new Error(
        `Failed to get project ${projectId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find project by name
   */
  async findProjectByName(name: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return (
      projects.find((p) => p.name.toLowerCase() === name.toLowerCase()) ?? null
    );
  }

  /**
   * Get all labels
   */
  async getLabels(): Promise<Label[]> {
    try {
      return await this.api.getLabels();
    } catch (error) {
      throw new Error(
        `Failed to get labels: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a label if it doesn't exist
   */
  async ensureLabel(name: string): Promise<Label> {
    const labels = await this.getLabels();
    const existing = labels.find(
      (l) => l.name.toLowerCase() === name.toLowerCase(),
    );

    if (existing) {
      return existing;
    }

    try {
      return await this.api.addLabel({ name });
    } catch (error) {
      throw new Error(
        `Failed to create label ${name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Test the API connection
   */
  async test(): Promise<boolean> {
    try {
      await this.getProjects();
      return true;
    } catch {
      return false;
    }
  }
}
