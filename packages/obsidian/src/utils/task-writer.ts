import { App, TFile } from 'obsidian';
import { TASK_CHECKBOX, parseTask } from '@md2do/core';
import type { Task } from '@md2do/core';

export interface ToggleResult {
  success: boolean;
  task?: Task;
  error?: string;
}

export async function toggleTaskCompletion(
  app: App,
  file: TFile,
  line: number,
): Promise<ToggleResult> {
  try {
    const content = await app.vault.read(file);
    const lines = content.split('\n');

    if (line < 1 || line > lines.length) {
      return {
        success: false,
        error: `Invalid line number ${line}. File has ${lines.length} lines.`,
      };
    }

    const lineIndex = line - 1;
    const originalLine = lines[lineIndex];

    if (!originalLine || !TASK_CHECKBOX.test(originalLine)) {
      return {
        success: false,
        error: `Line ${line} is not a task.`,
      };
    }

    const isCompleted = /- \[x\]/i.test(originalLine);
    const today = new Date().toISOString().split('T')[0];

    let updatedLine: string;
    if (isCompleted) {
      // Uncompleting: remove completion date (both new and legacy syntax)
      updatedLine = originalLine
        .replace(/- \[x\]/i, '- [ ]')
        .replace(/\s*(\{completed:[^}]+\}|\[completed:\s*[^\]]+\])/, '');
    } else {
      // Completing: add completion date
      updatedLine = originalLine.replace(/- \[ \]/, '- [x]');
      if (
        !updatedLine.includes('{completed:') &&
        !updatedLine.includes('[completed:')
      ) {
        updatedLine = updatedLine.trimEnd() + ` {completed:${today}}`;
      }
    }

    lines[lineIndex] = updatedLine;
    await app.vault.modify(file, lines.join('\n'));

    const parseResult = parseTask(updatedLine, line, file.path, {});
    return {
      success: true,
      task: parseResult.task ?? undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to toggle task: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
