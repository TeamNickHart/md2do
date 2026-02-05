import * as vscode from 'vscode';
import { scanWorkspace } from '../utils/scanner.js';

/**
 * Provides intelligent auto-completion for task metadata
 */
export class TaskCompletionProvider implements vscode.CompletionItemProvider {
  private cachedAssignees: Set<string> = new Set();
  private cachedTags: Set<string> = new Set();

  /**
   * Update cached suggestions from workspace
   */
  async updateCache(): Promise<void> {
    const result = await scanWorkspace();

    // Collect assignees
    this.cachedAssignees.clear();
    for (const task of result.tasks) {
      if (task.assignee) {
        this.cachedAssignees.add(task.assignee);
      }
    }

    // Collect tags
    this.cachedTags.clear();
    for (const task of result.tasks) {
      for (const tag of task.tags) {
        this.cachedTags.add(tag);
      }
    }
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionItem[] | undefined {
    const line = document.lineAt(position.line);
    const lineText = line.text.substring(0, position.character);

    // Only provide completions on task lines
    if (!lineText.match(/^\s*-\s*\[([ x])\]/)) {
      return undefined;
    }

    // Progressive date completion: [due: 2, [due: 2026-, [due: 2026-02-
    // Handle auto-paired brackets: [due: 2] with cursor before ]
    const partialDateMatch = lineText.match(
      /\[(due|completed):\s*(\d{1,4}-?\d{0,2}-?\d{0,2})\]?$/i,
    );
    if (partialDateMatch && partialDateMatch[2]) {
      const partial = partialDateMatch[2];
      return this.getProgressiveDateCompletions(partial);
    }

    // Date completion: [due: | or [due: ] with cursor before ]
    // Handle auto-paired brackets
    if (lineText.match(/\[(due|completed):\s*\]?$/i)) {
      return this.getDateCompletions();
    }

    // Assignee completion: @|
    if (lineText.match(/@\w*$/)) {
      return this.getAssigneeCompletions();
    }

    // Tag completion: #|
    if (lineText.match(/#\w*$/)) {
      return this.getTagCompletions();
    }

    // Priority completion: !|
    if (lineText.match(/\s!+$/)) {
      return this.getPriorityCompletions();
    }

    return undefined;
  }

  /**
   * Get date completion suggestions
   */
  private getDateCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Get dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Helper to format date
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0]!;
    };

