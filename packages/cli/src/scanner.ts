import { readFile } from 'fs/promises';
import fg from 'fast-glob';
import { MarkdownScanner, type Task, type Warning } from '@md2do/core';

export interface ScanOptions {
  /**
   * Root directory to scan (defaults to current directory)
   */
  root?: string;

  /**
   * Glob pattern for markdown files (defaults to all .md files)
   */
  pattern?: string;

  /**
   * Paths to exclude from scanning
   */
  exclude?: string[];

  /**
   * Whether to follow symbolic links (defaults to false)
   */
  followSymlinks?: boolean;
}

export interface ScanResult {
  tasks: Task[];
  warnings: Warning[];
  metadata: {
    filesScanned: number;
    totalTasks: number;
    scanDuration: number;
  };
}

/**
 * Scan markdown files and extract tasks
 *
 * @param options - Scanning options
 * @returns Scan results with tasks, warnings, and metadata
 */
export async function scanMarkdownFiles(
  options: ScanOptions = {},
): Promise<ScanResult> {
  const startTime = Date.now();

  const {
    root = process.cwd(),
    pattern = '**/*.md',
    exclude = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
    ],
    followSymlinks = false,
  } = options;

  // Find all markdown files
  const files = await fg(pattern, {
    cwd: root,
    ignore: exclude,
    absolute: false,
    followSymbolicLinks: followSymlinks,
    onlyFiles: true,
  });

  // Read and scan files
  const scanner = new MarkdownScanner();
  const allTasks: Task[] = [];
  const allWarnings: Warning[] = [];

  for (const file of files) {
    try {
      const fullPath = `${root}/${file}`;
      const content = await readFile(fullPath, 'utf-8');

      const result = scanner.scanFile(file, content);
      allTasks.push(...result.tasks);
      allWarnings.push(...result.warnings);
    } catch (error) {
      // Add warning for files that couldn't be read
      const message = `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      allWarnings.push({
        severity: 'error',
        source: 'md2do',
        ruleId: 'file-read-error',
        file,
        line: 0,
        text: '',
        message,
        reason: message,
      });
    }
  }

  const endTime = Date.now();

  return {
    tasks: allTasks,
    warnings: allWarnings,
    metadata: {
      filesScanned: files.length,
      totalTasks: allTasks.length,
      scanDuration: endTime - startTime,
    },
  };
}
