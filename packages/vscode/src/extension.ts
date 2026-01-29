import * as vscode from 'vscode';
import { DiagnosticProvider } from './providers/diagnosticProvider.js';
import { TaskTreeDataProvider } from './providers/treeDataProvider.js';
import { TaskHoverProvider } from './providers/hoverProvider.js';
import { TaskCompletionProvider } from './providers/completionProvider.js';
import { TaskCodeLensProvider } from './providers/codeLensProvider.js';
import { toggleComplete, goToTask } from './commands/toggleComplete.js';
import {
  toggleTaskFromTree,
  copyTaskAsMarkdown,
  deleteTask,
  editTask,
} from './commands/treeActions.js';

let statusBarItem: vscode.StatusBarItem;
let diagnosticProvider: DiagnosticProvider;
let taskTreeDataProvider: TaskTreeDataProvider;
let completionProvider: TaskCompletionProvider;
let codeLensProvider: TaskCodeLensProvider;

/**
 * Activate the extension
 */
export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  console.log('md2do extension is now active');

  // Initialize providers
  diagnosticProvider = new DiagnosticProvider();
  taskTreeDataProvider = new TaskTreeDataProvider();
  completionProvider = new TaskCompletionProvider();
  codeLensProvider = new TaskCodeLensProvider();

  // Register tree view
  const treeView = vscode.window.createTreeView('md2doTasks', {
    treeDataProvider: taskTreeDataProvider,
    showCollapseAll: true,
  });

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.command = 'md2do.refreshTasks';
  statusBarItem.text = '$(list-tree) md2do: Loading...';
  statusBarItem.show();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('md2do.toggleComplete', toggleComplete),
    vscode.commands.registerCommand('md2do.goToTask', goToTask),
    vscode.commands.registerCommand('md2do.refreshTasks', async () => {
      await refreshAll();
    }),
    vscode.commands.registerCommand(
      'md2do.toggleTaskFromTree',
      toggleTaskFromTree,
    ),
    vscode.commands.registerCommand(
      'md2do.copyTaskAsMarkdown',
      copyTaskAsMarkdown,
    ),
    vscode.commands.registerCommand('md2do.deleteTask', deleteTask),
    vscode.commands.registerCommand('md2do.editTask', editTask),
  );

  // Watch for file changes
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.md');
  context.subscriptions.push(
    fileWatcher.onDidCreate(() => void refreshAll()),
    fileWatcher.onDidChange(() => void refreshAll()),
    fileWatcher.onDidDelete(() => void refreshAll()),
    fileWatcher,
  );

  // Watch for text document saves
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.languageId === 'markdown') {
        void refreshAll();
      }
    }),
  );

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('md2do')) {
        void refreshAll();
      }
    }),
  );

  // Register hover provider
  const hoverProvider = vscode.languages.registerHoverProvider(
    'markdown',
    new TaskHoverProvider(),
  );

  // Register completion provider
  const completionProviderDisposable =
    vscode.languages.registerCompletionItemProvider(
      'markdown',
      completionProvider,
      '[', // Trigger on [due: or [completed:
      '@', // Trigger on @assignee
      '#', // Trigger on #tag
      '!', // Trigger on priority
    );

  // Register CodeLens provider
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    'markdown',
    codeLensProvider,
  );

  // Register providers
  context.subscriptions.push(
    diagnosticProvider,
    treeView,
    statusBarItem,
    hoverProvider,
    completionProviderDisposable,
    codeLensProviderDisposable,
  );

  // Initial scan (updates caches for completion provider)
  await refreshAll();

  // Update completion provider cache
  await completionProvider.updateCache();
}

/**
 * Refresh all providers and update status bar
 */
async function refreshAll(): Promise<void> {
  try {
    statusBarItem.text = '$(sync~spin) md2do: Scanning...';

    // Refresh tree view
    await taskTreeDataProvider.refresh();

    // Update diagnostics
    await diagnosticProvider.updateDiagnostics();

    // Update status bar
    const tasks = taskTreeDataProvider.getTasks();
    const completed = tasks.filter((t) => t.completed).length;
    const incomplete = tasks.length - completed;
    const today = new Date(new Date().toISOString().split('T')[0]!);
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < today,
    ).length;

    let text = `$(list-tree) ${tasks.length} tasks`;
    if (overdue > 0) {
      text += ` ($(warning) ${overdue} overdue)`;
    }

    statusBarItem.text = text;
    statusBarItem.tooltip = `md2do Tasks\n\nTotal: ${tasks.length}\nCompleted: ${completed}\nIncomplete: ${incomplete}${overdue > 0 ? `\nOverdue: ${overdue}` : ''}`;

    // Update completion provider cache
    await completionProvider.updateCache();

    // Refresh CodeLens
    codeLensProvider.refresh();
  } catch (error) {
    console.error('Error refreshing md2do:', error);
    statusBarItem.text = '$(error) md2do: Error';
    statusBarItem.tooltip = `Error scanning tasks: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
