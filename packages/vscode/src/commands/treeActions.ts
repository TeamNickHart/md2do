import * as vscode from 'vscode';
import type { Task } from '@md2do/core';

/**
 * Toggle task completion from tree view
 */
export async function toggleTaskFromTree(task: Task): Promise<void> {
  try {
    // Open the document
    const uri = vscode.Uri.file(task.file);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Get the line
    const lineIndex = task.line - 1;
    const line = document.lineAt(lineIndex);
    const lineText = line.text;

    // Toggle checkbox
    const checkboxMatch = lineText.match(/^(\s*-\s*\[)([ x])(\].*)$/);
    if (!checkboxMatch) {
      void vscode.window.showErrorMessage('Could not find task checkbox');
      return;
    }

    const [, prefix, currentState, suffix] = checkboxMatch;
    if (!prefix || !currentState || !suffix) {
      return;
    }

    const isCompleted = currentState === 'x';
    const newState = isCompleted ? ' ' : 'x';
    let newSuffix = suffix;

    // Handle completion date
    const today = new Date().toISOString().split('T')[0];

    if (!isCompleted) {
      // Completing: add completion date if not present
      if (!suffix.includes('[completed:')) {
        const metadataMatch = suffix.match(/^(.*?)(\s+\[.*\])?$/);
        if (metadataMatch) {
          const [, text, metadata] = metadataMatch;
          newSuffix = `${text} [completed: ${today}]${metadata || ''}`;
        }
      }
    } else {
      // Uncompleting: remove completion date
      newSuffix = suffix.replace(/\s*\[completed:\s*[^\]]+\]/, '');
    }

    const newLineText = `${prefix}${newState}${newSuffix}`;

    // Apply edit
    await editor.edit((editBuilder) => {
      editBuilder.replace(line.range, newLineText);
    });

    // Save the document
    await document.save();

    void vscode.window.showInformationMessage(
      isCompleted ? 'Task reopened' : 'Task completed',
    );
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Failed to toggle task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Copy task as markdown to clipboard
 */
export async function copyTaskAsMarkdown(task: Task): Promise<void> {
  try {
    // Reconstruct the task markdown
    const checkbox = task.completed ? '[x]' : '[ ]';
    let markdown = `- ${checkbox} ${task.text}`;

    // Add metadata
    if (task.dueDate) {
      const dateStr = task.dueDate.toISOString().split('T')[0];
      markdown += ` [due: ${dateStr}]`;
    }

    if (task.completedDate) {
      const dateStr = task.completedDate.toISOString().split('T')[0];
      markdown += ` [completed: ${dateStr}]`;
    }

    if (task.priority) {
      const priorityMarks = {
        urgent: '!!!',
        high: '!!',
        normal: '!',
        low: '!',
      };
      markdown += ` ${priorityMarks[task.priority] || '!'}`;
    }

    if (task.assignee) {
      markdown += ` @${task.assignee}`;
    }

    if (task.tags && task.tags.length > 0) {
      markdown += ` ${task.tags.map((t) => `#${t}`).join(' ')}`;
    }

    if (task.todoistId) {
      markdown += ` [todoist:${task.todoistId}]`;
    }

    await vscode.env.clipboard.writeText(markdown);
    void vscode.window.showInformationMessage('Task copied to clipboard');
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Failed to copy task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Delete task from file
 */
export async function deleteTask(task: Task): Promise<void> {
  try {
    // Confirm deletion
    const answer = await vscode.window.showWarningMessage(
      `Delete task "${task.text}"?`,
      { modal: true },
      'Delete',
    );

    if (answer !== 'Delete') {
      return;
    }

    // Open the document
    const uri = vscode.Uri.file(task.file);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Delete the line
    const lineIndex = task.line - 1;
    const line = document.lineAt(lineIndex);

    await editor.edit((editBuilder) => {
      // Delete the entire line including newline
      const rangeToDelete = new vscode.Range(
        line.range.start,
        lineIndex + 1 < document.lineCount
          ? document.lineAt(lineIndex + 1).range.start
          : line.range.end,
      );
      editBuilder.delete(rangeToDelete);
    });

    // Save the document
    await document.save();

    void vscode.window.showInformationMessage('Task deleted');
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Edit task (jump to location and focus)
 */
export async function editTask(task: Task): Promise<void> {
  try {
    const uri = vscode.Uri.file(task.file);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Navigate to task text (skip checkbox)
    const lineIndex = task.line - 1;
    const line = document.lineAt(lineIndex);
    const textMatch = line.text.match(/^\s*-\s*\[([ x])\]\s*/);
    const textStartCol = textMatch ? textMatch[0].length : 0;

    const position = new vscode.Position(lineIndex, textStartCol);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
      new vscode.Range(position, position),
      vscode.TextEditorRevealType.InCenter,
    );
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Failed to edit task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
