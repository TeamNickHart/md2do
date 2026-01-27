import type { WarningConfig } from './schema.js';

/**
 * Strict preset: All warnings enabled
 *
 * Use when you want maximum validation of task metadata.
 * Enforces complete task information including due dates and completion dates.
 *
 * @example
 * ```json
 * {
 *   "warnings": "strict"
 * }
 * ```
 */
export const PRESET_STRICT: WarningConfig = {
  enabled: true,
  rules: {
    // Format validation - errors
    'unsupported-bullet': 'error',
    'malformed-checkbox': 'error',
    'missing-space-after': 'error',
    'missing-space-before': 'error',

    // Context validation - errors
    'relative-date-no-context': 'error',

    // Metadata completeness - warnings (not errors, still optional)
    'missing-due-date': 'warn',
    'missing-completed-date': 'warn',

    // Critical issues - errors
    'duplicate-todoist-id': 'error',
    'file-read-error': 'error',
  },
};

/**
 * Recommended preset: Format validation only (DEFAULT)
 *
 * Validates markdown syntax is correct, but doesn't enforce
 * metadata completeness. Metadata is treated as optional/stylistic.
 *
 * This is the default configuration used when no config is specified.
 *
 * @example
 * ```json
 * {
 *   "warnings": "recommended"
 * }
 * ```
 */
export const PRESET_RECOMMENDED: WarningConfig = {
  enabled: true,
  rules: {
    // Format warnings - help users write correct markdown
    'unsupported-bullet': 'warn',
    'malformed-checkbox': 'warn',
    'missing-space-after': 'warn',
    'missing-space-before': 'warn',
    'relative-date-no-context': 'warn',

    // Metadata completeness - off (stylistic choice)
    'missing-due-date': 'off',
    'missing-completed-date': 'off',

    // Critical errors - always shown
    'duplicate-todoist-id': 'error',
    'file-read-error': 'error',
  },
};

/**
 * Get a preset configuration by name
 *
 * @param name - Preset name ('strict' | 'recommended')
 * @returns Warning configuration for the preset
 */
export function getPreset(name: 'strict' | 'recommended'): WarningConfig {
  switch (name) {
    case 'strict':
      return PRESET_STRICT;
    case 'recommended':
      return PRESET_RECOMMENDED;
    default:
      return PRESET_RECOMMENDED;
  }
}
