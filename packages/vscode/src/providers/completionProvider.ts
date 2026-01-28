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

    // Date completion: [due: | or [completed: |
    if (lineText.match(/\[(due|completed):\s*$/i)) {
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

    // Today
    items.push({
      label: 'today',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(today) + ']',
      detail: formatDate(today),
      documentation: 'Due today',
      sortText: '1',
    });

    // Tomorrow
    items.push({
      label: 'tomorrow',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(tomorrow) + ']',
      detail: formatDate(tomorrow),
      documentation: 'Due tomorrow',
      sortText: '2',
    });

    // Next Monday
    items.push({
      label: 'next monday',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(nextMonday) + ']',
      detail: formatDate(nextMonday),
      documentation: 'Due next Monday',
      sortText: '3',
    });

    // Next week
    items.push({
      label: 'next week',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(nextWeek) + ']',
      detail: formatDate(nextWeek),
      documentation: 'Due in one week',
      sortText: '4',
    });

    // Next month
    items.push({
      label: 'next month',
      kind: vscode.CompletionItemKind.Value,
      insertText: formatDate(nextMonth) + ']',
      detail: formatDate(nextMonth),
      documentation: 'Due in one month',
      sortText: '5',
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
        insertText: formatDate(targetDay) + ']',
        detail: formatDate(targetDay),
        documentation: `Next ${day}`,
        sortText: `6${index}`,
      });
    });

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
