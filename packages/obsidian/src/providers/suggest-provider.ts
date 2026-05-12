import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from 'obsidian';
import type Md2doPlugin from '../main';

interface Suggestion {
  label: string;
  replacement: string;
  detail?: string;
}

export class TaskSuggestProvider extends EditorSuggest<Suggestion> {
  private plugin: Md2doPlugin;

  constructor(plugin: Md2doPlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _file: TFile | null,
  ): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);

    // Only trigger on task lines
    if (!line.match(/^\s*-\s*\[[ xX]\]/)) {
      return null;
    }

    const textUpToCursor = line.substring(0, cursor.ch);

    // Check for [due: or [completed: trigger (with or without auto-paired bracket)
    const dateMatch = textUpToCursor.match(/\[(due|completed):\s*\]?$/i);
    if (dateMatch && dateMatch.index !== undefined) {
      return {
        start: { line: cursor.line, ch: dateMatch.index + dateMatch[0].length },
        end: cursor,
        query: 'date:',
      };
    }

    // Check for partial date value: [due: 2026-05-
    const dateValueMatch = textUpToCursor.match(
      /\[(due|completed):\s+(\d[\d-]*)\]?$/i,
    );
    if (
      dateValueMatch &&
      dateValueMatch.index !== undefined &&
      dateValueMatch[2]
    ) {
      return {
        start: {
          line: cursor.line,
          ch:
            dateValueMatch.index + dateValueMatch[0].indexOf(dateValueMatch[2]),
        },
        end: cursor,
        query: `dateValue:${dateValueMatch[2]}`,
      };
    }

    // Check for @ trigger
    const assigneeMatch = textUpToCursor.match(/@(\w*)$/);
    if (assigneeMatch) {
      return {
        start: { line: cursor.line, ch: assigneeMatch.index! + 1 },
        end: cursor,
        query: `assignee:${assigneeMatch[1]}`,
      };
    }

    // Check for # trigger
    const tagMatch = textUpToCursor.match(/#(\w*)$/);
    if (tagMatch) {
      return {
        start: { line: cursor.line, ch: tagMatch.index! + 1 },
        end: cursor,
        query: `tag:${tagMatch[1]}`,
      };
    }

    // Check for ! priority trigger (only after whitespace)
    const priorityMatch = textUpToCursor.match(/\s(!{1,3})$/);
    if (priorityMatch) {
      return {
        start: { line: cursor.line, ch: priorityMatch.index! + 1 },
        end: cursor,
        query: `priority:${priorityMatch[1]}`,
      };
    }

    return null;
  }

  getSuggestions(context: EditorSuggestContext): Suggestion[] {
    const query = context.query;

    if (query === 'date:') {
      return this.getDateSuggestions();
    }
    if (query.startsWith('dateValue:')) {
      const partial = query.slice('dateValue:'.length);
      return this.getProgressiveDateSuggestions(partial);
    }
    if (query.startsWith('assignee:')) {
      const partial = query.slice('assignee:'.length);
      return this.getAssigneeSuggestions(partial);
    }
    if (query.startsWith('tag:')) {
      const partial = query.slice('tag:'.length);
      return this.getTagSuggestions(partial);
    }
    if (query.startsWith('priority:')) {
      return this.getPrioritySuggestions();
    }

    return [];
  }

  renderSuggestion(suggestion: Suggestion, el: HTMLElement): void {
    const container = el.createDiv({ cls: 'md2do-suggestion' });
    container.createDiv({
      cls: 'md2do-suggestion-label',
      text: suggestion.label,
    });
    if (suggestion.detail) {
      container.createDiv({
        cls: 'md2do-suggestion-detail',
        text: suggestion.detail,
      });
    }
  }

  selectSuggestion(suggestion: Suggestion): void {
    if (!this.context) return;

    const editor = this.context.editor;
    const start = this.context.start;
    const end = this.context.end;

    editor.replaceRange(suggestion.replacement, start, end);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getDateSuggestions(): Suggestion[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const nextMonday = new Date(today);
    const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);

    const endOfWeek = new Date(today);
    const currentDay = today.getDay();
    const daysUntilFriday =
      currentDay <= 5 ? 5 - currentDay : 7 - currentDay + 5;
    endOfWeek.setDate(
      endOfWeek.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday),
    );

    return [
      {
        label: `Today (${this.formatDate(today)})`,
        replacement: this.formatDate(today),
        detail: 'Due today',
      },
      {
        label: `Tomorrow (${this.formatDate(tomorrow)})`,
        replacement: this.formatDate(tomorrow),
        detail: 'Due tomorrow',
      },
      {
        label: `Next Monday (${this.formatDate(nextMonday)})`,
        replacement: this.formatDate(nextMonday),
        detail: 'Due next Monday',
      },
      {
        label: `End of week (${this.formatDate(endOfWeek)})`,
        replacement: this.formatDate(endOfWeek),
        detail: 'Due Friday',
      },
      {
        label: `Next week (${this.formatDate(nextWeek)})`,
        replacement: this.formatDate(nextWeek),
        detail: 'Due in 7 days',
      },
      {
        label: `Next month (${this.formatDate(nextMonth)})`,
        replacement: this.formatDate(nextMonth),
        detail: 'Due in 1 month',
      },
    ];
  }

  private getProgressiveDateSuggestions(partial: string): Suggestion[] {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Year completion: "2" or "20" or "202" or "2026"
    if (/^\d{1,4}$/.test(partial) && !partial.includes('-')) {
      const suggestions: Suggestion[] = [];
      if (partial.length <= 3) {
        for (let y = currentYear; y <= currentYear + 2; y++) {
          if (String(y).startsWith(partial)) {
            suggestions.push({
              label: `${y}-`,
              replacement: `${y}-`,
              detail: `Year ${y}`,
            });
          }
        }
      } else if (partial.length === 4) {
        suggestions.push({
          label: `${partial}-`,
          replacement: `${partial}-`,
          detail: `Year ${partial}`,
        });
      }
      return suggestions;
    }

    // Month completion: "2026-" or "2026-0"
    const yearMonthMatch = partial.match(/^(\d{4})-(\d{0,2})$/);
    if (yearMonthMatch?.[1]) {
      const year = yearMonthMatch[1];
      const monthPartial = yearMonthMatch[2] || '';
      const suggestions: Suggestion[] = [];

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      for (let m = 1; m <= 12; m++) {
        const monthStr = m.toString().padStart(2, '0');
        if (monthPartial && !monthStr.startsWith(monthPartial)) continue;
        suggestions.push({
          label: `${year}-${monthStr}-`,
          replacement: `${year}-${monthStr}-`,
          detail: monthNames[m - 1],
        });
      }
      return suggestions;
    }

    // Day completion: "2026-05-" or "2026-05-1"
    const fullDateMatch = partial.match(/^(\d{4})-(\d{2})-(\d{0,2})$/);
    if (fullDateMatch?.[1] && fullDateMatch[2]) {
      const year = parseInt(fullDateMatch[1], 10);
      const month = parseInt(fullDateMatch[2], 10);
      const dayPartial = fullDateMatch[3] || '';
      const daysInMonth = new Date(year, month, 0).getDate();
      const suggestions: Suggestion[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = d.toString().padStart(2, '0');
        if (dayPartial && !dayStr.startsWith(dayPartial)) continue;
        const date = new Date(year, month - 1, d);
        const dayOfWeek = date.toLocaleDateString('en-US', {
          weekday: 'short',
        });
        suggestions.push({
          label: `${fullDateMatch[1]}-${fullDateMatch[2]}-${dayStr}`,
          replacement: `${fullDateMatch[1]}-${fullDateMatch[2]}-${dayStr}`,
          detail: dayOfWeek,
        });
      }
      return suggestions;
    }

    return [];
  }

  private getAssigneeSuggestions(partial: string): Suggestion[] {
    const assignees = new Set<string>();
    for (const task of this.plugin.tasks) {
      if (task.assignee) assignees.add(task.assignee);
    }

    return Array.from(assignees)
      .filter(
        (a) => !partial || a.toLowerCase().startsWith(partial.toLowerCase()),
      )
      .sort()
      .map((a) => ({
        label: a,
        replacement: a,
        detail: 'Assignee',
      }));
  }

  private getTagSuggestions(partial: string): Suggestion[] {
    const tagCounts = new Map<string, number>();
    for (const task of this.plugin.tasks) {
      for (const tag of task.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .filter(
        ([tag]) =>
          !partial || tag.toLowerCase().startsWith(partial.toLowerCase()),
      )
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({
        label: tag,
        replacement: tag,
        detail: `Used ${count}x`,
      }));
  }

  private getPrioritySuggestions(): Suggestion[] {
    return [
      { label: '!!!', replacement: '!!!', detail: 'Urgent' },
      { label: '!!', replacement: '!!', detail: 'High' },
      { label: '!', replacement: '!', detail: 'Normal' },
    ];
  }
}
