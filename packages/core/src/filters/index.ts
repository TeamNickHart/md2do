import {
  addDays,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import type { Task, Priority } from '../types/index.js';

/**
 * Filter predicate function type
 * Returns true if task should be included in results
 */
export type TaskFilter = (task: Task) => boolean;

/**
 * Filter tasks by assignee
 *
 * @param assignee - Username to filter by (without @ symbol)
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(byAssignee('nick'))
 */
export function byAssignee(assignee: string): TaskFilter {
  return (task: Task) => task.assignee === assignee;
}

/**
 * Filter tasks by completion status
 *
 * @param completed - true for completed, false for incomplete
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(byCompleted(false)) // Get incomplete tasks
 */
export function byCompleted(completed: boolean): TaskFilter {
  return (task: Task) => task.completed === completed;
}

/**
 * Filter tasks by priority level
 *
 * @param priority - Priority level to filter by
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(byPriority('urgent'))
 */
export function byPriority(priority: Priority): TaskFilter {
  return (task: Task) => task.priority === priority;
}

/**
 * Filter tasks by project
 *
 * @param project - Project name to filter by
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(byProject('acme-app'))
 */
export function byProject(project: string): TaskFilter {
  return (task: Task) => task.project === project;
}

/**
 * Filter tasks by person (from 1-1 context)
 *
 * @param person - Person identifier to filter by
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(byPerson('jane-doe'))
 */
export function byPerson(person: string): TaskFilter {
  return (task: Task) => task.person === person;
}

/**
 * Filter tasks by tag
 *
 * @param tag - Tag to filter by (without # symbol)
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(byTag('urgent'))
 */
export function byTag(tag: string): TaskFilter {
  return (task: Task) => task.tags.includes(tag);
}

/**
 * Filter tasks by file path
 *
 * @param path - File path or directory to filter by
 * @param options - Filter options
 * @returns Filter predicate
 *
 * @example
 * // Match exact file
 * tasks.filter(byPath('projects/acme-app/sprint.md'))
 *
 * // Match directory (recursive)
 * tasks.filter(byPath('projects/acme-app'))
 *
 * // Match directory (non-recursive)
 * tasks.filter(byPath('projects/acme-app', { recursive: false }))
 */
export function byPath(
  path: string,
  options: { recursive?: boolean } = { recursive: true },
): TaskFilter {
  const normalizedPath = path.replace(/\\/g, '/');
  const isDirectory = !normalizedPath.endsWith('.md');

  return (task: Task) => {
    const taskPath = task.file.replace(/\\/g, '/');

    // Exact file match
    if (!isDirectory) {
      return taskPath === normalizedPath;
    }

    // Directory match
    if (options.recursive) {
      // Recursive: match if task is in directory or subdirectories
      return (
        taskPath.startsWith(normalizedPath + '/') || taskPath === normalizedPath
      );
    } else {
      // Non-recursive: match only direct children
      const dirPrefix = normalizedPath + '/';
      if (!taskPath.startsWith(dirPrefix)) {
        return false;
      }
      // Check that there are no additional slashes after the directory
      const remainder = taskPath.substring(dirPrefix.length);
      return !remainder.includes('/');
    }
  };
}

// Due dates are calendar dates in the user's local timezone (the parser
// creates them at local time), so "today" and "this week" use local day
// boundaries. Weeks run Monday to Sunday.

/**
 * Filter tasks that are overdue
 * A task is overdue if it is due before today (local time)
 *
 * @param referenceDate - Date to compare against (defaults to now)
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(isOverdue())
 */
export function isOverdue(referenceDate: Date = new Date()): TaskFilter {
  const today = startOfDay(referenceDate);

  return (task: Task) => {
    if (!task.dueDate || task.completed) {
      return false;
    }
    return task.dueDate < today;
  };
}

/**
 * Filter tasks due today
 *
 * @param referenceDate - Date to compare against (defaults to now)
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(isDueToday())
 */
export function isDueToday(referenceDate: Date = new Date()): TaskFilter {
  const todayStart = startOfDay(referenceDate);
  const todayEnd = endOfDay(referenceDate);

  return (task: Task) => {
    if (!task.dueDate || task.completed) {
      return false;
    }
    return task.dueDate >= todayStart && task.dueDate <= todayEnd;
  };
}

/**
 * Filter tasks due this week
 *
 * @param referenceDate - Date to compare against (defaults to now)
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(isDueThisWeek())
 */
export function isDueThisWeek(referenceDate: Date = new Date()): TaskFilter {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  return (task: Task) => {
    if (!task.dueDate || task.completed) {
      return false;
    }
    return task.dueDate >= weekStart && task.dueDate <= weekEnd;
  };
}

/**
 * Filter tasks due within a specific number of days
 *
 * @param days - Number of days from reference date
 * @param referenceDate - Date to compare against (defaults to now)
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(isDueWithinDays(7)) // Due in next 7 days
 */
export function isDueWithinDays(
  days: number,
  referenceDate: Date = new Date(),
): TaskFilter {
  const start = startOfDay(referenceDate);
  const end = endOfDay(addDays(referenceDate, days));

  return (task: Task) => {
    if (!task.dueDate || task.completed) {
      return false;
    }
    return task.dueDate >= start && task.dueDate <= end;
  };
}

/**
 * Filter tasks that have a due date set
 *
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(hasDueDate())
 */
export function hasDueDate(): TaskFilter {
  return (task: Task) => task.dueDate !== undefined;
}

/**
 * Filter tasks that have no due date set
 *
 * @returns Filter predicate
 *
 * @example
 * tasks.filter(hasNoDueDate())
 */
export function hasNoDueDate(): TaskFilter {
  return (task: Task) => task.dueDate === undefined;
}

/**
 * Combine multiple filters with AND logic
 *
 * @param filters - Array of filter predicates
 * @returns Combined filter predicate
 *
 * @example
 * tasks.filter(combineFilters([
 *   byAssignee('nick'),
 *   byPriority('urgent'),
 *   isOverdue()
 * ]))
 */
export function combineFilters(filters: TaskFilter[]): TaskFilter {
  return (task: Task) => filters.every((filter) => filter(task));
}

/**
 * Combine multiple filters with OR logic
 *
 * @param filters - Array of filter predicates
 * @returns Combined filter predicate
 *
 * @example
 * tasks.filter(combineFiltersOr([
 *   isOverdue(),
 *   isDueToday()
 * ]))
 */
export function combineFiltersOr(filters: TaskFilter[]): TaskFilter {
  return (task: Task) => filters.some((filter) => filter(task));
}

/**
 * Negate a filter
 *
 * @param filter - Filter predicate to negate
 * @returns Negated filter predicate
 *
 * @example
 * tasks.filter(not(byCompleted(true))) // Get incomplete tasks
 */
export function not(filter: TaskFilter): TaskFilter {
  return (task: Task) => !filter(task);
}
