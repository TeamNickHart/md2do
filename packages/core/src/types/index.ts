// Type definitions for md2do

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export interface Task {
  // Identity
  id: string;

  // Content
  text: string;
  completed: boolean;

  // Location
  file: string;
  line: number;

  // Extracted context
  project?: string;
  person?: string;
  contextDate?: Date;
  contextHeading?: string;

  // Explicit metadata
  assignee?: string;
  dueDate?: Date;
  priority?: Priority;
  tags: string[];

  // Optional Todoist sync
  todoistId?: string;
  completedDate?: Date;
}

export interface ParsingContext {
  project?: string;
  person?: string;
  currentDate?: Date;
  currentHeading?: string;
}

export interface TaskFilterCriteria {
  assignee?: string | string[];
  completed?: boolean;
  overdue?: boolean;
  dueDate?: {
    before?: Date;
    after?: Date;
    exact?: Date;
  };
  priority?: Priority | Priority[];
  project?: string | string[];
  person?: string | string[];
  tags?: string | string[];
  hasTag?: boolean;
  path?: string;
}

export interface ScanResult {
  tasks: Task[];
  warnings: Warning[];
  metadata: {
    filesScanned: number;
    totalTasks: number;
    parseErrors: number;
  };
}

export type WarningSeverity = 'info' | 'warning' | 'error';

export type WarningCode =
  | 'unsupported-bullet' // * or + instead of -
  | 'malformed-checkbox' // [x ] or [ x]
  | 'missing-space-after' // -[x]Task
  | 'missing-space-before' // -[x] Task
  | 'relative-date-no-context' // [due: tomorrow] without heading date
  | 'missing-due-date' // Incomplete task with no due date
  | 'missing-completed-date' // [x] without [completed: date]
  | 'duplicate-todoist-id' // Same Todoist ID in multiple tasks
  | 'file-read-error'; // Failed to read file

export interface Warning {
  // Position
  file: string;
  line: number;
  column?: number;

  // Classification
  severity: WarningSeverity;
  source: 'md2do';
  ruleId: WarningCode;

  // Content
  message: string; // User-facing message
  text?: string; // The actual text that triggered it

  // Documentation (optional - for future use)
  url?: string;

  // Legacy field for backward compatibility (deprecated)
  /** @deprecated Use message instead */
  reason?: string;
}
