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

export interface TaskFilter {
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

export interface Warning {
  file: string;
  line: number;
  text: string;
  reason: string;
}