    // Get next Monday
    const nextMonday = new Date(today);
    const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);

    // Get end of week (Friday)
    const endOfWeek = new Date(today);
    const currentDay = today.getDay();
    const daysUntilFriday =
      currentDay <= 5 ? 5 - currentDay : 7 - currentDay + 5;
    endOfWeek.setDate(
      endOfWeek.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday),
    );

    // Today
    items.push({
      label: 'today',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(today),
      detail: formatDate(today),
      documentation: 'Due today',
      sortText: '1',
    });

    // Tomorrow
    items.push({
      label: 'tomorrow',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(tomorrow),
      detail: formatDate(tomorrow),
      documentation: 'Due tomorrow',
      sortText: '2',
    });

    // Next Monday
    items.push({
      label: 'next monday',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(nextMonday),
      detail: formatDate(nextMonday),
      documentation: 'Due next Monday',
      sortText: '3',
    });

    // End of week (Friday)
    items.push({
      label: 'end of week',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(endOfWeek),
      detail: formatDate(endOfWeek),
      documentation: 'Due end of week (Friday)',
      sortText: '4',
    });

    // Next week
    items.push({
      label: 'next week',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(nextWeek),
      detail: formatDate(nextWeek),
      documentation: 'Due in one week',
      sortText: '5',
    });

    // Next month
    items.push({
      label: 'next month',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(nextMonth),
      detail: formatDate(nextMonth),
      documentation: 'Due in one month',
      sortText: '6',
    });

    // Days of the week
    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    weekdays.forEach((day, index) => {
      const targetDay = new Date(today);
      const currentDay = today.getDay();
      const targetDayIndex = index + 1; // Monday = 1, Sunday = 7
      let daysToAdd = (targetDayIndex - currentDay + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7; // Next occurrence
      targetDay.setDate(targetDay.getDate() + daysToAdd);

      items.push({
        label: day.toLowerCase(),
        kind: vscode.CompletionItemKind.Value,
        insertText: formatDate(targetDay),
        detail: formatDate(targetDay),
        documentation: `Next ${day}`,
        sortText: `7${index}`,
      });
    });

    return items;
  }

  /**
   * Get progressive date completion suggestions based on partial input
   */
  private getProgressiveDateCompletions(
    partial: string,
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Year completion: "2" or "20" or "202" or "2026"
    if (/^\d{1,4}$/.test(partial)) {
      // Only suggest current year and future years
      const partialNum = parseInt(partial, 10);

      // If typing "2" or "20", suggest current year
      if (partial.length <= 2) {
        items.push({
          label: `${currentYear}-`,
          kind: vscode.CompletionItemKind.Value,
          insertText: `${currentYear}-`,
          detail: 'Current year',
          documentation: `Start typing date for ${currentYear}`,
          sortText: '1',
        });

        // Also suggest next year
        items.push({
          label: `${currentYear + 1}-`,
          kind: vscode.CompletionItemKind.Value,
          insertText: `${currentYear + 1}-`,
          detail: 'Next year',
          documentation: `Start typing date for ${currentYear + 1}`,
          sortText: '2',
        });
      } else if (partial.length === 3) {
        // Typing "202" - suggest 2026, 2027, 2028, 2029
        for (let i = 0; i < 10; i++) {
          const year = partialNum * 10 + i;
          if (year >= currentYear) {
            items.push({
              label: `${year}-`,
              kind: vscode.CompletionItemKind.Value,
              insertText: `${year}-`,
              detail: `Year ${year}`,
              documentation: `Start typing date for ${year}`,
              sortText: `${i}`,
            });
          }
        }
      } else if (partial.length === 4) {
        // Typing "2026" - suggest "2026-"
        if (partialNum >= currentYear) {
          items.push({
            label: `${partialNum}-`,
            kind: vscode.CompletionItemKind.Value,
            insertText: `${partialNum}-`,
            detail: `Year ${partialNum}`,
            documentation: `Start typing month for ${partialNum}`,
            sortText: '1',
          });
        }
      }
    }

    // Month completion: "2026-" or "2026-0" or "2026-1"
    const yearMonthMatch = partial.match(/^(\d{4})-(\d{0,2})$/);
    if (yearMonthMatch && yearMonthMatch[1]) {
      const year = parseInt(yearMonthMatch[1], 10);
      const monthPartial = yearMonthMatch[2] || '';

      // Suggest all months or filtered by partial
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');

        // Filter by partial month input
        if (monthPartial && !monthStr.startsWith(monthPartial)) {
          continue;
        }

        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

        items.push({
          label: `${year}-${monthStr}-`,
          kind: vscode.CompletionItemKind.Value,
          insertText: `${year}-${monthStr}-`,
          detail: monthNames[month - 1],
          documentation: `Start typing day for ${monthNames[month - 1]} ${year}`,
          sortText: monthStr,
        });
      }
    }

    // Day completion: "2026-02-" or "2026-02-0" or "2026-02-1"
    const fullDateMatch = partial.match(/^(\d{4})-(\d{2})-(\d{0,2})$/);
    if (fullDateMatch && fullDateMatch[1] && fullDateMatch[2]) {
      const year = parseInt(fullDateMatch[1], 10);
      const month = parseInt(fullDateMatch[2], 10);
      const dayPartial = fullDateMatch[3] || '';

      // Get number of days in the month (handle leap years)
      const daysInMonth = new Date(year, month, 0).getDate();

      // Suggest all valid days or filtered by partial
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');

        // Filter by partial day input
        if (dayPartial && !dayStr.startsWith(dayPartial)) {
          continue;
        }

        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

        items.push({
          label: `${year}-${fullDateMatch[2]}-${dayStr}`,
          kind: vscode.CompletionItemKind.Value,
          insertText: `${year}-${fullDateMatch[2]}-${dayStr}`,
          detail: dayOfWeek,
          documentation: `${dayOfWeek}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          sortText: dayStr,
        });
      }
    }

    return items;
  }

  /**
   * Get assignee completion suggestions
   */
  private getAssigneeCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Get configured assignees from settings
    const config = vscode.workspace.getConfiguration('md2do');
    const configuredAssignees = config.get<string[]>('defaultAssignees', []);

    // Add configured assignees first
    configuredAssignees.forEach((assignee, index) => {
      items.push({
        label: assignee,
        kind: vscode.CompletionItemKind.User,
        insertText: assignee,
        documentation: 'Configured assignee',
        sortText: `0${index}`,
      });
    });

    // Add cached assignees from workspace
    Array.from(this.cachedAssignees)
      .sort()
      .forEach((assignee, index) => {
        // Skip if already in configured assignees
        if (configuredAssignees.includes(`@${assignee}`)) {
          return;
        }

        items.push({
          label: assignee,
          kind: vscode.CompletionItemKind.User,
          insertText: assignee,
          documentation: 'From workspace',
          sortText: `1${index}`,
        });
      });

    return items;
  }

  /**
   * Get tag completion suggestions
   */
  private getTagCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Add tags from workspace, sorted by frequency
    const tagCounts = new Map<string, number>();
    Array.from(this.cachedTags).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });

    Array.from(this.cachedTags)
      .sort((a, b) => {
        const countA = tagCounts.get(a) || 0;
        const countB = tagCounts.get(b) || 0;
        if (countB !== countA) return countB - countA; // Sort by frequency desc
        return a.localeCompare(b); // Then alphabetically
      })
      .forEach((tag, index) => {
        items.push({
          label: tag,
          kind: vscode.CompletionItemKind.Value,
          insertText: tag,
          documentation: `Used ${tagCounts.get(tag)} times`,
          sortText: `${index}`.padStart(3, '0'),
        });
      });

    return items;
  }

  /**
   * Get priority completion suggestions
   */
  private getPriorityCompletions(): vscode.CompletionItem[] {
    return [
      {
        label: '!',
        kind: vscode.CompletionItemKind.Value,
        insertText: '!',
        detail: 'Normal priority',
        documentation: 'Standard priority level',
        sortText: '3',
      },
      {
        label: '!!',
        kind: vscode.CompletionItemKind.Value,
        insertText: '!!',
        detail: 'High priority',
        documentation: 'Important task',
        sortText: '2',
      },
      {
        label: '!!!',
        kind: vscode.CompletionItemKind.Value,
        insertText: '!!!',
        detail: 'Urgent priority',
        documentation: 'Critical task requiring immediate attention',
        sortText: '1',
      },
    ];
  }
}
