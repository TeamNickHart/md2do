import type { Task, Priority } from '../types/index.js';

/**
 * Comparator function type for sorting tasks
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
export type TaskComparator = (a: Task, b: Task) => number;

/**
 * Priority order for sorting (urgent > high > normal > low/none)
 */
const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

/**
 * Get priority sort value
 * Lower number = higher priority
 */
function getPrioritySortValue(priority: Priority | undefined): number {
  return priority !== undefined ? PRIORITY_ORDER[priority] : 3; // No priority = lowest
}

/**
 * Sort tasks by due date (earliest first)
 * Tasks without due dates come last
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byDueDate())
 */
export function byDueDate(): TaskComparator {
  return (a: Task, b: Task) => {
    // No due date goes to end
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;

    // Compare dates
    return a.dueDate.getTime() - b.dueDate.getTime();
  };
}

/**
 * Sort tasks by priority (urgent > high > normal > low)
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byPriority())
 */
export function byPriority(): TaskComparator {
  return (a: Task, b: Task) => {
    const aPriority = getPrioritySortValue(a.priority);
    const bPriority = getPrioritySortValue(b.priority);
    return aPriority - bPriority;
  };
}

/**
 * Sort tasks by context date (earliest first)
 * Tasks without context dates come last
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byCreatedDate())
 */
export function byCreatedDate(): TaskComparator {
  return (a: Task, b: Task) => {
    // No context date goes to end
    if (!a.contextDate && !b.contextDate) return 0;
    if (!a.contextDate) return 1;
    if (!b.contextDate) return -1;

    // Compare dates
    return a.contextDate.getTime() - b.contextDate.getTime();
  };
}

/**
 * Sort tasks by file path (alphabetically)
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byFile())
 */
export function byFile(): TaskComparator {
  return (a: Task, b: Task) => {
    // First compare file paths
    const fileCompare = a.file.localeCompare(b.file);
    if (fileCompare !== 0) return fileCompare;

    // If same file, sort by line number
    return a.line - b.line;
  };
}

/**
 * Sort tasks by project (alphabetically)
 * Tasks without projects come last
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byProject())
 */
export function byProject(): TaskComparator {
  return (a: Task, b: Task) => {
    // No project goes to end
    if (!a.project && !b.project) return 0;
    if (!a.project) return 1;
    if (!b.project) return -1;

    // Compare projects
    return a.project.localeCompare(b.project);
  };
}

/**
 * Sort tasks by person (alphabetically)
 * Tasks without person context come last
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byPerson())
 */
export function byPerson(): TaskComparator {
  return (a: Task, b: Task) => {
    // No person goes to end
    if (!a.person && !b.person) return 0;
    if (!a.person) return 1;
    if (!b.person) return -1;

    // Compare persons
    return a.person.localeCompare(b.person);
  };
}

/**
 * Sort tasks by assignee (alphabetically)
 * Tasks without assignees come last
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byAssignee())
 */
export function byAssignee(): TaskComparator {
  return (a: Task, b: Task) => {
    // No assignee goes to end
    if (!a.assignee && !b.assignee) return 0;
    if (!a.assignee) return 1;
    if (!b.assignee) return -1;

    // Compare assignees
    return a.assignee.localeCompare(b.assignee);
  };
}

/**
 * Sort tasks by completion status (incomplete first)
 *
 * @returns Comparator function
 *
 * @example
 * tasks.sort(byCompletionStatus())
 */
export function byCompletionStatus(): TaskComparator {
  return (a: Task, b: Task) => {
    // Incomplete (false) comes before completed (true)
    return Number(a.completed) - Number(b.completed);
  };
}

/**
 * Combine multiple comparators
 * Applies comparators in order until a non-zero result is found
 *
 * @param comparators - Array of comparator functions
 * @returns Combined comparator function
 *
 * @example
 * // Sort by priority, then by due date
 * tasks.sort(combineComparators([byPriority(), byDueDate()]))
 */
export function combineComparators(
  comparators: TaskComparator[],
): TaskComparator {
  return (a: Task, b: Task) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

/**
 * Reverse a comparator
 *
 * @param comparator - Comparator to reverse
 * @returns Reversed comparator
 *
 * @example
 * // Sort by due date descending (latest first)
 * tasks.sort(reverse(byDueDate()))
 */
export function reverse(comparator: TaskComparator): TaskComparator {
  return (a: Task, b: Task) => -comparator(a, b);
}
