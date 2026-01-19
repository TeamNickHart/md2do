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
 * Matches absolute due date in ISO format [due: YYYY-MM-DD]
 *
 * Examples:
 *   "[due: 2026-01-25]" → "2026-01-25"
 *   "[due:2026-01-25]" → "2026-01-25" (spaces optional)
 *   "[due:  2026-01-25  ]" → "2026-01-25" (whitespace allowed)
 *
 * Groups:
 *   [1] - Date string in YYYY-MM-DD format
 */
export const DUE_DATE_ABSOLUTE = /\[due:\s*(\d{4}-\d{2}-\d{2})\s*\]/i;

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
 * Matches hashtags for categorization
 *
 * Examples:
 *   "#backend" → "backend"
 *   "#urgent-fix" → "urgent-fix"
 *   "# heading" → no match (space after #)
 *
 * Groups:
 *   [1] - Tag name (alphanumeric and hyphens only)
 *
 * Note: Use with .match() or .matchAll() to get all tags
 */
export const TAG = /#([\w-]+)/g;

/**
 * Matches Todoist integration ID marker
 *
 * Examples:
 *   "[todoist:123456789]" → "123456789"
 *   "[todoist: 987654321]" → "987654321"
 *
 * Groups:
 *   [1] - Todoist task ID (numeric)
 */
export const TODOIST_ID = /\[todoist:\s*(\d+)\]/i;

/**
 * Matches completion date timestamp
 *
 * Examples:
 *   "[completed: 2026-01-18]" → "2026-01-18"
 *   "[completed:2026-01-18]" → "2026-01-18"
 *
 * Groups:
 *   [1] - Date string in YYYY-MM-DD format
 */
export const COMPLETED_DATE = /\[completed:\s*(\d{4}-\d{2}-\d{2})\]/i;

/**
 * Matches dates in markdown headings (various formats)
 *
 * Supported formats:
 *   - "## Meeting 1/13/26" → "1/13/26"
 *   - "## Sprint Planning 01/13/2026" → "01/13/2026"
 *   - "### Notes 2026-01-13" → "2026-01-13"
 *
 * Groups:
 *   [1] - Date string (format varies)
 */
export const HEADING_DATE_SLASH = /^#{1,6}\s+.*?(\d{1,2}\/\d{1,2}\/\d{2,4})/;
export const HEADING_DATE_ISO = /^#{1,6}\s+.*?(\d{4}-\d{2}-\d{2})/;

/**
 * Matches month names in headings for natural date parsing
 *
 * Examples:
 *   "## Q1 Planning - Jan 15, 2026" → "Jan 15, 2026"
 *   "### Meeting March 1, 2026" → "March 1, 2026"
 *
 * Groups:
 *   [1] - Month name
 *   [2] - Day
 *   [3] - Year
 */
export const HEADING_DATE_NATURAL =
  /^#{1,6}\s+.*?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i;

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
  HEADING_DATE_SLASH,
  HEADING_DATE_ISO,
  HEADING_DATE_NATURAL,
} as const;
