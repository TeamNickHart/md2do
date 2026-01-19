import * as fs from 'fs/promises';
import { TASK_CHECKBOX } from '../parser/patterns.js';
import { parseTask } from '../parser/index.js';
import type { Task } from '../types/index.js';

export interface UpdateTaskOptions {
  /**
   * Path to the markdown file
   */
  file: string;

  /**
   * Line number (1-indexed) of the task to update
   */
  line: number;

  /**
   * Updates to apply to the task
   */
  updates: {
    /**
     * Mark task as completed or incomplete
     */
    completed?: boolean;

    /**
     * Update the task text
     */
    text?: string;

    /**
     * Replace the entire line
     */
    replaceLine?: string;
  };
}

export interface WriteTaskResult {
  /**
   * Whether the task was successfully updated
   */
  success: boolean;

  /**
   * The updated task (after changes)
   */
  task?: Task;

  /**
   * Error message if update failed
   */
  error?: string;
}

/**
 * Update a task in a markdown file
 * This performs an atomic write using a temporary file
 */
export async function updateTask(
  options: UpdateTaskOptions,
): Promise<WriteTaskResult> {
  const { file, line, updates } = options;

  try {
    // Read the file
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');

    // Validate line number
    if (line < 1 || line > lines.length) {
      return {
        success: false,
        error: `Invalid line number ${line}. File has ${lines.length} lines.`,
      };
    }

    // Get the target line (convert from 1-indexed to 0-indexed)
    const lineIndex = line - 1;
    const originalLine = lines[lineIndex];

    // Validate that it's a task
    if (!originalLine || !TASK_CHECKBOX.test(originalLine)) {
      return {
        success: false,
        error: `Line ${line} is not a task: ${originalLine}`,
      };
    }

    // Apply updates
    let updatedLine: string;

    if (updates.replaceLine !== undefined) {
      // Replace the entire line
      updatedLine = updates.replaceLine;
    } else {
      // Apply individual updates
      updatedLine = originalLine;

      if (updates.completed !== undefined) {
        // Update completion status
        const isCurrentlyCompleted = /- \[x\]/i.test(updatedLine);
        if (updates.completed && !isCurrentlyCompleted) {
          updatedLine = updatedLine.replace(/- \[ \]/, '- [x]');
        } else if (!updates.completed && isCurrentlyCompleted) {
          updatedLine = updatedLine.replace(/- \[x\]/i, '- [ ]');
        }
      }

      if (updates.text !== undefined) {
        // Replace task text while preserving checkbox
        const checkboxMatch = updatedLine.match(/^(\s*- \[[x ]\]\s*)/i);
        if (checkboxMatch) {
          updatedLine = checkboxMatch[1] + updates.text;
        }
      }
    }

    // Update the line in the array
    lines[lineIndex] = updatedLine;

    // Write to temporary file first (atomic write)
    const tempFile = `${file}.md2do.tmp`;
    const newContent = lines.join('\n');

    await fs.writeFile(tempFile, newContent, 'utf-8');

    // Rename temp file to original (atomic on most filesystems)
    await fs.rename(tempFile, file);

    // Parse the updated task
    const parseResult = parseTask(updatedLine, line, file, {});

    const result: WriteTaskResult = {
      success: true,
    };

    if (parseResult.task) {
      result.task = parseResult.task;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: `Failed to update task: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Batch update multiple tasks in a file
 * More efficient than calling updateTask multiple times
 */
export async function updateTasks(
  file: string,
  updates: Array<{
    line: number;
    updates: UpdateTaskOptions['updates'];
  }>,
): Promise<{
  success: boolean;
  updatedCount: number;
  errors: Array<{ line: number; error: string }>;
}> {
  try {
    // Read the file once
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');

    const errors: Array<{ line: number; error: string }> = [];
    let updatedCount = 0;

    // Sort updates by line number to process in order
    const sortedUpdates = [...updates].sort((a, b) => a.line - b.line);

    // Apply all updates
    for (const update of sortedUpdates) {
      const { line: lineNumber, updates: taskUpdates } = update;

      // Validate line number
      if (lineNumber < 1 || lineNumber > lines.length) {
        errors.push({
          line: lineNumber,
          error: `Invalid line number ${lineNumber}`,
        });
        continue;
      }

      const lineIndex = lineNumber - 1;
      const originalLine = lines[lineIndex];

      // Validate that it's a task
      if (!originalLine || !TASK_CHECKBOX.test(originalLine)) {
        errors.push({
          line: lineNumber,
          error: `Line ${lineNumber} is not a task`,
        });
        continue;
      }

      // Apply updates
      let updatedLine = originalLine;

      if (taskUpdates.replaceLine !== undefined) {
        updatedLine = taskUpdates.replaceLine;
      } else {
        if (taskUpdates.completed !== undefined) {
          const isCurrentlyCompleted = /- \[x\]/i.test(updatedLine);
          if (taskUpdates.completed && !isCurrentlyCompleted) {
            updatedLine = updatedLine.replace(/- \[ \]/, '- [x]');
          } else if (!taskUpdates.completed && isCurrentlyCompleted) {
            updatedLine = updatedLine.replace(/- \[x\]/i, '- [ ]');
          }
        }

        if (taskUpdates.text !== undefined) {
          const checkboxMatch = updatedLine.match(/^(\s*- \[[x ]\]\s*)/i);
          if (checkboxMatch) {
            updatedLine = checkboxMatch[1] + taskUpdates.text;
          }
        }
      }

      lines[lineIndex] = updatedLine;
      updatedCount++;
    }

    // Write atomically
    const tempFile = `${file}.md2do.tmp`;
    const newContent = lines.join('\n');

    await fs.writeFile(tempFile, newContent, 'utf-8');
    await fs.rename(tempFile, file);

    return {
      success: errors.length === 0,
      updatedCount,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      updatedCount: 0,
      errors: [
        {
          line: 0,
          error: `Failed to update tasks: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Add a task to a markdown file
 */
export async function addTask(
  file: string,
  text: string,
  options: {
    /**
     * Line number to insert at (1-indexed)
     * If not specified, appends to end of file
     */
    line?: number;

    /**
     * Whether the task is completed
     */
    completed?: boolean;
  } = {},
): Promise<WriteTaskResult> {
  try {
    const checkbox = options.completed ? '- [x]' : '- [ ]';
    const taskLine = `${checkbox} ${text}`;

    // Read existing content
    let content: string;
    try {
      content = await fs.readFile(file, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        content = '';
      } else {
        throw error;
      }
    }

    const lines = content.split('\n');

    // Insert the task
    if (options.line !== undefined) {
      // Validate line number
      if (options.line < 1 || options.line > lines.length + 1) {
        return {
          success: false,
          error: `Invalid line number ${options.line}`,
        };
      }
      lines.splice(options.line - 1, 0, taskLine);
    } else {
      // Append to end
      if (content.length > 0 && !content.endsWith('\n')) {
        lines.push('');
      }
      lines.push(taskLine);
    }

    // Write atomically
    const tempFile = `${file}.md2do.tmp`;
    const newContent = lines.join('\n');

    await fs.writeFile(tempFile, newContent, 'utf-8');
    await fs.rename(tempFile, file);

    // Parse the new task
    const insertedLine = options.line ?? lines.length;
    const parseResult = parseTask(taskLine, insertedLine, file, {});

    const result: WriteTaskResult = {
      success: true,
    };

    if (parseResult.task) {
      result.task = parseResult.task;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: `Failed to add task: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
