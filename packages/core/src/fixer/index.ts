import * as fs from 'fs/promises';
import type { Warning, Fix, FixResult, WarningCode } from '../types/index.js';
import {
  fixUnsupportedBullet,
  fixMalformedCheckbox,
  fixMissingSpaceAfter,
  fixMissingSpaceBefore,
} from './rules.js';

/**
 * Map of warning codes to their fix functions
 */
const FIX_FUNCTIONS: Partial<Record<WarningCode, (line: string) => string>> = {
  'unsupported-bullet': fixUnsupportedBullet,
  'malformed-checkbox': fixMalformedCheckbox,
  'missing-space-after': fixMissingSpaceAfter,
  'missing-space-before': fixMissingSpaceBefore,
  // Note: Other warning types are not auto-fixable
  // 'relative-date-no-context' - requires human input
  // 'missing-due-date' - requires human input
  // 'missing-completed-date' - requires human input
  // 'duplicate-todoist-id' - requires manual resolution
  // 'file-read-error' - file system issue
};

/**
 * Check if a warning can be automatically fixed
 */
export function isFixable(warning: Warning): boolean {
  return warning.ruleId in FIX_FUNCTIONS;
}

/**
 * Get all unique warning codes that can be auto-fixed
 */
export function getFixableRules(): WarningCode[] {
  return Object.keys(FIX_FUNCTIONS) as WarningCode[];
}

/**
 * Apply fixes to warnings
 *
 * @param warnings - Warnings to fix
 * @param options - Fix options
 * @returns Result with applied fixes and modified file count
 *
 * @example
 * const result = await applyFixes(warnings, { dryRun: false });
 * console.log(`Fixed ${result.fixes.length} issues in ${result.filesModified} files`);
 */
export async function applyFixes(
  warnings: Warning[],
  options: {
    dryRun?: boolean;
    ruleFilter?: WarningCode[]; // Only fix specific rules
  } = {},
): Promise<FixResult> {
  const { dryRun = false, ruleFilter } = options;

  // Filter to only fixable warnings
  let fixableWarnings = warnings.filter(isFixable);

  // Apply rule filter if specified
  if (ruleFilter && ruleFilter.length > 0) {
    fixableWarnings = fixableWarnings.filter((w) =>
      ruleFilter.includes(w.ruleId),
    );
  }

  if (fixableWarnings.length === 0) {
    return {
      fixes: [],
      success: true,
      filesModified: 0,
    };
  }

  // Group warnings by file
  const warningsByFile = new Map<string, Warning[]>();
  for (const warning of fixableWarnings) {
    const fileWarnings = warningsByFile.get(warning.file) ?? [];
    fileWarnings.push(warning);
    warningsByFile.set(warning.file, fileWarnings);
  }

  const fixes: Fix[] = [];
  const modifiedFiles = new Set<string>();

  try {
    // Process each file
    for (const [file, fileWarnings] of warningsByFile.entries()) {
      // Read file
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      // Sort warnings by line number (descending) to avoid index shifting
      const sortedWarnings = [...fileWarnings].sort((a, b) => b.line - a.line);

      // Apply fixes to each line
      for (const warning of sortedWarnings) {
        const lineIndex = warning.line - 1; // Convert to 0-indexed

        if (lineIndex < 0 || lineIndex >= lines.length) {
          continue; // Skip invalid line numbers
        }

        const originalLine = lines[lineIndex];

        if (originalLine === undefined) {
          continue; // Skip undefined lines
        }

        const fixFn = FIX_FUNCTIONS[warning.ruleId];

        if (!fixFn) {
          continue; // Should not happen since we filtered to fixable
        }

        const fixedLine = fixFn(originalLine);

        // Only record if the line actually changed
        if (fixedLine !== originalLine) {
          fixes.push({
            file,
            line: warning.line,
            ruleId: warning.ruleId,
            originalLine,
            fixedLine,
            message: getFixMessage(warning.ruleId),
          });

          // Update the line in memory
          lines[lineIndex] = fixedLine;
          modifiedFiles.add(file);
        }
      }

      // Write back to file (unless dry run)
      if (!dryRun && modifiedFiles.has(file)) {
        const updatedContent = lines.join('\n');
        await fs.writeFile(file, updatedContent, 'utf-8');
      }
    }

    return {
      fixes,
      success: true,
      filesModified: modifiedFiles.size,
    };
  } catch (error) {
    return {
      fixes,
      success: false,
      filesModified: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a human-readable message for a fix
 */
function getFixMessage(ruleId: WarningCode): string {
  switch (ruleId) {
    case 'unsupported-bullet':
      return 'Changed bullet marker to dash (-)';
    case 'malformed-checkbox':
      return 'Fixed checkbox spacing';
    case 'missing-space-after':
      return 'Added space after checkbox';
    case 'missing-space-before':
      return 'Added space before checkbox';
    default:
      return 'Fixed formatting';
  }
}
