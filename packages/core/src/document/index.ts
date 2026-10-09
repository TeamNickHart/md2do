import { parseTask } from '../parser/index.js';
import { cleanTaskText } from '../parser/index.js';
import type { ParsingContext } from '../types/index.js';

export interface DocumentTask {
  content: string;
  rawLine: string;
  line: number;
  completed: boolean;
  priority?: string;
  tags: string[];
  dueDate?: Date;
  assignee?: string;
}

export interface DocumentSection {
  name: string;
  todoistId?: string;
  headingLine: number;
  tasks: DocumentTask[];
}

export interface DocumentTree {
  file: string;
  projectName?: string;
  projectTodoistId?: string;
  projectHeadingLine?: number;
  rootTasks: DocumentTask[];
  sections: DocumentSection[];
}

const HEADING_REGEX = /^(#{1,6})\s+(.+?)(?:\s+\{todoist:(\d+)\})?\s*$/;

function toDocumentTask(
  rawLine: string,
  lineNumber: number,
  file: string,
  context: ParsingContext,
): DocumentTask | null {
  const result = parseTask(rawLine, lineNumber, file, context);
  if (!result.task) return null;

  const task = result.task;
  const doc: DocumentTask = {
    content: cleanTaskText(rawLine.substring(rawLine.indexOf(']') + 1).trim()),
    rawLine,
    line: lineNumber,
    completed: task.completed,
    tags: task.tags,
  };

  if (task.priority) doc.priority = task.priority;
  if (task.dueDate) doc.dueDate = task.dueDate;
  if (task.assignee) doc.assignee = task.assignee;

  return doc;
}

export function parseDocument(
  filePath: string,
  content: string,
  context: ParsingContext = {},
): DocumentTree {
  const lines = content.split('\n');
  const tree: DocumentTree = {
    file: filePath,
    rootTasks: [],
    sections: [],
  };

  let currentSection: DocumentSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    const lineNumber = i + 1;

    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const name = headingMatch[2]!;
      const todoistId = headingMatch[3];

      if (level === 1 && !tree.projectName) {
        tree.projectName = name;
        tree.projectHeadingLine = lineNumber;
        if (todoistId) tree.projectTodoistId = todoistId;
        currentSection = null;
      } else if (level >= 2) {
        currentSection = {
          name,
          headingLine: lineNumber,
          tasks: [],
        };
        if (todoistId) currentSection.todoistId = todoistId;
        tree.sections.push(currentSection);
      }
      continue;
    }

    const task = toDocumentTask(line, lineNumber, filePath, context);
    if (task) {
      if (currentSection) {
        currentSection.tasks.push(task);
      } else {
        tree.rootTasks.push(task);
      }
    }
  }

  return tree;
}
