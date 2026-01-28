import type { Warning } from '../types/index.js';

export interface WarningFilterConfig {
  enabled?: boolean | undefined;
  rules?: Record<string, 'error' | 'warn' | 'info' | 'off'> | undefined;
}

/**
 * Filter warnings based on configuration rules
 *
 * This function applies warning configuration rules to filter out disabled warnings
 * and optionally all warnings if globally disabled.
 *
 * @param warnings - Array of warnings to filter
 * @param config - Warning configuration with enabled flag and rule overrides
 * @returns Filtered array of warnings
 *
 * @example
 * ```typescript
 * const config = {
 *   enabled: true,
 *   rules: {
 *     'missing-due-date': 'off',
 *     'duplicate-todoist-id': 'error',
 *   },
 * };
 *
 * const filtered = filterWarnings(allWarnings, config);
 * // Returns warnings except those with ruleId 'missing-due-date'
 * ```
 */
export function filterWarnings(
  warnings: Warning[],
  config: WarningFilterConfig = {},
): Warning[] {
  // If warnings are globally disabled, return empty array
  if (config.enabled === false) {
    return [];
  }

  // If no rules specified, return all warnings
  if (!config.rules) {
    return warnings;
  }

  // Filter based on rule configuration
  return warnings.filter((warning) => {
    const level = config.rules?.[warning.ruleId];

    // If rule is not configured, include the warning (default: show)
    if (level === undefined) {
      return true;
    }

    // Exclude if rule is set to 'off'
    return level !== 'off';
  });
}

/**
 * Group warnings by severity
 *
 * Useful for displaying warnings in order of importance or
 * treating errors differently from warnings.
 *
 * @param warnings - Array of warnings to group
 * @returns Object with warnings grouped by severity level
 *
 * @example
 * ```typescript
 * const grouped = groupWarningsBySeverity(warnings);
 * console.log(`${grouped.error.length} errors`);
 * console.log(`${grouped.warning.length} warnings`);
 * console.log(`${grouped.info.length} info messages`);
 * ```
 */
export function groupWarningsBySeverity(warnings: Warning[]): {
  error: Warning[];
  warning: Warning[];
  info: Warning[];
} {
  return warnings.reduce(
    (acc, warning) => {
      acc[warning.severity].push(warning);
      return acc;
    },
    { error: [], warning: [], info: [] } as {
      error: Warning[];
      warning: Warning[];
      info: Warning[];
    },
  );
}
