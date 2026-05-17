import { App, PluginSettingTab, Setting } from 'obsidian';
import type Md2doPlugin from './main';

export interface Md2doSettings {
  scanPattern: string;
  excludeFolders: string[];
  warningsEnabled: boolean;
  defaultGroupMode: GroupMode;
  defaultSortMode: SortMode;
  showCompletedTasks: boolean;
  autoScan: boolean;
}

export type GroupMode =
  | 'file'
  | 'assignee'
  | 'priority'
  | 'dueDate'
  | 'tag'
  | 'flat';
export type SortMode = 'dueDate' | 'priority' | 'alphabetical' | 'line';

export const DEFAULT_SETTINGS: Md2doSettings = {
  scanPattern: '**/*.md',
  excludeFolders: ['node_modules', '.git', 'dist', 'build', '.obsidian'],
  warningsEnabled: true,
  defaultGroupMode: 'file',
  defaultSortMode: 'dueDate',
  showCompletedTasks: true,
  autoScan: true,
};

export class Md2doSettingTab extends PluginSettingTab {
  plugin: Md2doPlugin;

  constructor(app: App, plugin: Md2doPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'md2do Settings' });

    // Scanning section
    containerEl.createEl('h3', { text: 'Scanning' });

    new Setting(containerEl)
      .setName('File pattern')
      .setDesc('Glob pattern for files to scan (default: **/*.md)')
      .addText((text) =>
        text
          .setPlaceholder('**/*.md')
          .setValue(this.plugin.settings.scanPattern)
          .onChange(async (value) => {
            this.plugin.settings.scanPattern = value || '**/*.md';
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Excluded folders')
      .setDesc('Comma-separated list of folders to exclude from scanning')
      .addText((text) =>
        text
          .setPlaceholder('node_modules, .git, dist')
          .setValue(this.plugin.settings.excludeFolders.join(', '))
          .onChange(async (value) => {
            this.plugin.settings.excludeFolders = value
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Auto-scan')
      .setDesc('Automatically scan for tasks when files change')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoScan)
          .onChange(async (value) => {
            this.plugin.settings.autoScan = value;
            await this.plugin.saveSettings();
          }),
      );

    // Display section
    containerEl.createEl('h3', { text: 'Display' });

    new Setting(containerEl)
      .setName('Default grouping')
      .setDesc('How tasks are grouped in the sidebar')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('file', 'By File')
          .addOption('assignee', 'By Assignee')
          .addOption('priority', 'By Priority')
          .addOption('dueDate', 'By Due Date')
          .addOption('tag', 'By Tag')
          .addOption('flat', 'Flat List')
          .setValue(this.plugin.settings.defaultGroupMode)
          .onChange(async (value) => {
            this.plugin.settings.defaultGroupMode = value as GroupMode;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Default sorting')
      .setDesc('How tasks are sorted within groups')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('dueDate', 'By Due Date')
          .addOption('priority', 'By Priority')
          .addOption('alphabetical', 'Alphabetically')
          .addOption('line', 'By Line Number')
          .setValue(this.plugin.settings.defaultSortMode)
          .onChange(async (value) => {
            this.plugin.settings.defaultSortMode = value as SortMode;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Show completed tasks')
      .setDesc('Include completed tasks in the task list')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showCompletedTasks)
          .onChange(async (value) => {
            this.plugin.settings.showCompletedTasks = value;
            await this.plugin.saveSettings();
          }),
      );

    // Warnings section
    containerEl.createEl('h3', { text: 'Warnings' });

    new Setting(containerEl)
      .setName('Enable warnings')
      .setDesc('Show task formatting warnings')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.warningsEnabled)
          .onChange(async (value) => {
            this.plugin.settings.warningsEnabled = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
