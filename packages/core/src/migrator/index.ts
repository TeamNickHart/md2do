export interface MigrationResult {
  content: string;
  changes: MigrationChange[];
  warnings: MigrationWarning[];
}

export interface MigrationChange {
  line: number;
  original: string;
  migrated: string;
  rule: string;
}

export interface MigrationWarning {
  line: number;
  text: string;
  message: string;
}

/**
 * Migrate content from legacy bracket syntax to new tag/brace syntax.
 *
 * Rules:
 *   [due: YYYY-MM-DD]      → #due:YYYY-MM-DD
 *   [due: YYYY-MM-DD H:MM] → #due:YYYY-MM-DD (time dropped with warning)
 *   [due: M/D/YY]          → #due:YYYY-MM-DD (converted to ISO)
 *   [due: M/D]             → dropped with warning (no year)
 *   [due: tomorrow]        → dropped with warning
 *   [completed: YYYY-MM-DD] → {completed:YYYY-MM-DD}
 *   [todoist: NNN]          → {todoist:NNN}
 */
export function migrateContent(content: string): MigrationResult {
  const lines = content.split('\n');
  const changes: MigrationChange[] = [];
  const warnings: MigrationWarning[] = [];

  const migrated = lines.map((line, index) => {
    const lineNum = index + 1;
    let result = line;

    // Migrate [due: YYYY-MM-DD] or [due: YYYY-MM-DD H:MM] → #due:YYYY-MM-DD
    result = result.replace(
      /\[due:\s*(\d{4}-\d{2}-\d{2})(?:\s+\d{1,2}:\d{2})?\s*\]/gi,
      (match: string, dateStr: string) => {
        const hasTime = /\d{1,2}:\d{2}/.test(
          match.slice(match.indexOf(dateStr) + dateStr.length),
        );
        if (hasTime) {
          warnings.push({
            line: lineNum,
            text: match,
            message: `Time component dropped during migration: ${match}`,
          });
        }
        return `#due:${dateStr}`;
      },
    );

    // Migrate [due: M/D/YY] or [due: M/D/YYYY] → #due:YYYY-MM-DD
    result = result.replace(
      /\[due:\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*\]/gi,
      (_match, m, d, y) => {
        const month = String(m).padStart(2, '0');
        const day = String(d).padStart(2, '0');
        let year = String(y);
        if (year.length === 2) {
          year = `20${year}`;
        }
        return `#due:${year}-${month}-${day}`;
      },
    );

    // Drop [due: M/D] (no year) with warning
    result = result.replace(/\[due:\s*(\d{1,2}\/\d{1,2})\s*\]/gi, (match) => {
      warnings.push({
        line: lineNum,
        text: match,
        message: `Short date without year cannot be migrated: ${match}`,
      });
      return '';
    });

    // Drop [due: relative] with warning
    result = result.replace(
      /\[due:\s*(tomorrow|today|next\s+week|next\s+month)\s*\]/gi,
      (match) => {
        warnings.push({
          line: lineNum,
          text: match,
          message: `Relative date dropped during migration: ${match}`,
        });
        return '';
      },
    );

    // Migrate [completed: YYYY-MM-DD] → {completed:YYYY-MM-DD}
    result = result.replace(
      /\[completed:\s*(\d{4}-\d{2}-\d{2})\s*\]/gi,
      (_match, dateStr) => `{completed:${dateStr}}`,
    );

    // Migrate [todoist: NNN] → {todoist:NNN}
    result = result.replace(
      /\[todoist:\s*(\d+)\s*\]/gi,
      (_match, id) => `{todoist:${id}}`,
    );

    // Clean up double spaces left by removals
    result = result.replace(/  +/g, ' ').trimEnd();

    if (result !== line) {
      changes.push({
        line: lineNum,
        original: line,
        migrated: result,
        rule: 'syntax-migration',
      });
    }

    return result;
  });

  return {
    content: migrated.join('\n'),
    changes,
    warnings,
  };
}
