import * as vscode from 'vscode';
import type { Warning } from '@md2do/core';
import { loadConfig } from '@md2do/config';
import { filterWarnings } from '@md2do/core';
import { scanWorkspace } from '../utils/scanner.js';

export class DiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection('md2do');
  }

  /**
   * Update diagnostics for all workspace files
   */
  async updateDiagnostics(): Promise<void> {
    // Check if warnings are enabled in settings
    const config = vscode.workspace.getConfiguration('md2do');
    const warningsEnabled = config.get<boolean>('warnings.enabled', true);

    if (!warningsEnabled) {
      this.diagnosticCollection.clear();
      return;
    }

    try {
      // Scan workspace
      const scanResult = await scanWorkspace();

      // Load md2do config to respect user's warning settings
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      const md2doConfig = workspaceFolder
        ? await loadConfig({ cwd: workspaceFolder.uri.fsPath })
        : undefined;

      // Filter warnings based on config
      const filteredWarnings = filterWarnings(
        scanResult.warnings,
        md2doConfig?.warnings ?? {},
      );

      // Group warnings by file
      const warningsByFile = new Map<string, Warning[]>();
      for (const warning of filteredWarnings) {
        const warnings = warningsByFile.get(warning.file) || [];
        warnings.push(warning);
        warningsByFile.set(warning.file, warnings);
      }

      // Clear existing diagnostics
      this.diagnosticCollection.clear();

      // Create diagnostics for each file
      for (const [filePath, warnings] of warningsByFile) {
        const diagnostics = warnings.map((warning) =>
          this.createDiagnostic(warning),
        );
        const uri = vscode.Uri.file(filePath);
        this.diagnosticCollection.set(uri, diagnostics);
      }
    } catch (error) {
      console.error('Error updating diagnostics:', error);
    }
  }

  /**
   * Convert md2do warning to VSCode diagnostic
   */
  private createDiagnostic(warning: Warning): vscode.Diagnostic {
    // Convert line number (1-indexed) to VSCode position (0-indexed)
    const line = warning.line - 1;
    const column = (warning.column || 1) - 1;

    const range = new vscode.Range(
      line,
      column,
      line,
      column + (warning.text?.length || 100),
    );

    // Map warning severity to VSCode severity
    let severity: vscode.DiagnosticSeverity;
    switch (warning.severity) {
      case 'error':
        severity = vscode.DiagnosticSeverity.Error;
        break;
      case 'warning':
        severity = vscode.DiagnosticSeverity.Warning;
        break;
      case 'info':
        severity = vscode.DiagnosticSeverity.Information;
        break;
      default:
        severity = vscode.DiagnosticSeverity.Warning;
    }

    const diagnostic = new vscode.Diagnostic(range, warning.message, severity);
    diagnostic.source = 'md2do';
    diagnostic.code = warning.ruleId;

    return diagnostic;
  }

  /**
   * Dispose of the diagnostic collection
   */
  dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
