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

  // Explicit metadata
  assignee?: string;
  dueDate?: Date;
  priority?: Priority;
  tags: string[];

  // Optional external source links (slug → externalId)
  sources?: Record<string, string>;
  completedDate?: Date;
}

export interface ParsingContext {
  project?: string;
  person?: string;
  // Workday configuration for time handling
  workdayStartTime?: string; // e.g., "08:00"
  workdayEndTime?: string; // e.g., "17:00"
  defaultDueTime?: 'start' | 'end'; // Which time to use when no time specified
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
  | 'relative-date-no-context' // [due: tomorrow] — relative dates no longer supported
  | 'missing-due-date' // Incomplete task with no due date
  | 'missing-completed-date' // [x] without [completed: date]
  | 'duplicate-source-id' // Same source:id in multiple tasks
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

export interface SourceTask {
  externalId: string;
  text: string;
  completed: boolean;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  dueDate?: string; // YYYY-MM-DD
  tags?: string[];
  assignee?: string;
  metadata?: Record<string, unknown>;
}

export interface FetchOptions {
  since?: Date;
  limit?: number;
  filter?: Record<string, unknown>;
}

export interface SourceProvider {
  readonly slug: string;
  readonly name: string;
  fetchTasks(options?: FetchOptions): Promise<SourceTask[]>;
  completeTask?(externalId: string): Promise<void>;
  reopenTask?(externalId: string): Promise<void>;
}

export interface IngestRecord {
  source: string;
  externalId: string;
  text: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  assignee?: string;
  metadata?: Record<string, unknown>;
}
