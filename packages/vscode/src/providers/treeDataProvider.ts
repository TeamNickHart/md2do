import * as vscode from 'vscode';
import type { Task } from '@md2do/core';
import { scanWorkspace } from '../utils/scanner.js';

export type GroupMode =
  | 'file'
  | 'assignee'
  | 'dueDate'
  | 'priority'
  | 'tag'
  | 'flat';
export type SortMode = 'dueDate' | 'priority' | 'alphabetical' | 'line';

type TaskTreeItem = GroupItem | TaskItem;

class GroupItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly tasks: Task[],
    public readonly icon: string,
  ) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);

    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;

    this.description = `${completed}/${total}`;
    this.contextValue = 'group';
    this.iconPath = new vscode.ThemeIcon(icon);
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
  private groupMode: GroupMode = 'file';
  private sortMode: SortMode = 'line';
  private showIncompleteOnly = false;
  private showOverdueOnly = false;
  private showAssignedOnly = false;

  /**
   * Set grouping mode
   */
  setGroupMode(mode: GroupMode): void {
    this.groupMode = mode;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Set sort mode
   */
  setSortMode(mode: SortMode): void {
    this.sortMode = mode;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Toggle incomplete only filter
   */
  toggleIncompleteOnly(): void {
    this.showIncompleteOnly = !this.showIncompleteOnly;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Toggle overdue only filter
   */
  toggleOverdueOnly(): void {
    this.showOverdueOnly = !this.showOverdueOnly;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Toggle assigned only filter
   */
  toggleAssignedOnly(): void {
    this.showAssignedOnly = !this.showAssignedOnly;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get current filter states
   */
  getFilterStates(): {
    incompleteOnly: boolean;
    overdueOnly: boolean;
    assignedOnly: boolean;
  } {
    return {
      incompleteOnly: this.showIncompleteOnly,
      overdueOnly: this.showOverdueOnly,
      assignedOnly: this.showAssignedOnly,
    };
  }

  /**
   * Refresh the tree view
   */
  async refresh(): Promise<void> {
    try {
      const scanResult = await scanWorkspace();
      this.tasks = scanResult.tasks;
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
      // Root level: apply filters and group
      const filteredTasks = this.applyFilters(this.tasks);

      if (this.groupMode === 'flat') {
        // Flat mode: return sorted tasks directly
        return this.sortTasks(filteredTasks).map((task) => new TaskItem(task));
      }

      // Group tasks
      const groups = this.groupTasks(filteredTasks);
      return groups;
    }

    if (element instanceof GroupItem) {
      // Group level: return sorted tasks
      return this.sortTasks(element.tasks).map((task) => new TaskItem(task));
    }

    return [];
  }

  /**
   * Apply filters to tasks
   */
  private applyFilters(tasks: Task[]): Task[] {
    let filtered = tasks;

    if (this.showIncompleteOnly) {
      filtered = filtered.filter((t) => !t.completed);
    }

    if (this.showOverdueOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(
        (t) => !t.completed && t.dueDate && t.dueDate < today,
      );
    }

    if (this.showAssignedOnly) {
      filtered = filtered.filter((t) => t.assignee);
    }

    return filtered;
  }

  /**
   * Group tasks based on current group mode
   */
  private groupTasks(tasks: Task[]): GroupItem[] {
    const groups: Map<string, Task[]> = new Map();

    switch (this.groupMode) {
      case 'file':
        for (const task of tasks) {
          const key = task.file;
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key)!.push(task);
        }
        return Array.from(groups.entries())
          .map(([label, taskList]) => new GroupItem(label, taskList, 'file'))
          .sort((a, b) => a.label.localeCompare(b.label));

      case 'assignee':
        for (const task of tasks) {
          const key = task.assignee || '(unassigned)';
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key)!.push(task);
        }
        return Array.from(groups.entries())
          .map(([label, taskList]) => new GroupItem(label, taskList, 'person'))
          .sort((a, b) => {
            // Sort unassigned last
            if (a.label === '(unassigned)') return 1;
            if (b.label === '(unassigned)') return -1;
            return a.label.localeCompare(b.label);
          });

      case 'dueDate': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const overdueGroup: Task[] = [];
        const todayGroup: Task[] = [];
        const thisWeekGroup: Task[] = [];
        const laterGroup: Task[] = [];
        const noDateGroup: Task[] = [];

        for (const task of tasks) {
          if (!task.dueDate) {
            noDateGroup.push(task);
            continue;
          }

          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate < today) {
            overdueGroup.push(task);
          } else if (dueDate.getTime() === today.getTime()) {
            todayGroup.push(task);
          } else if (dueDate <= endOfWeek) {
            thisWeekGroup.push(task);
          } else {
            laterGroup.push(task);
          }
        }

        const result: GroupItem[] = [];
        if (overdueGroup.length > 0) {
          result.push(new GroupItem('⚠️ Overdue', overdueGroup, 'warning'));
        }
        if (todayGroup.length > 0) {
          result.push(new GroupItem('📅 Today', todayGroup, 'calendar'));
        }
        if (thisWeekGroup.length > 0) {
          result.push(new GroupItem('📆 This Week', thisWeekGroup, 'calendar'));
        }
        if (laterGroup.length > 0) {
          result.push(new GroupItem('📋 Later', laterGroup, 'inbox'));
        }
        if (noDateGroup.length > 0) {
          result.push(new GroupItem('❓ No Date', noDateGroup, 'question'));
        }
        return result;
      }

      case 'priority': {
        const urgentGroup: Task[] = [];
        const highGroup: Task[] = [];
        const normalGroup: Task[] = [];
        const lowGroup: Task[] = [];

        for (const task of tasks) {
          switch (task.priority) {
            case 'urgent':
              urgentGroup.push(task);
              break;
            case 'high':
              highGroup.push(task);
              break;
            case 'low':
              lowGroup.push(task);
              break;
            default:
              normalGroup.push(task);
          }
        }

        const result: GroupItem[] = [];
        if (urgentGroup.length > 0) {
          result.push(new GroupItem('🔴 Urgent', urgentGroup, 'flame'));
        }
        if (highGroup.length > 0) {
          result.push(new GroupItem('🟠 High', highGroup, 'arrow-up'));
        }
        if (normalGroup.length > 0) {
          result.push(new GroupItem('🟡 Normal', normalGroup, 'dash'));
        }
        if (lowGroup.length > 0) {
          result.push(new GroupItem('🟢 Low', lowGroup, 'arrow-down'));
        }
        return result;
      }

      case 'tag': {
        const tagMap: Map<string, Task[]> = new Map();
        const noTagTasks: Task[] = [];

        for (const task of tasks) {
          if (!task.tags || task.tags.length === 0) {
            noTagTasks.push(task);
            continue;
          }

          for (const tag of task.tags) {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, []);
            }
            tagMap.get(tag)!.push(task);
          }
        }

        const result: GroupItem[] = Array.from(tagMap.entries())
          .map(
            ([label, taskList]) => new GroupItem(`#${label}`, taskList, 'tag'),
          )
          .sort((a, b) => a.label.localeCompare(b.label));

        if (noTagTasks.length > 0) {
          result.push(new GroupItem('(no tags)', noTagTasks, 'question'));
        }

        return result;
      }

      default:
        return [];
    }
  }

  /**
   * Sort tasks based on current sort mode
   */
  private sortTasks(tasks: Task[]): Task[] {
    const sorted = [...tasks];

    switch (this.sortMode) {
      case 'dueDate':
        sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        break;

      case 'priority': {
        const priorityOrder: Record<string, number> = {
          urgent: 0,
          high: 1,
          normal: 2,
          low: 3,
        };
        sorted.sort((a, b) => {
          const pa = priorityOrder[a.priority || 'normal'] ?? 2;
          const pb = priorityOrder[b.priority || 'normal'] ?? 2;
          return pa - pb;
        });
        break;
      }

      case 'alphabetical':
        sorted.sort((a, b) => a.text.localeCompare(b.text));
        break;

      case 'line':
        sorted.sort((a, b) => (a.line || 0) - (b.line || 0));
        break;
    }

    return sorted;
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return this.tasks;
  }
}
