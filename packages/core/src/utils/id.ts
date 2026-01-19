import { createHash } from 'crypto';

/**
 * Generate a stable, unique ID for a task
 *
 * The ID is based on a hash of the file path, line number, and task text.
 * This ensures:
 *   - Same task = same ID (stable across scans)
 *   - Task moves or changes = new ID
 *   - Different tasks = different IDs (even if text similar)
 *
 * @param file - Relative file path
 * @param line - Line number in file
 * @param text - Clean task text (without metadata)
 * @returns 8-character hex ID
 *
 * @example
 * generateTaskId('notes.md', 42, 'Review PR')
 * // => 'a3f2d8b1'
 */
export function generateTaskId(
  file: string,
  line: number,
  text: string,
): string {
  const content = `${file}:${line}:${text}`;
  return createHash('md5').update(content).digest('hex').substring(0, 8);
}
