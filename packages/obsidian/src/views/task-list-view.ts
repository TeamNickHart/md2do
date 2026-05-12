import { ItemView, WorkspaceLeaf, Menu, TFile, setIcon } from 'obsidian';
import type { Task } from '@md2do/core';
import { filters, sorting } from '@md2do/core';
import type Md2doPlugin from '../main';
import type { GroupMode, SortMode } from '../settings';
import { toggleTaskCompletion } from '../utils/task-writer';

export const TASK_LIST_VIEW_TYPE = 'md2do-task-list';

interface TaskGroup {
  label: string;
  tasks: Task[];
  collapsed: boolean;
}

export class TaskListView extends ItemView {
  plugin: Md2doPlugin;
  private groupMode: GroupMode;
  private sortMode: SortMode;
  private showIncompleteOnly = false;
  private showOverdueOnly = false;
  private contentEl_: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: Md2doPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.groupMode = plugin.settings.defaultGroupMode;
    this.sortMode = plugin.settings.defaultSortMode;
    this.showIncompleteOnly = !plugin.settings.showCompletedTasks;
  }

  getViewType(): string {
    return TASK_LIST_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'md2do Tasks';
  }

  getIcon(): string {
    return 'check-square';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('md2do-task-list');

    this.renderToolbar(container);

    this.contentEl_ = container.createDiv({ cls: 'md2do-task-content' });

    this.renderTasks();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onClose(): Promise<void> {
    this.contentEl_ = null;
  }

  refresh(): void {
    if (this.contentEl_) {
      this.renderTasks();
    }
  }

  private renderToolbar(container: HTMLElement): void {
    const toolbar = container.createDiv({ cls: 'md2do-toolbar' });

    // Group mode dropdown
    const groupBtn = toolbar.createEl('button', {
      cls: 'md2do-toolbar-btn',
      attr: { 'aria-label': 'Group by' },
    });
    setIcon(groupBtn, 'layout-list');
    groupBtn.addEventListener('click', (e) => {
      const menu = new Menu();
      const modes: Array<{ mode: GroupMode; label: string }> = [
        { mode: 'file', label: 'By File' },
        { mode: 'assignee', label: 'By Assignee' },
        { mode: 'priority', label: 'By Priority' },
        { mode: 'dueDate', label: 'By Due Date' },
        { mode: 'tag', label: 'By Tag' },
        { mode: 'flat', label: 'Flat List' },
      ];
      for (const { mode, label } of modes) {
        menu.addItem((item) =>
          item
            .setTitle(label)
            .setChecked(this.groupMode === mode)
            .onClick(() => {
              this.groupMode = mode;
              this.renderTasks();
            }),
        );
      }
      menu.showAtMouseEvent(e);
    });

    // Sort mode dropdown
    const sortBtn = toolbar.createEl('button', {
      cls: 'md2do-toolbar-btn',
      attr: { 'aria-label': 'Sort by' },
    });
    setIcon(sortBtn, 'arrow-up-down');
    sortBtn.addEventListener('click', (e) => {
      const menu = new Menu();
      const modes: Array<{ mode: SortMode; label: string }> = [
        { mode: 'dueDate', label: 'Due Date' },
        { mode: 'priority', label: 'Priority' },
        { mode: 'alphabetical', label: 'Alphabetically' },
        { mode: 'line', label: 'Line Number' },
      ];
      for (const { mode, label } of modes) {
        menu.addItem((item) =>
          item
            .setTitle(label)
            .setChecked(this.sortMode === mode)
            .onClick(() => {
              this.sortMode = mode;
              this.renderTasks();
            }),
        );
      }
      menu.showAtMouseEvent(e);
    });

    toolbar.createDiv({ cls: 'md2do-toolbar-separator' });

    // Filter: incomplete only
    const incompleteBtn = toolbar.createEl('button', {
      cls: 'md2do-toolbar-btn',
      attr: { 'aria-label': 'Show incomplete only' },
    });
    setIcon(incompleteBtn, 'circle');
    if (this.showIncompleteOnly) incompleteBtn.addClass('is-active');
    incompleteBtn.addEventListener('click', () => {
      this.showIncompleteOnly = !this.showIncompleteOnly;
      incompleteBtn.toggleClass('is-active', this.showIncompleteOnly);
      this.renderTasks();
    });

    // Filter: overdue only
    const overdueBtn = toolbar.createEl('button', {
      cls: 'md2do-toolbar-btn',
      attr: { 'aria-label': 'Show overdue only' },
    });
    setIcon(overdueBtn, 'alert-triangle');
    if (this.showOverdueOnly) overdueBtn.addClass('is-active');
    overdueBtn.addEventListener('click', () => {
      this.showOverdueOnly = !this.showOverdueOnly;
      overdueBtn.toggleClass('is-active', this.showOverdueOnly);
      this.renderTasks();
    });

    toolbar.createDiv({ cls: 'md2do-toolbar-separator' });

    // Refresh button
    const refreshBtn = toolbar.createEl('button', {
      cls: 'md2do-toolbar-btn',
      attr: { 'aria-label': 'Refresh tasks' },
    });
    setIcon(refreshBtn, 'refresh-cw');
    refreshBtn.addEventListener('click', () => {
      void this.plugin.refreshTasks();
    });
  }

  private renderTasks(): void {
    if (!this.contentEl_) return;
    this.contentEl_.empty();

    let tasks = [...this.plugin.tasks];

    // Apply filters
    if (this.showIncompleteOnly) {
      tasks = tasks.filter(filters.byCompleted(false));
    }
    if (this.showOverdueOnly) {
      tasks = tasks.filter(filters.isOverdue());
    }

    // Apply sorting
    tasks.sort(this.getComparator());

    if (tasks.length === 0) {
      this.contentEl_.createDiv({
        cls: 'md2do-empty-state',
        text: 'No tasks found',
      });
      return;
    }

    // Group and render
    if (this.groupMode === 'flat') {
      this.renderTaskList(this.contentEl_, tasks);
    } else {
      const groups = this.groupTasks(tasks);
      for (const group of groups) {
        this.renderGroup(this.contentEl_, group);
      }
    }
  }

  private getComparator(): (a: Task, b: Task) => number {
    switch (this.sortMode) {
      case 'dueDate':
        return sorting.byDueDate();
      case 'priority':
        return sorting.byPriority();
      case 'alphabetical':
        return (a, b) => a.text.localeCompare(b.text);
      case 'line':
        return sorting.byFile();
      default:
        return sorting.byDueDate();
    }
  }

  private groupTasks(tasks: Task[]): TaskGroup[] {
    const groupMap = new Map<string, Task[]>();

    for (const task of tasks) {
      let key: string;
      switch (this.groupMode) {
        case 'file':
          key = task.file;
          break;
        case 'assignee':
          key = task.assignee || 'Unassigned';
          break;
        case 'priority':
          key = task.priority || 'normal';
          break;
        case 'dueDate':
          key = this.getDueDateGroupLabel(task);
          break;
        case 'tag':
          if (task.tags.length === 0) {
            key = 'No Tags';
          } else {
            // Add task to each tag group
            for (const tag of task.tags) {
              const tagKey = `#${tag}`;
              if (!groupMap.has(tagKey)) {
                groupMap.set(tagKey, []);
              }
              groupMap.get(tagKey)!.push(task);
            }
            continue; // Skip the default push below
          }
          break;
        default:
          key = task.file;
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(task);
    }

    return Array.from(groupMap.entries()).map(([label, groupTasks]) => ({
      label,
      tasks: groupTasks,
      collapsed: false,
    }));
  }

  private getDueDateGroupLabel(task: Task): string {
    if (!task.dueDate) return 'No Due Date';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(
      task.dueDate.getFullYear(),
      task.dueDate.getMonth(),
      task.dueDate.getDate(),
    );

    const diffDays = Math.floor(
      (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 30) return 'This Month';
    return 'Later';
  }

  private renderGroup(container: HTMLElement, group: TaskGroup): void {
    const groupEl = container.createDiv({ cls: 'md2do-group' });

    const header = groupEl.createDiv({
      cls: `md2do-group-header${group.collapsed ? ' is-collapsed' : ''}`,
    });

    const collapseIcon = header.createSpan({
      cls: 'md2do-group-collapse-icon',
    });
    setIcon(collapseIcon, 'chevron-down');

    header.createSpan({ text: group.label });
    header.createSpan({
      cls: 'md2do-group-count',
      text: String(group.tasks.length),
    });

    const taskContainer = groupEl.createDiv({ cls: 'md2do-group-tasks' });

    if (!group.collapsed) {
      this.renderTaskList(taskContainer, group.tasks);
    }

    header.addEventListener('click', () => {
      group.collapsed = !group.collapsed;
      header.toggleClass('is-collapsed', group.collapsed);
      taskContainer.empty();
      if (!group.collapsed) {
        this.renderTaskList(taskContainer, group.tasks);
      }
    });
  }

  private renderTaskList(container: HTMLElement, tasks: Task[]): void {
    for (const task of tasks) {
      this.renderTaskItem(container, task);
    }
  }

  private renderTaskItem(container: HTMLElement, task: Task): void {
    const item = container.createDiv({
      cls: `md2do-task-item${task.completed ? ' is-completed' : ''}`,
    });

    // Checkbox
    const checkbox = item.createEl('input', {
      cls: 'md2do-task-checkbox',
      type: 'checkbox',
      attr: { ...(task.completed ? { checked: '' } : {}) },
    });
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      const file = this.app.vault.getAbstractFileByPath(task.file);
      if (file instanceof TFile) {
        void toggleTaskCompletion(this.app, file, task.line).then(() =>
          this.plugin.refreshTasks(),
        );
      }
    });

    // Text
    const textEl = item.createDiv({ cls: 'md2do-task-text' });
    textEl.createSpan({ text: task.text });

    // File location (when not grouped by file)
    if (this.groupMode !== 'file') {
      textEl.createDiv({
        cls: 'md2do-task-file',
        text: `${task.file}:${task.line}`,
      });
    }

    // Metadata
    const meta = item.createDiv({ cls: 'md2do-task-meta' });

    if (task.priority && task.priority !== 'normal') {
      meta.createSpan({
        cls: `md2do-priority md2do-priority-${task.priority}`,
        text:
          task.priority === 'urgent'
            ? '!!!'
            : task.priority === 'high'
              ? '!!'
              : '!',
      });
    }

    if (task.assignee) {
      meta.createSpan({
        cls: 'md2do-assignee',
        text: `@${task.assignee}`,
      });
    }

    if (task.dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isOverdue = !task.completed && task.dueDate < today;
      const isToday =
        task.dueDate.getFullYear() === today.getFullYear() &&
        task.dueDate.getMonth() === today.getMonth() &&
        task.dueDate.getDate() === today.getDate();

      const dateStr = task.dueDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      meta.createSpan({
        cls: `md2do-due-date${isOverdue ? ' is-overdue' : isToday ? ' is-due-today' : ''}`,
        text: dateStr,
      });
    }

    for (const tag of task.tags.slice(0, 3)) {
      meta.createSpan({
        cls: 'md2do-tag',
        text: `#${tag}`,
      });
    }

    // Click to navigate to task
    item.addEventListener('click', () => {
      const file = this.app.vault.getAbstractFileByPath(task.file);
      if (file instanceof TFile) {
        const leaf = this.app.workspace.getLeaf(false);
        void leaf.openFile(file).then(() => {
          const editor = this.app.workspace.activeEditor?.editor;
          if (editor) {
            const pos = { line: task.line - 1, ch: 0 };
            editor.setCursor(pos);
            editor.scrollIntoView({ from: pos, to: pos }, true);
          }
        });
      }
    });
  }
}
