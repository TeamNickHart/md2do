import type {
  Task,
  ParsingContext,
  Priority,
  Warning,
} from '../types/index.js';
import { PATTERNS } from './patterns.js';
import { parseAbsoluteDate, resolveRelativeDate } from '../utils/dates.js';
import { generateTaskId } from '../utils/id.js';

/**
 * Extract assignee from task text
 *
 * @param text - Task text
 * @returns Username without @ symbol, or undefined
 *
 * @example
 * extractAssignee("@nick Review PR") // => "nick"
 * extractAssignee("Review PR") // => undefined
 */
export function extractAssignee(text: string): string | undefined {
  const match = text.match(PATTERNS.ASSIGNEE);
  return match?.[1];
}

/**
 * Extract priority level from task text
 *
 * Priority is determined by exclamation marks:
 *   - !!! = urgent
 *   - !! = high
 *   - ! = normal
 *   - (none) = low
 *
 * @param text - Task text
 * @returns Priority level or undefined if no priority markers
 */
export function extractPriority(text: string): Priority | undefined {
  if (PATTERNS.PRIORITY_URGENT.test(text)) return 'urgent';
  if (PATTERNS.PRIORITY_HIGH.test(text)) return 'high';
  if (PATTERNS.PRIORITY_NORMAL.test(text)) return 'normal';
  return undefined;
}

/**
 * Extract all tags from task text
 *
 * @param text - Task text
 * @returns Array of tag names (without # symbol)
 *
 * @example
 * extractTags("Review PR #backend #urgent") // => ["backend", "urgent"]
 * extractTags("No tags here") // => []
 */
export function extractTags(text: string): string[] {
  const matches = text.matchAll(PATTERNS.TAG);
  return Array.from(matches, (match) => match[1]).filter(
    (tag): tag is string => tag !== undefined,
  );
}

/**
 * Extract Todoist ID from task text
 *
 * @param text - Task text
 * @returns Todoist ID string or undefined
 *
 * @example
 * extractTodoistId("Task [todoist:123456]") // => "123456"
 */
export function extractTodoistId(text: string): string | undefined {
  const match = text.match(PATTERNS.TODOIST_ID);
  return match?.[1];
}

/**
 * Extract completion date from task text
 *
 * @param text - Task text
 * @returns Parsed Date or undefined
 *
 * @example
 * extractCompletedDate("[completed: 2026-01-18]") // => Date(2026-01-18)
 */
export function extractCompletedDate(text: string): Date | undefined {
  const match = text.match(PATTERNS.COMPLETED_DATE);
  if (!match?.[1]) return undefined;

  const date = parseAbsoluteDate(match[1]);
  return date ?? undefined;
}

/**
 * Extract due date from task text with context awareness
 *
 * Handles both absolute dates ([due: 2026-01-25]) and relative dates
 * ([due: tomorrow]) which require context.
 *
 * @param text - Task text
 * @param context - Parsing context (for relative dates)
 * @returns Object with parsed date and optional warning
 */
export function extractDueDate(
  text: string,
  context: ParsingContext,
): { date: Date | undefined; warning?: Warning } {
  // Try absolute date first
  const absoluteMatch = text.match(PATTERNS.DUE_DATE_ABSOLUTE);
  if (absoluteMatch?.[1]) {
    const date = parseAbsoluteDate(absoluteMatch[1]);
    return { date: date ?? undefined };
  }

  // Try short format (M/D or M/D/YY)
  const shortMatch = text.match(PATTERNS.DUE_DATE_SHORT);
  if (shortMatch?.[1]) {
    const date = parseAbsoluteDate(shortMatch[1]);
    return { date: date ?? undefined };
  }

  // Try relative date
  const relativeMatch = text.match(PATTERNS.DUE_DATE_RELATIVE);
  if (relativeMatch?.[1]) {
    if (!context.currentDate) {
      // Relative date without context - create warning
      return {
        date: undefined,
        warning: {
          file: '', // Will be filled in by caller
          line: 0, // Will be filled in by caller
          text: text.trim(),
          reason:
            'Relative due date without context date from heading. Add a heading with a date above this task.',
        },
      };
    }

    const date = resolveRelativeDate(relativeMatch[1], context.currentDate);
    return { date: date ?? undefined };
  }

  return { date: undefined };
}

/**
 * Clean task text by removing metadata markers
 *
 * Removes:
 *   - Assignees (@username)
 *   - Due dates ([due: ...])
 *   - Priority markers (!, !!, !!!)
 *   - Tags (#tag)
 *   - Todoist IDs ([todoist:...])
 *   - Completion dates ([completed:...])
 *
 * @param text - Raw task text
 * @returns Cleaned text for display
 *
 * @example
 * cleanTaskText("@nick Review PR !! #backend [due: 2026-01-25]")
 * // => "Review PR"
 */
