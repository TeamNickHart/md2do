import { Editor, Notice } from 'obsidian';
import type { MarkdownFileInfo } from 'obsidian';
import { TASK_CHECKBOX } from '@md2do/core';
import type Md2doPlugin from '../main';
import { toggleTaskCompletion } from '../utils/task-writer';

export function registerCommands(plugin: Md2doPlugin): void {
  // Toggle task completion on current line
  plugin.addCommand({
    id: 'toggle-task',
    name: 'Toggle task completion',
    editorCallback: async (editor: Editor, ctx: MarkdownFileInfo) => {
      const cursor = editor.getCursor();
      const lineNumber = cursor.line + 1; // Convert to 1-indexed
      const file = ctx.file;

      if (!file) {
        new Notice('No file open');
        return;
      }

      const line = editor.getLine(cursor.line);
      if (!TASK_CHECKBOX.test(line)) {
        new Notice('Current line is not a task');
        return;
      }

      const result = await toggleTaskCompletion(plugin.app, file, lineNumber);
      if (result.success) {
        // Reload the file content in the editor
        const content = await plugin.app.vault.read(file);
        const lines = content.split('\n');
        const updatedLine = lines[cursor.line];
        if (updatedLine !== undefined) {
          editor.setLine(cursor.line, updatedLine);
        }
        await plugin.refreshTasks();
      } else {
        new Notice(`Failed to toggle task: ${result.error}`);
      }
    },
  });

  // Refresh tasks
  plugin.addCommand({
    id: 'refresh-tasks',
    name: 'Refresh task list',
    callback: async () => {
      await plugin.refreshTasks();
      new Notice('md2do: Tasks refreshed');
    },
  });

  // Show task list view
  plugin.addCommand({
    id: 'show-task-list',
    name: 'Show task list',
    callback: async () => {
      await plugin.activateView();
    },
  });

  // List overdue tasks
  plugin.addCommand({
    id: 'show-overdue',
    name: 'Show overdue tasks',
    callback: () => {
      const overdueTasks = plugin.tasks.filter(
        (t) => !t.completed && t.dueDate && t.dueDate < new Date(),
      );
      if (overdueTasks.length === 0) {
        new Notice('No overdue tasks!');
      } else {
        new Notice(`${overdueTasks.length} overdue task(s)`);
      }
    },
  });

  // Show diagnostics summary
  plugin.addCommand({
    id: 'show-diagnostics',
    name: 'Show diagnostics summary',
    callback: () => {
      const warnings = plugin.warnings;
      if (warnings.length === 0) {
        new Notice('md2do: No warnings found');
        return;
      }
      const errors = warnings.filter((w) => w.severity === 'error').length;
      const warns = warnings.filter((w) => w.severity === 'warning').length;
      const infos = warnings.filter((w) => w.severity === 'info').length;
      const parts: string[] = [];
      if (errors > 0) parts.push(`${errors} error(s)`);
      if (warns > 0) parts.push(`${warns} warning(s)`);
      if (infos > 0) parts.push(`${infos} info`);
      new Notice(`md2do Diagnostics\n${parts.join('\n')}`);
    },
  });

  // Show task stats
  plugin.addCommand({
    id: 'show-stats',
    name: 'Show task statistics',
    callback: () => {
      const total = plugin.tasks.length;
      const completed = plugin.tasks.filter((t) => t.completed).length;
      const incomplete = total - completed;
      const overdue = plugin.tasks.filter(
        (t) => !t.completed && t.dueDate && t.dueDate < new Date(),
      ).length;

      const lines = [
        `Total: ${total}`,
        `Completed: ${completed}`,
        `Incomplete: ${incomplete}`,
      ];
      if (overdue > 0) {
        lines.push(`Overdue: ${overdue}`);
      }
      new Notice(`md2do Stats\n${lines.join('\n')}`);
    },
  });
}
