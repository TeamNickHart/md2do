import * as vscode from 'vscode';
import { parseTask } from '@md2do/core';

/**
 * Provides inline CodeLens actions for tasks
 */
export class TaskCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  /**
   * Refresh all code lenses
   */
  refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(
    document: vscode.TextDocument,
  ): vscode.CodeLens[] | undefined {
    const codeLenses: vscode.CodeLens[] = [];

    // Only process markdown files
    if (document.languageId !== 'markdown') {
      return undefined;
    }

    // Scan each line for tasks
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const lineText = line.text;

      // Check if line is a task
      if (!lineText.match(/^\s*-\s*\[([ x])\]/)) {
        continue;
      }

      // Parse the task
      const filePath = vscode.workspace.asRelativePath(document.uri);
      const result = parseTask(lineText, i + 1, filePath, {});

      if (!result.task) {
        continue;
      }

      const task = result.task;
      const range = new vscode.Range(i, 0, i, lineText.length);

      // Toggle completion action
      const toggleAction = new vscode.CodeLens(range, {
        title: task.completed ? '⬜ Mark Incomplete' : '✅ Mark Complete',
        command: 'md2do.toggleComplete',
        tooltip: 'Toggle task completion status',
      });
      codeLenses.push(toggleAction);

      // Due date info (if present)
      if (task.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dueDateText = '';
        let tooltip = '';

        if (diffDays < 0) {
          dueDateText = `📅 Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
          tooltip = 'This task is overdue';
        } else if (diffDays === 0) {
          dueDateText = '📅 Due today';
          tooltip = 'This task is due today';
        } else if (diffDays === 1) {
          dueDateText = '📅 Due tomorrow';
          tooltip = 'This task is due tomorrow';
        } else if (diffDays <= 7) {
          dueDateText = `📅 Due in ${diffDays} days`;
          tooltip = `Due in ${diffDays} days`;
        } else {
          dueDateText = `📅 Due ${task.dueDate.toISOString().split('T')[0]}`;
          tooltip = `Due on ${task.dueDate.toISOString().split('T')[0]}`;
        }

        const dueDateLens = new vscode.CodeLens(range, {
          title: dueDateText,
          command: '',
          tooltip,
        });
        codeLenses.push(dueDateLens);
      }

      // Priority indicator
      if (task.priority) {
        const priorityEmoji = {
          urgent: '🔴',
          high: '🟠',
          normal: '🟡',
          low: '🟢',
        };
        const emoji = priorityEmoji[task.priority] || '⚡';
        const priorityLens = new vscode.CodeLens(range, {
          title: `${emoji} ${task.priority}`,
          command: '',
          tooltip: `Priority: ${task.priority}`,
        });
        codeLenses.push(priorityLens);
      }

      // Todoist sync status
      if (task.todoistId) {
        const todoistLens = new vscode.CodeLens(range, {
          title: '🔄 Synced',
          command: '',
          tooltip: `Synced with Todoist (ID: ${task.todoistId})`,
        });
        codeLenses.push(todoistLens);
      }

      // Delete action
      const deleteAction = new vscode.CodeLens(range, {
        title: '🗑️ Delete',
        command: 'md2do.deleteTask',
        tooltip: 'Delete this task',
        arguments: [
          {
            filePath: document.uri.fsPath,
            line: i,
            text: task.text,
          },
        ],
      });
      codeLenses.push(deleteAction);
    }

    return codeLenses;
  }
}
