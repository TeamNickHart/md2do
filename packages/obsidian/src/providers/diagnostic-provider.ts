import { Notice } from 'obsidian';
import type { Warning } from '@md2do/core';
import { filterWarnings } from '@md2do/core';
import type Md2doPlugin from '../main';

export class DiagnosticProvider {
  private plugin: Md2doPlugin;
  private gutterMarkers: Map<string, Map<number, HTMLElement>> = new Map();

  constructor(plugin: Md2doPlugin) {
    this.plugin = plugin;
  }

  updateDiagnostics(warnings: Warning[]): void {
    if (!this.plugin.settings.warningsEnabled) {
      this.clearAll();
      return;
    }

    const filtered = filterWarnings(warnings, { enabled: true });

    // Group by file
    const byFile = new Map<string, Warning[]>();
    for (const w of filtered) {
      if (!byFile.has(w.file)) byFile.set(w.file, []);
      byFile.get(w.file)!.push(w);
    }

    // Store warnings for gutter rendering
    this.plugin.warningsByFile = byFile;
  }

  showDiagnosticSummary(): void {
    const warnings = this.plugin.warnings;
    if (!this.plugin.settings.warningsEnabled || warnings.length === 0) {
      new Notice('md2do: No warnings');
      return;
    }

    const filtered = filterWarnings(warnings, { enabled: true });
    const errors = filtered.filter((w) => w.severity === 'error').length;
    const warns = filtered.filter((w) => w.severity === 'warning').length;
    const infos = filtered.filter((w) => w.severity === 'info').length;

    const parts: string[] = [];
    if (errors > 0) parts.push(`${errors} error(s)`);
    if (warns > 0) parts.push(`${warns} warning(s)`);
    if (infos > 0) parts.push(`${infos} info`);

    new Notice(`md2do Diagnostics\n${parts.join(', ')}`);
  }

  getWarningsForFile(filePath: string): Warning[] {
    return this.plugin.warningsByFile.get(filePath) ?? [];
  }

  clearAll(): void {
    this.plugin.warningsByFile.clear();
  }
}
