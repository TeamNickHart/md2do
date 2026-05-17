import { App, TFile } from 'obsidian';
import { MarkdownScanner, type Task, type Warning } from '@md2do/core';
import type { Md2doSettings } from '../settings';

export interface ScanResult {
  tasks: Task[];
  warnings: Warning[];
  metadata: {
    filesScanned: number;
    totalTasks: number;
  };
}

export async function scanVault(
  app: App,
  settings: Md2doSettings,
): Promise<ScanResult> {
  const scanner = new MarkdownScanner();
  const allTasks: Task[] = [];
  const allWarnings: Warning[] = [];

  const markdownFiles = app.vault.getMarkdownFiles();

  const filesToScan = markdownFiles.filter((file) => {
    // Check exclusions
    for (const excluded of settings.excludeFolders) {
      if (file.path.startsWith(excluded + '/') || file.path === excluded) {
        return false;
      }
    }
    return true;
  });

  for (const file of filesToScan) {
    try {
      const content = await app.vault.cachedRead(file);
      const result = scanner.scanFile(file.path, content);
      allTasks.push(...result.tasks);
      allWarnings.push(...result.warnings);
    } catch (error) {
      const message = `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      allWarnings.push({
        severity: 'error',
        source: 'md2do',
        ruleId: 'file-read-error',
        file: file.path,
        line: 0,
        message,
      });
    }
  }

  return {
    tasks: allTasks,
    warnings: allWarnings,
    metadata: {
      filesScanned: filesToScan.length,
      totalTasks: allTasks.length,
    },
  };
}

export async function scanSingleFile(
  app: App,
  file: TFile,
): Promise<{ tasks: Task[]; warnings: Warning[] }> {
  const scanner = new MarkdownScanner();
  const content = await app.vault.cachedRead(file);
  return scanner.scanFile(file.path, content);
}
