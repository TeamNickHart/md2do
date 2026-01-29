import * as vscode from 'vscode';
import { type Task } from '@md2do/core';
import { scanWorkspace } from '../utils/scanner.js';

interface DashboardData {
  stats: {
    total: number;
    complete: number;
    incomplete: number;
    overdue: number;
    dueToday: number;
  };
  byAssignee: GroupedTasks[];
  byDueDate: GroupedTasks[];
  byPriority: GroupedTasks[];
}

interface GroupedTasks {
  label: string;
  count: number;
  tasks: Task[];
  icon?: string;
}

/**
 * Provides the dashboard webview panel
 */
export class DashboardProvider {
  private panel: vscode.WebviewPanel | undefined;
  private extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }

  /**
   * Show or focus the dashboard panel
   */
  async show(): Promise<void> {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      await this.refresh();
      return;
    }

    // Create new panel
    this.panel = vscode.window.createWebviewPanel(
      'md2doDashboard',
      'md2do Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this.extensionUri],
      },
    );

    // Set icon
    this.panel.iconPath = {
      light: vscode.Uri.joinPath(this.extensionUri, 'icon.png'),
      dark: vscode.Uri.joinPath(this.extensionUri, 'icon.png'),
    };

    // Handle messages from webview
    this.panel.webview.onDidReceiveMessage(
      async (message: { command: string; data?: unknown }) => {
        await this.handleMessage(message);
      },
      undefined,
      [],
    );

    // Clean up when panel is closed
    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    // Initial render
    await this.refresh();
  }

  /**
   * Refresh dashboard data
   */
  async refresh(): Promise<void> {
    if (!this.panel) {
      return;
    }

    const data = await this.aggregateData();
    this.panel.webview.html = this.getHtmlContent(data);
  }

  /**
   * Dispose of the dashboard
   */
  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
    }
  }

  /**
   * Aggregate task data for dashboard
   */
  private async aggregateData(): Promise<DashboardData> {
    const result = await scanWorkspace();
    const tasks = result.tasks;
    const incompleteTasks = tasks.filter((t) => !t.completed);

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = incompleteTasks.filter(
      (t) => t.dueDate && t.dueDate < today,
    );
    const dueTodayTasks = incompleteTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    const stats = {
      total: tasks.length,
      complete: tasks.filter((t) => t.completed).length,
      incomplete: incompleteTasks.length,
      overdue: overdueTasks.length,
      dueToday: dueTodayTasks.length,
    };

    // Group by assignee
    const byAssignee = this.groupByAssignee(incompleteTasks);

    // Group by due date
    const byDueDate = this.groupByDueDate(incompleteTasks, today);

    // Group by priority
    const byPriority = this.groupByPriority(incompleteTasks);

    return {
      stats,
      byAssignee,
      byDueDate,
      byPriority,
    };
  }

  /**
   * Group tasks by assignee
   */
  private groupByAssignee(tasks: Task[]): GroupedTasks[] {
    const groups = new Map<string, Task[]>();

    for (const task of tasks) {
      const assignee = task.assignee || '(none)';
      if (!groups.has(assignee)) {
        groups.set(assignee, []);
      }
      groups.get(assignee)!.push(task);
    }

    return Array.from(groups.entries())
      .map(([label, taskList]) => ({
        label,
        count: taskList.length,
        tasks: taskList,
        icon: '👤',
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group tasks by due date
   */
  private groupByDueDate(tasks: Task[], today: Date): GroupedTasks[] {
    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];
    const noDate: Task[] = [];

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    for (const task of tasks) {
      if (!task.dueDate) {
        noDate.push(task);
        continue;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        dueToday.push(task);
      } else if (dueDate <= endOfWeek) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    }

    return [
      {
        label: 'Overdue',
        count: overdue.length,
        tasks: overdue,
        icon: '⚠️',
      },
      { label: 'Today', count: dueToday.length, tasks: dueToday, icon: '📅' },
      {
        label: 'This Week',
        count: thisWeek.length,
        tasks: thisWeek,
        icon: '📆',
      },
      { label: 'Later', count: later.length, tasks: later, icon: '📋' },
      { label: 'No Date', count: noDate.length, tasks: noDate, icon: '❓' },
    ].filter((group) => group.count > 0);
  }

  /**
   * Group tasks by priority
   */
  private groupByPriority(tasks: Task[]): GroupedTasks[] {
    const urgent: Task[] = [];
    const high: Task[] = [];
    const normal: Task[] = [];
    const low: Task[] = [];

    for (const task of tasks) {
      switch (task.priority) {
        case 'urgent':
          urgent.push(task);
          break;
        case 'high':
          high.push(task);
          break;
        case 'normal':
          normal.push(task);
          break;
        case 'low':
          low.push(task);
          break;
        default:
          // Tasks with no priority go into normal
          normal.push(task);
      }
    }

    return [
      { label: 'Urgent', count: urgent.length, tasks: urgent, icon: '🔴' },
      { label: 'High', count: high.length, tasks: high, icon: '🟠' },
      { label: 'Normal', count: normal.length, tasks: normal, icon: '🟡' },
      { label: 'Low', count: low.length, tasks: low, icon: '🟢' },
    ].filter((group) => group.count > 0);
  }

  /**
   * Handle messages from webview
   */
  private async handleMessage(message: {
    command: string;
    data?: unknown;
  }): Promise<void> {
    switch (message.command) {
      case 'refresh':
        await this.refresh();
        break;

      case 'navigateToTask': {
        const task = message.data as Task;
        await this.navigateToTask(task);
        break;
      }

      case 'showDetail': {
        const payload = message.data as { group: string; tasks: Task[] };
        this.showDetailView(payload.group, payload.tasks);
        break;
      }
    }
  }

  /**
   * Navigate to a task in the editor
   */
  private async navigateToTask(task: Task): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || !task.file) {
      return;
    }

    const rootPath = workspaceFolders[0]!.uri.fsPath;
    const absolutePath = vscode.Uri.file(`${rootPath}/${task.file}`);

    try {
      const document = await vscode.workspace.openTextDocument(absolutePath);
      const editor = await vscode.window.showTextDocument(document);

      // Navigate to the task line
      const line = task.line ? task.line - 1 : 0;
      const position = new vscode.Position(line, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter,
      );
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Failed to open file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Show detail view for a group of tasks
   */
  private showDetailView(group: string, tasks: Task[]): void {
    if (!this.panel) {
      return;
    }

    this.panel.webview.html = this.getDetailViewHtml(group, tasks);
  }

  /**
   * Generate HTML for the dashboard
   */
  private getHtmlContent(data: DashboardData): string {
    const { stats, byAssignee, byDueDate, byPriority } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>md2do Dashboard</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>📊 Task Dashboard</h1>
      <button class="refresh-button" onclick="refresh()">↻ Refresh</button>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total Tasks</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.complete}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.incomplete}</div>
        <div class="stat-label">Incomplete</div>
      </div>
      ${
        stats.overdue > 0
          ? `
      <div class="stat-card warning">
        <div class="stat-value">⚠️ ${stats.overdue}</div>
        <div class="stat-label">Overdue</div>
      </div>
      `
          : ''
      }
      ${
        stats.dueToday > 0
          ? `
      <div class="stat-card highlight">
        <div class="stat-value">📅 ${stats.dueToday}</div>
        <div class="stat-label">Due Today</div>
      </div>
      `
          : ''
      }
    </div>

    <div class="groups-container">
      <div class="group-column">
        <h2>👤 By Assignee</h2>
        ${this.renderGroupList(byAssignee, 'assignee')}
      </div>

      <div class="group-column">
        <h2>📅 By Due Date</h2>
        ${this.renderGroupList(byDueDate, 'dueDate')}
      </div>

      <div class="group-column">
        <h2>⚡ By Priority</h2>
        ${this.renderGroupList(byPriority, 'priority')}
      </div>
    </div>
  </div>

  <script>
    ${this.getScript(data)}
  </script>
</body>
</html>`;
  }

  /**
   * Render a list of groups
   */
  private renderGroupList(groups: GroupedTasks[], type: string): string {
    if (groups.length === 0) {
      return '<div class="empty-state">No tasks</div>';
    }

    return `
      <div class="group-list">
        ${groups
          .map(
            (group, index) => `
          <div class="group-item" onclick="showDetail('${type}', ${index})">
            <span class="group-icon">${group.icon}</span>
            <span class="group-label">${group.label}</span>
            <span class="group-count">${group.count}</span>
            <span class="group-arrow">▶</span>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  /**
   * Get CSS styles
   */
  private getStyles(): string {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: var(--vscode-font-family);
        color: var(--vscode-foreground);
        background: var(--vscode-editor-background);
        padding: 20px;
        font-size: var(--vscode-font-size);
      }

      .dashboard {
        max-width: 1400px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      h1 {
        font-size: 24px;
        font-weight: 600;
      }

      h2 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--vscode-foreground);
      }

      .refresh-button {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .refresh-button:hover {
        background: var(--vscode-button-hoverBackground);
      }

      .stats-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }

      .stat-card {
        background: var(--vscode-editor-inactiveSelectionBackground);
        padding: 20px;
        border-radius: 6px;
        text-align: center;
        border: 1px solid var(--vscode-panel-border);
      }

      .stat-card.warning {
        background: var(--vscode-inputValidation-warningBackground);
        border-color: var(--vscode-inputValidation-warningBorder);
      }

      .stat-card.highlight {
        background: var(--vscode-inputValidation-infoBackground);
        border-color: var(--vscode-inputValidation-infoBorder);
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 12px;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .groups-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }

      .group-column {
        background: var(--vscode-editor-inactiveSelectionBackground);
        padding: 20px;
        border-radius: 6px;
        border: 1px solid var(--vscode-panel-border);
      }

      .group-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .group-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--vscode-list-inactiveSelectionBackground);
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .group-item:hover {
        background: var(--vscode-list-hoverBackground);
      }

      .group-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .group-label {
        flex: 1;
        font-weight: 500;
      }

      .group-count {
        background: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
      }

      .group-arrow {
        opacity: 0.5;
        font-size: 12px;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        opacity: 0.5;
        font-style: italic;
      }

      .back-button {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 16px;
      }

      .back-button:hover {
        background: var(--vscode-button-secondaryHoverBackground);
      }

      .sort-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .sort-button {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      }

      .sort-button.active {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
      }

      .task-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .task-item {
        background: var(--vscode-editor-inactiveSelectionBackground);
        padding: 16px;
        border-radius: 6px;
        border: 1px solid var(--vscode-panel-border);
        cursor: pointer;
        transition: background 0.2s;
      }

      .task-item:hover {
        background: var(--vscode-list-hoverBackground);
      }

      .task-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .task-priority {
        font-size: 14px;
      }

      .task-text {
        font-weight: 500;
        font-size: 14px;
      }

      .task-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        opacity: 0.7;
        flex-wrap: wrap;
      }

      .task-meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `;
  }

  /**
   * Get JavaScript for the dashboard
   */
  private getScript(data: DashboardData): string {
    return `
      const vscode = acquireVsCodeApi();
      const dashboardData = ${JSON.stringify(data)};

      function refresh() {
        vscode.postMessage({ command: 'refresh' });
      }

      function showDetail(type, index) {
        let group, tasks;

        switch (type) {
          case 'assignee':
            group = dashboardData.byAssignee[index];
            break;
          case 'dueDate':
            group = dashboardData.byDueDate[index];
            break;
          case 'priority':
            group = dashboardData.byPriority[index];
            break;
        }

        if (group) {
          vscode.postMessage({
            command: 'showDetail',
            data: { group: group.label, tasks: group.tasks }
          });
        }
      }

      function navigateToTask(task) {
        vscode.postMessage({
          command: 'navigateToTask',
          data: task
        });
      }
    `;
  }

  /**
   * Generate HTML for detail view
   */
  private getDetailViewHtml(groupLabel: string, tasks: Task[]): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${groupLabel} Tasks</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <div class="dashboard">
    <button class="back-button" onclick="goBack()">← Back to Dashboard</button>
    <h1>${groupLabel} Tasks (${tasks.length})</h1>

    <div class="sort-controls">
      <button class="sort-button active" onclick="sortTasks('priority')">Sort by Priority</button>
      <button class="sort-button" onclick="sortTasks('dueDate')">Sort by Due Date</button>
      <button class="sort-button" onclick="sortTasks('file')">Sort by File</button>
    </div>

    <div class="task-list" id="taskList">
      ${this.renderTaskList(tasks, 'priority')}
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let allTasks = ${JSON.stringify(tasks)};
    let currentSort = 'priority';

    function goBack() {
      vscode.postMessage({ command: 'refresh' });
    }

    function sortTasks(sortBy) {
      currentSort = sortBy;

      // Update button states
      document.querySelectorAll('.sort-button').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');

      // Sort tasks
      let sorted = [...allTasks];
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          sorted.sort((a, b) => {
            const pa = priorityOrder[a.priority] ?? 2;
            const pb = priorityOrder[b.priority] ?? 2;
            return pa - pb;
          });
          break;
        case 'dueDate':
          sorted.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          });
          break;
        case 'file':
          sorted.sort((a, b) => (a.file || '').localeCompare(b.file || ''));
          break;
      }

      // Re-render task list
      document.getElementById('taskList').innerHTML = renderTaskList(sorted);
    }

    function renderTaskList(tasks) {
      return tasks.map(task => {
        const priorityIcons = {
          urgent: '🔴 !!!',
          high: '🟠 !!',
          normal: '🟡 !',
          low: '🟢'
        };
        const priorityIcon = priorityIcons[task.priority] || '';

        let dueDateStr = '';
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDateStr = dueDate.toISOString().split('T')[0];
          if (dueDate < today) {
            dueDateStr = '⚠️ ' + dueDateStr + ' (overdue)';
          }
        }

        const tags = task.tags?.map(t => '#' + t).join(' ') || '';
        const assignee = task.assignee ? '@' + task.assignee : '';

        return \`
          <div class="task-item" onclick='navigateToTask(\${JSON.stringify(task)})'>
            <div class="task-header">
              \${priorityIcon ? \`<span class="task-priority">\${priorityIcon}</span>\` : ''}
              <span class="task-text">\${task.text}</span>
            </div>
            <div class="task-meta">
              \${dueDateStr ? \`<span class="task-meta-item">📅 \${dueDateStr}</span>\` : ''}
              \${assignee ? \`<span class="task-meta-item">\${assignee}</span>\` : ''}
              \${tags ? \`<span class="task-meta-item">\${tags}</span>\` : ''}
              \${task.file ? \`<span class="task-meta-item">📄 \${task.file}:\${task.line || '?'}</span>\` : ''}
            </div>
          </div>
        \`;
      }).join('');
    }

    function navigateToTask(task) {
      vscode.postMessage({
        command: 'navigateToTask',
        data: task
      });
    }
  </script>
</body>
</html>`;
  }

  /**
   * Render task list for detail view
   */
  private renderTaskList(tasks: Task[], sortBy: string): string {
    // Sort tasks
    const sorted = [...tasks];
    switch (sortBy) {
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
      case 'dueDate':
        sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'file':
        sorted.sort((a, b) => (a.file || '').localeCompare(b.file || ''));
        break;
    }

    return sorted
      .map((task) => {
        const priorityIcons: Record<string, string> = {
          urgent: '🔴 !!!',
          high: '🟠 !!',
          normal: '🟡 !',
          low: '🟢',
        };
        const priorityIcon = priorityIcons[task.priority || ''] || '';

        let dueDateStr = '';
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDateStr = dueDate.toISOString().split('T')[0]!;
          if (dueDate < today) {
            dueDateStr = '⚠️ ' + dueDateStr + ' (overdue)';
          }
        }

        const tags = task.tags?.map((t) => '#' + t).join(' ') || '';
        const assignee = task.assignee ? '@' + task.assignee : '';

        return `
          <div class="task-item" onclick='navigateToTask(${JSON.stringify(task)})'>
            <div class="task-header">
              ${priorityIcon ? `<span class="task-priority">${priorityIcon}</span>` : ''}
              <span class="task-text">${task.text}</span>
            </div>
            <div class="task-meta">
              ${dueDateStr ? `<span class="task-meta-item">📅 ${dueDateStr}</span>` : ''}
              ${assignee ? `<span class="task-meta-item">${assignee}</span>` : ''}
              ${tags ? `<span class="task-meta-item">${tags}</span>` : ''}
              ${task.file ? `<span class="task-meta-item">📄 ${task.file}:${task.line || '?'}</span>` : ''}
            </div>
          </div>
        `;
      })
      .join('');
  }
}
