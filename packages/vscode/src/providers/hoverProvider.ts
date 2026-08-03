import * as vscode from 'vscode';
import { parseTask } from '@md2do/core';

/**
 * Provides rich hover tooltips for task lines
 */
export class TaskHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const line = document.lineAt(position.line);
    const lineText = line.text;

    // Check if line is a task
    if (!lineText.match(/^\s*-\s*\[([ x])\]/)) {
      return undefined;
    }

    // Parse the task
    const filePath = vscode.workspace.asRelativePath(document.uri);
    const result = parseTask(lineText, position.line + 1, filePath, {});

    if (!result.task) {
      return undefined;
    }

    const task = result.task;

    // Build hover content
    const md = new vscode.MarkdownString();
    md.isTrusted = true;

    // Title
    md.appendMarkdown(`### ${task.completed ? '✅' : '⬜'} ${task.text}\n\n`);

    // Metadata sections
    const sections: string[] = [];

    // Due date
    if (task.dueDate) {
      const dateStr = task.dueDate.toISOString().split('T')[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isOverdue = !task.completed && task.dueDate < today;

      sections.push(
        `📅 **Due**: ${dateStr}${isOverdue ? ' ⚠️ _Overdue_' : ''}`,
      );
    }

    // Completion date
    if (task.completed && task.completedDate) {
      const dateStr = task.completedDate.toISOString().split('T')[0];
      sections.push(`✅ **Completed**: ${dateStr}`);
    }

    // Priority
    if (task.priority) {
      const priorityEmoji = {
        urgent: '🔴',
        high: '🟠',
        normal: '🟡',
        low: '🟢',
      };
      sections.push(
        `${priorityEmoji[task.priority] || '⚡'} **Priority**: ${task.priority}`,
      );
    }

    // Assignee
    if (task.assignee) {
      sections.push(`👤 **Assignee**: @${task.assignee}`);
    }

    // Tags
    if (task.tags && task.tags.length > 0) {
      sections.push(`🏷️ **Tags**: ${task.tags.map((t) => `#${t}`).join(', ')}`);
    }

    // Project context
    if (task.project) {
      sections.push(`📁 **Project**: ${task.project}`);
    }

    // Person context
    if (task.person) {
      sections.push(`👥 **Person**: ${task.person}`);
    }

    // Source links
    if (task.sources) {
      for (const [slug, id] of Object.entries(task.sources)) {
        sections.push(`🔄 **${slug} ID**: ${id}`);
      }
    }

    // Add all sections
    if (sections.length > 0) {
      md.appendMarkdown(sections.join('\n\n'));
      md.appendMarkdown('\n\n---\n\n');
    }

    // Location
    md.appendMarkdown(`📄 \`${filePath}:${position.line + 1}\``);

    // Add warnings if any
    if (result.warnings.length > 0) {
      md.appendMarkdown('\n\n---\n\n');
      md.appendMarkdown('### ⚠️ Warnings\n\n');
      for (const warning of result.warnings) {
        md.appendMarkdown(`- ${warning.message}\n`);
      }
    }

    return new vscode.Hover(md, line.range);
  }
}
