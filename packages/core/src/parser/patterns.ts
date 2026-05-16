/**
 * Regular expression patterns for parsing markdown task syntax
 *
 * All patterns are documented with examples and test cases.
 */

/**
 * Matches GitHub Flavored Markdown task checkbox syntax
 *
 * Examples:
 *   "- [ ] Task" → match, incomplete
 *   "- [x] Task" → match, complete
 *   "  - [X] Task" → match, complete (case-insensitive)
 *   "* [ ] Task" → no match (only dash lists supported)
 *
 * Groups:
 *   [1] - Leading whitespace (indentation)
 *   [2] - Checkbox state: space (incomplete) or x/X (complete)
 */
export const TASK_CHECKBOX = /^(\s*)-\s+\[([ xX])\]\s+/;

/**
 * Matches assignee mentions (@username)
 *
 * Examples:
 *   "@nick" → "nick"
 *   "@jane-doe" → "jane-doe"
 *   "@alex_chen" → no match (underscores not supported)
 *
 * Groups:
 *   [1] - Username (alphanumeric and hyphens only)
 */
export const ASSIGNEE = /@([\w-]+)/;

/**
 * Matches urgent priority marker (triple exclamation)
 *
 * Examples:
 *   "Task !!!" → match
 *   "Task !!" → no match
 */
export const PRIORITY_URGENT = /!!!/;

/**
 * Matches high priority marker (double exclamation)
 *
 * Examples:
 *   "Task !!" → match
 *   "Task !!!" → no match (would match urgent first)
 */
export const PRIORITY_HIGH = /!!/;

/**
 * Matches normal priority marker (single exclamation, not part of !! or !!!)
 *
 * Examples:
 *   "Task !" → match
 *   "Task !!" → no match
 *   "Task !!!" → no match
 *
 * Uses negative lookbehind and lookahead to ensure single !
 */
export const PRIORITY_NORMAL = /(?<!!)!(?!!)/;

/**
 * Matches due date in new syntax (#due/YYYY-MM-DD) or legacy bracket syntax
 *
 * New syntax examples:
 *   "#due/2026-01-25" → group 1: "2026-01-25"
 *
 * Legacy syntax examples:
 *   "[due: 2026-01-25]" → group 2: "2026-01-25", group 3: optional time
 *   "[due: 2026-01-25 17:00]" → group 2: "2026-01-25", group 3: "17:00"
 *   "[due:2026-01-25]" → group 2: "2026-01-25"
 *
 * Groups:
 *   [1] - Date from new #due/ syntax
 *   [2] - Date from legacy [due:] syntax
 *   [3] - Optional time from legacy syntax
 */
export const DUE_DATE_ABSOLUTE =
  /#due\/(\d{4}-\d{2}-\d{2})|\[due:\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?\s*\]/i;

/**
 * Matches relative due date keywords
 *
 * Examples:
 *   "[due: tomorrow]" → "tomorrow"
 *   "[due: next week]" → "next week"
 *   "[due: today]" → "today"
 *   "[due: next month]" → "next month"
 *
 * Groups:
 *   [1] - Relative date keyword
 */
export const DUE_DATE_RELATIVE =
  /\[due:\s*(tomorrow|today|next\s+week|next\s+month)\]/i;

/**
 * Matches short date format [due: M/D] or [due: M/D/YY]
 *
 * Examples:
 *   "[due: 1/25]" → "1/25"
 *   "[due: 1/25/26]" → "1/25/26"
 *   "[due: 12/31/2026]" → "12/31/2026"
 *
 * Groups:
 *   [1] - Date string in M/D or M/D/YY or M/D/YYYY format
 */
export const DUE_DATE_SHORT = /\[due:\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\]/i;

/**
 * Matches hashtags for categorization, excluding #due/ prefix
 *
 * Examples:
 *   "#backend" → "backend"
 *   "#urgent-fix" → "urgent-fix"
 *   "# heading" → no match (space after #)
 *   "#due/2026-01-25" → no match (due date, not a tag)
 *
 * Groups:
 *   [1] - Tag name (alphanumeric and hyphens only)
 *
 * Note: Use with .match() or .matchAll() to get all tags
 */
export const TAG = /#(?!due\/)([\w-]+)/g;

/**
 * Matches Todoist ID in new syntax ({todoist:NNN}) or legacy bracket syntax
 *
 * New syntax examples:
 *   "{todoist:123456789}" → group 1: "123456789"
 *
 * Legacy syntax examples:
 *   "[todoist:123456789]" → group 2: "123456789"
 *   "[todoist: 987654321]" → group 2: "987654321"
 *
 * Groups:
 *   [1] - Todoist ID from new {todoist:} syntax
 *   [2] - Todoist ID from legacy [todoist:] syntax
 */
export const TODOIST_ID = /\{todoist:(\d+)\}|\[todoist:\s*(\d+)\]/i;

/**
 * Matches completion date in new syntax ({completed:YYYY-MM-DD}) or legacy bracket syntax
 *
 * New syntax examples:
 *   "{completed:2026-01-18}" → group 1: "2026-01-18"
 *
 * Legacy syntax examples:
 *   "[completed: 2026-01-18]" → group 2: "2026-01-18"
 *   "[completed:2026-01-18]" → group 2: "2026-01-18"
 *
 * Groups:
 *   [1] - Date from new {completed:} syntax
 *   [2] - Date from legacy [completed:] syntax
 */
export const COMPLETED_DATE =
  /\{completed:(\d{4}-\d{2}-\d{2})\}|\[completed:\s*(\d{4}-\d{2}-\d{2})\]/i;

/**
 * Combined patterns object for easy import
 */
export const PATTERNS = {
  TASK_CHECKBOX,
  ASSIGNEE,
  PRIORITY_URGENT,
  PRIORITY_HIGH,
  PRIORITY_NORMAL,
  DUE_DATE_ABSOLUTE,
  DUE_DATE_RELATIVE,
  DUE_DATE_SHORT,
  TAG,
  TODOIST_ID,
  COMPLETED_DATE,
} as const;
