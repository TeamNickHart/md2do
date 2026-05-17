import { Plugin, TFile, debounce } from 'obsidian';
import type { Task, Warning } from '@md2do/core';
import {
  Md2doSettingTab,
  DEFAULT_SETTINGS,
  type Md2doSettings,
} from './settings';
import { TaskListView, TASK_LIST_VIEW_TYPE } from './views/task-list-view';
import { DiagnosticProvider } from './providers/diagnostic-provider';
import { TaskSuggestProvider } from './providers/suggest-provider';
import { scanVault, type ScanResult } from './utils/scanner';
import { registerCommands } from './commands/index';

export default class Md2doPlugin extends Plugin {
  settings: Md2doSettings = DEFAULT_SETTINGS;
  tasks: Task[] = [];
  warnings: Warning[] = [];
  warningsByFile: Map<string, Warning[]> = new Map();
  private statusBarEl: HTMLElement | null = null;
  private taskListView: TaskListView | null = null;
  private diagnosticProvider: DiagnosticProvider | null = null;
  private suggestProvider: TaskSuggestProvider | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Register the task list view
    this.registerView(TASK_LIST_VIEW_TYPE, (leaf) => {
      this.taskListView = new TaskListView(leaf, this);
      return this.taskListView;
    });

    // Add settings tab
    this.addSettingTab(new Md2doSettingTab(this.app, this));

    // Register commands
    registerCommands(this);

    // Register diagnostic provider
    this.diagnosticProvider = new DiagnosticProvider(this);

    // Register autocomplete suggest provider
    this.suggestProvider = new TaskSuggestProvider(this);
    this.registerEditorSuggest(this.suggestProvider);

    // Add ribbon icon
    this.addRibbonIcon('check-square', 'md2do Tasks', async () => {
      await this.activateView();
    });

    // Add status bar
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass('md2do-status-bar');
    this.statusBarEl.setText('md2do: Loading...');

    // Watch for file changes (always register, check setting dynamically)
    const debouncedRefresh = debounce(
      () => void this.refreshTasks(),
      1000,
      true,
    );

    const onFileChange = (file: unknown) => {
      if (!this.settings.autoScan) return;
      if (file instanceof TFile && file.extension === 'md') {
        debouncedRefresh();
      }
    };

    this.registerEvent(this.app.vault.on('modify', onFileChange));
    this.registerEvent(this.app.vault.on('create', onFileChange));
    this.registerEvent(this.app.vault.on('delete', onFileChange));
    this.registerEvent(this.app.vault.on('rename', onFileChange));

    // Initial scan once layout is ready
    this.app.workspace.onLayoutReady(() => {
      void this.refreshTasks();
    });
  }

  onunload(): void {
    this.taskListView = null;
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<Md2doSettings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    await this.refreshTasks();
  }

  async refreshTasks(): Promise<void> {
    try {
      const result: ScanResult = await scanVault(this.app, this.settings);
      this.tasks = result.tasks;
      this.warnings = result.warnings;

      this.updateStatusBar();

      // Update diagnostics
      if (this.diagnosticProvider) {
        this.diagnosticProvider.updateDiagnostics(this.warnings);
      }

      // Refresh the task list view if it's open
      if (this.taskListView) {
        this.taskListView.refresh();
      }
    } catch (error) {
      console.error('md2do: Error scanning vault:', error);
      if (this.statusBarEl) {
        this.statusBarEl.setText('md2do: Error');
      }
    }
  }

  async activateView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(TASK_LIST_VIEW_TYPE);

    if (existing.length > 0) {
      await this.app.workspace.revealLeaf(existing[0]);
      return;
    }

    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({
        type: TASK_LIST_VIEW_TYPE,
        active: true,
      });
      await this.app.workspace.revealLeaf(leaf);
    }
  }

  private updateStatusBar(): void {
    if (!this.statusBarEl) return;

    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const incomplete = total - completed;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const overdue = this.tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < today,
    ).length;

    this.statusBarEl.empty();

    const text = `md2do: ${incomplete} tasks`;
    this.statusBarEl.createSpan({ text });

    if (overdue > 0) {
      this.statusBarEl.createSpan({
        cls: 'md2do-status-overdue',
        text: ` (${overdue} overdue)`,
      });
    }

    this.statusBarEl.setAttribute(
      'aria-label',
      `md2do Tasks\nTotal: ${total}\nCompleted: ${completed}\nIncomplete: ${incomplete}${overdue > 0 ? `\nOverdue: ${overdue}` : ''}`,
    );
  }
}
