import * as vscode from 'vscode';
import { MarkdownScanner, type Task, type Warning } from '@md2do/core';
import { loadConfig } from '@md2do/config';

export interface ScanResult {
  tasks: Task[];
  warnings: Warning[];
  metadata: {
    filesScanned: number;
    totalTasks: number;
  };
}

/**
 * Scans the workspace for markdown tasks
 */
export async function scanWorkspace(): Promise<ScanResult> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    return {
      tasks: [],
      warnings: [],
      metadata: {
        filesScanned: 0,
        totalTasks: 0,
      },
    };
  }

  // Use the first workspace folder as the root
  const rootPath = workspaceFolders[0]!.uri.fsPath;

  try {
    // Load configuration from workspace
    const config = await loadConfig({ cwd: rootPath });

    // Get pattern and exclusions
    const pattern = config.markdown?.pattern || '**/*.md';
    const exclude = config.markdown?.exclude || [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
    ];

    // Find all markdown files
    const files = await vscode.workspace.findFiles(
      pattern,
      `{${exclude.join(',')}}`,
    );

    // Scan each file
    const scanner = new MarkdownScanner();
    const allTasks: Task[] = [];
    const allWarnings: Warning[] = [];

    for (const fileUri of files) {
      try {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const content = document.getText();
        const relativePath = vscode.workspace.asRelativePath(fileUri);

        const result = scanner.scanFile(relativePath, content);
        allTasks.push(...result.tasks);
        allWarnings.push(...result.warnings);
      } catch (error) {
        // Add warning for files that couldn't be read
        const relativePath = vscode.workspace.asRelativePath(fileUri);
        const message = `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`;
        allWarnings.push({
          severity: 'error',
          source: 'md2do',
          ruleId: 'file-read-error',
          file: relativePath,
          line: 0,
          message,
          reason: message,
        });
      }
    }

    return {
      tasks: allTasks,
      warnings: allWarnings,
      metadata: {
        filesScanned: files.length,
        totalTasks: allTasks.length,
      },
    };
  } catch (error) {
    console.error('Error scanning workspace:', error);
    return {
      tasks: [],
      warnings: [],
      metadata: {
        filesScanned: 0,
        totalTasks: 0,
      },
    };
  }
}
