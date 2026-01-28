import * as vscode from 'vscode';
import type { Task } from '@md2do/core';
import { scanWorkspace } from '../utils/scanner.js';

type TaskTreeItem = FileItem | TaskItem;

class FileItem extends vscode.TreeItem {
  constructor(
    public readonly filePath: string,
    public readonly tasks: Task[],
  ) {
    super(filePath, vscode.TreeItemCollapsibleState.Expanded);

    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;

    this.description = `${completed}/${total} completed`;
    this.contextValue = 'file';
    this.iconPath = new vscode.ThemeIcon('file');
  }
}

class TaskItem extends vscode.TreeItem {
  constructor(public readonly task: Task) {
    super(task.text, vscode.TreeItemCollapsibleState.None);

    // Set icon based on completion status
    this.iconPath = new vscode.ThemeIcon(
      task.completed ? 'check' : 'circle-outline',
    );

    // Build description from metadata
    const parts: string[] = [];

    if (task.priority) {
      const priorityMap = { urgent: 3, high: 2, normal: 1, low: 1 };
      parts.push('!'.repeat(priorityMap[task.priority] || 1));
    }

    if (task.dueDate) {
      const dateStr = task.dueDate.toISOString().split('T')[0];
      parts.push(`📅 ${dateStr}`);
    }

    if (task.assignee) {
      parts.push(`@${task.assignee}`);
    }

    if (task.tags && task.tags.length > 0) {
      parts.push(task.tags.map((t) => `#${t}`).join(' '));
    }

    this.description = parts.join(' ');
    this.contextValue = task.completed ? 'completedTask' : 'incompleteTask';

    // Set up command to jump to task location
    this.command = {
      command: 'md2do.goToTask',
      title: 'Go to Task',
      arguments: [task],
    };

    // Add tooltip with full task details
    this.tooltip = this.buildTooltip();
  }

  private buildTooltip(): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${this.task.text}**\n\n`);

    if (this.task.dueDate) {
      const dateStr = this.task.dueDate.toISOString().split('T')[0];
      md.appendMarkdown(`📅 Due: ${dateStr}\n\n`);
    }

    if (this.task.assignee) {
      md.appendMarkdown(`👤 Assignee: @${this.task.assignee}\n\n`);
    }

    if (this.task.priority) {
      md.appendMarkdown(`⚡ Priority: ${this.task.priority}\n\n`);
    }

    if (this.task.tags && this.task.tags.length > 0) {
      md.appendMarkdown(
        `🏷️ Tags: ${this.task.tags.map((t) => `#${t}`).join(', ')}\n\n`,
      );
    }

    if (this.task.completed && this.task.completedDate) {
      const dateStr = this.task.completedDate.toISOString().split('T')[0];
      md.appendMarkdown(`✅ Completed: ${dateStr}\n\n`);
    }

    md.appendMarkdown(`📄 ${this.task.file}:${this.task.line}`);

    return md;
  }
}

export class TaskTreeDataProvider implements vscode.TreeDataProvider<TaskTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TaskTreeItem | undefined | null | void
  > = new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TaskTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private tasks: Task[] = [];
  private tasksByFile: Map<string, Task[]> = new Map();

  /**
   * Refresh the tree view
   */
  async refresh(): Promise<void> {
    try {
      const scanResult = await scanWorkspace();
      this.tasks = scanResult.tasks;

      // Group tasks by file
      this.tasksByFile.clear();
      for (const task of this.tasks) {
        const tasks = this.tasksByFile.get(task.file) || [];
        tasks.push(task);
        this.tasksByFile.set(task.file, tasks);
      }

      this._onDidChangeTreeData.fire();
    } catch (error) {
      console.error('Error refreshing task tree:', error);
    }
  }

  /**
   * Get tree item for display
   */
  getTreeItem(element: TaskTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children of a tree element
   */
  getChildren(element?: TaskTreeItem): TaskTreeItem[] {
    if (!element) {
      // Root level: return files
      const files: FileItem[] = [];
      for (const [filePath, tasks] of this.tasksByFile) {
        files.push(new FileItem(filePath, tasks));
      }
      return files.sort((a, b) => a.filePath.localeCompare(b.filePath));
    }

    if (element instanceof FileItem) {
      // File level: return tasks
      return element.tasks
        .map((task) => new TaskItem(task))
        .sort((a, b) => a.task.line - b.task.line);
    }

    return [];
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return this.tasks;
  }
}