export function cleanTaskText(text: string): string {
  return (
    text
      // Remove metadata in brackets
      .replace(PATTERNS.DUE_DATE_ABSOLUTE, '')
      .replace(PATTERNS.DUE_DATE_RELATIVE, '')
      .replace(PATTERNS.DUE_DATE_SHORT, '')
      .replace(PATTERNS.TODOIST_ID, '')
      .replace(PATTERNS.COMPLETED_DATE, '')
      // Remove assignee
      .replace(PATTERNS.ASSIGNEE, '')
      // Remove tags
      .replace(PATTERNS.TAG, '')
      // Remove priority markers
      .replace(/!!!/g, '')
      .replace(/!!/g, '')
      .replace(/!/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Parse a single line as a task
 *
 * This is the main parser entry point. It:
 *   1. Checks if the line is a task
 *   2. Extracts completion status
 *   3. Parses all metadata (assignee, priority, dates, tags)
 *   4. Cleans the text
 *   5. Generates a stable ID
 *   6. Applies context (project, person, heading date)
 *
 * @param line - Line of text to parse
 * @param lineNumber - Line number in file (1-indexed)
 * @param file - Relative file path
 * @param context - Parsing context
 * @returns Parsed Task object or null if line is not a task, plus any warnings
 */
export function parseTask(
  line: string,
  lineNumber: number,
  file: string,
  context: ParsingContext,
): { task: Task | null; warnings: Warning[] } {
  const warnings: Warning[] = [];

  // Detect malformed checkboxes and provide helpful warnings
  // Check for asterisk/plus bullet markers (not supported)
  if (/^\s*[*+]\s+\[[ xX]\]/.test(line)) {
    warnings.push({
      file,
      line: lineNumber,
      text: line.trim(),
      reason:
        'Unsupported bullet marker (* or +). Use dash (-) for task lists.',
    });
    return { task: null, warnings };
  }

  // Check for extra spaces inside checkbox: [x ] or [ x]
  if (/^\s*-\s+\[[xX]\s+\]/.test(line) || /^\s*-\s+\[\s+[xX]\]/.test(line)) {
    warnings.push({
      file,
      line: lineNumber,
      text: line.trim(),
      reason:
        'Malformed checkbox with extra spaces. Use [x] or [ ] without extra spaces.',
    });
    return { task: null, warnings };
  }

  // Check for missing space after checkbox: [x]Task
  if (/^\s*-\s+\[[ xX]\][^\s]/.test(line)) {
    warnings.push({
      file,
      line: lineNumber,
      text: line.trim(),
      reason: 'Missing space after checkbox. Use "- [x] Task" format.',
    });
    return { task: null, warnings };
  }

  // Check for missing space before checkbox: -[x]
  if (/^\s*-\[[ xX]\]/.test(line)) {
    warnings.push({
      file,
      line: lineNumber,
      text: line.trim(),
      reason: 'Missing space before checkbox. Use "- [x] Task" format.',
    });
    return { task: null, warnings };
  }

  // Check if line is a task
  const taskMatch = line.match(PATTERNS.TASK_CHECKBOX);
  if (!taskMatch?.[0] || !taskMatch[2]) {
    return { task: null, warnings };
  }

  // Extract completion status
  const completed = taskMatch[2].toLowerCase() === 'x';

  // Extract text (everything after checkbox)
  const fullText = line.substring(taskMatch[0].length);

  // Parse metadata from text
  const assignee = extractAssignee(fullText);
  const priority = extractPriority(fullText);
  const tags = extractTags(fullText);
  const todoistId = extractTodoistId(fullText);
  const completedDate = extractCompletedDate(fullText);

  // Extract due date (may produce warning)
  const dueDateResult = extractDueDate(fullText, context);
  if (dueDateResult.warning) {
    warnings.push({
      ...dueDateResult.warning,
      file,
      line: lineNumber,
    });
  }

  // Warn about missing dates
  // Incomplete tasks without any date (no explicit due date and no context date)
  if (!completed && !dueDateResult.date && !context.currentDate) {
    warnings.push({
      file,
      line: lineNumber,
      text: fullText.trim(),
      reason:
        'Task has no due date. Add [due: YYYY-MM-DD] or place under a heading with a date.',
    });
  }

  // Completed tasks should have completion dates
  if (completed && !completedDate) {
    warnings.push({
      file,
      line: lineNumber,
      text: fullText.trim(),
      reason:
        'Completed task missing completion date. Add [completed: YYYY-MM-DD].',
    });
  }

  // Clean text (remove metadata markers)
  const cleanText = cleanTaskText(fullText);

  // Generate stable ID
  const id = generateTaskId(file, lineNumber, cleanText);

  // Build task object with only defined properties
  const task: Task = {
    id,
    text: cleanText,
    completed,
    file,
    line: lineNumber,
    tags,
  };

  // Add optional fields only if defined
  if (assignee !== undefined) task.assignee = assignee;
  if (priority !== undefined) task.priority = priority;
  if (dueDateResult.date !== undefined) task.dueDate = dueDateResult.date;
  if (todoistId !== undefined) task.todoistId = todoistId;
  if (completedDate !== undefined) task.completedDate = completedDate;
  if (context.project !== undefined) task.project = context.project;
  if (context.person !== undefined) task.person = context.person;
  if (context.currentDate !== undefined) task.contextDate = context.currentDate;
  if (context.currentHeading !== undefined)
    task.contextHeading = context.currentHeading;

  return { task, warnings };
}
