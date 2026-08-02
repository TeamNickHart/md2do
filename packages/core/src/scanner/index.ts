import type { Task, ParsingContext, Warning } from '../types/index.js';
import { parseTask } from '../parser/index.js';

/**
 * Extract project name from file path
 *
 * Looks for "projects/" directory in path and returns the
 * immediate subdirectory name.
 *
 * @param filePath - Relative file path
 * @returns Project name or undefined
 *
 * @example
 * extractProjectFromPath('projects/acme-app/notes.md') // => 'acme-app'
 * extractProjectFromPath('1-1s/jane.md') // => undefined
 */
export function extractProjectFromPath(filePath: string): string | undefined {
  const match = filePath.match(/projects\/([^/]+)/);
  return match?.[1];
}

/**
 * Extract person name from file path
 *
 * Looks for "1-1s/" directory in path and extracts the filename
 * (without extension) as the person identifier.
 *
 * @param filePath - Relative file path
 * @returns Person identifier or undefined
 *
 * @example
 * extractPersonFromFilename('1-1s/jane-doe.md') // => 'jane-doe'
 * extractPersonFromFilename('projects/acme/notes.md') // => undefined
 */
export function extractPersonFromFilename(
  filePath: string,
): string | undefined {
  const match = filePath.match(/1-1s\/([^/]+)\.md$/);
  return match?.[1];
}

/**
 * MarkdownScanner scans markdown file content and extracts tasks
 *
 * Key features:
 *   - Context tracking: Maintains project and person context
 *   - Pure function: No I/O, just string processing
 *   - Warning collection: Reports issues like relative dates without context
 *
 * @example
 * const scanner = new MarkdownScanner();
 * const result = scanner.scanFile('projects/acme-app/notes.md', fileContent);
 * console.log(result.tasks); // Array of Task objects
 * console.log(result.warnings); // Array of Warning objects
 */
export class MarkdownScanner {
  /**
   * Scan a single markdown file's content
   *
   * Processes the file line-by-line, tracking context and extracting tasks.
   *
   * @param filePath - Relative file path (for context extraction)
   * @param content - File content as string
   * @param options - Optional scanner options including workday config
   * @returns Object containing tasks and warnings
   */
  scanFile(
    filePath: string,
    content: string,
    options?: {
      workdayStartTime?: string;
      workdayEndTime?: string;
      defaultDueTime?: 'start' | 'end';
    },
  ): {
    tasks: Task[];
    warnings: Warning[];
  } {
    const tasks: Task[] = [];
    const warnings: Warning[] = [];

    // Track source IDs (composite "slug:id" key) to detect duplicates
    const sourceIds = new Map<string, { file: string; line: number }>();

    // Initialize context from file path
    const context: ParsingContext = {};

    const project = extractProjectFromPath(filePath);
    if (project !== undefined) context.project = project;

    const person = extractPersonFromFilename(filePath);
    if (person !== undefined) context.person = person;

    // Add workday config to context if provided
    if (options?.workdayStartTime) {
      context.workdayStartTime = options.workdayStartTime;
    }
    if (options?.workdayEndTime) {
      context.workdayEndTime = options.workdayEndTime;
    }
    if (options?.defaultDueTime) {
      context.defaultDueTime = options.defaultDueTime;
    }

    // Process file line by line
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue; // Skip undefined lines

      const lineNumber = i + 1; // 1-indexed

      // Try to parse as task
      const result = parseTask(line, lineNumber, filePath, context);

      if (result.task) {
        tasks.push(result.task);

        // Check for duplicate source IDs
        if (result.task.sources) {
          for (const [slug, id] of Object.entries(result.task.sources)) {
            const compositeKey = `${slug}:${id}`;
            const existing = sourceIds.get(compositeKey);
            if (existing) {
              warnings.push({
                severity: 'error',
                source: 'md2do',
                ruleId: 'duplicate-source-id',
                file: filePath,
                line: lineNumber,
                text: result.task.text,
                message: `Duplicate {${slug}:${id}}. Also found at ${existing.file}:${existing.line}.`,
                reason: `Duplicate {${slug}:${id}}. Also found at ${existing.file}:${existing.line}.`,
              });
            } else {
              sourceIds.set(compositeKey, { file: filePath, line: lineNumber });
            }
          }
        }
      }

      if (result.warnings.length > 0) {
        warnings.push(...result.warnings);
      }
    }

    return { tasks, warnings };
  }

  /**
   * Scan multiple files
   *
   * Note: This method expects file contents to be provided by the caller.
   * File I/O should be handled in the CLI package using fast-glob.
   *
   * @param files - Array of {path, content} objects
   * @returns Combined scan results from all files
   */
  scanFiles(files: Array<{ path: string; content: string }>): {
    tasks: Task[];
    warnings: Warning[];
  } {
    const allTasks: Task[] = [];
    const allWarnings: Warning[] = [];

    // Track source IDs (composite "slug:id" key) across all files
    const sourceIds = new Map<string, { file: string; line: number }>();

    for (const file of files) {
      const result = this.scanFile(file.path, file.content);
      allTasks.push(...result.tasks);
      allWarnings.push(...result.warnings);

      // Check for duplicate source IDs across files
      for (const task of result.tasks) {
        if (task.sources) {
          for (const [slug, id] of Object.entries(task.sources)) {
            const compositeKey = `${slug}:${id}`;
            const existing = sourceIds.get(compositeKey);
            if (existing && existing.file !== task.file) {
              // Only add warning if duplicate is in a different file
              // (same-file duplicates are already caught by scanFile)
              allWarnings.push({
                severity: 'error',
                source: 'md2do',
                ruleId: 'duplicate-source-id',
                file: task.file,
                line: task.line,
                text: task.text,
                message: `Duplicate {${slug}:${id}} across files. Also found at ${existing.file}:${existing.line}.`,
                reason: `Duplicate {${slug}:${id}} across files. Also found at ${existing.file}:${existing.line}.`,
              });
            } else if (!existing) {
              sourceIds.set(compositeKey, { file: task.file, line: task.line });
            }
          }
        }
      }
    }

    return {
      tasks: allTasks,
      warnings: allWarnings,
    };
  }
}
