import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Toggle task completion at cursor position
 */
export async function toggleComplete(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const line = document.lineAt(position.line);
  const lineText = line.text;

  // Check if line contains a task checkbox
  const checkboxMatch = lineText.match(/^(\s*-\s*\[)([ x])(\].*)$/);

  if (!checkboxMatch) {
    void vscode.window.showInformationMessage(
      'No task checkbox found on this line',
    );
    return;
  }

  const [, prefix, currentState, suffix] = checkboxMatch;

  if (!prefix || !currentState || !suffix) {
    return;
  }

  // Toggle the checkbox state
  const isCompleted = currentState === 'x';
  const newState = isCompleted ? ' ' : 'x';
  let newSuffix = suffix;

  // Handle completion date
  const today = new Date().toISOString().split('T')[0];

  if (!isCompleted) {
    // Completing: add completion date if not present
    if (!suffix.includes('[completed:')) {
      // Insert completion date before any existing metadata
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

  void vscode.window.showInformationMessage(
    isCompleted ? 'Task reopened' : 'Task completed',
  );
}

/**
 * Go to task location in editor
 */
export async function goToTask(task: {
  file: string;
  line: number;
}): Promise<void> {
  try {
    // Get the workspace folder to resolve relative paths
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder open');
    }

    const rootPath = workspaceFolders[0]!.uri.fsPath;

    // Resolve relative path to absolute path
    const absolutePath = path.isAbsolute(task.file)
      ? task.file
      : path.join(rootPath, task.file);

    const uri = vscode.Uri.file(absolutePath);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Navigate to line (convert from 1-indexed to 0-indexed)
    const line = task.line - 1;
    const range = document.lineAt(line).range;
    editor.selection = new vscode.Selection(range.start, range.start);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Failed to open task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
