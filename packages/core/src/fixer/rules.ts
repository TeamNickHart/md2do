/**
 * Fix rules for auto-fixable warnings
 *
 * Each function takes a line of text and returns the fixed version.
 * These only handle formatting issues - not semantic problems.
 */

/**
 * Fix unsupported bullet markers (* or +) by replacing with dash (-)
 *
 * @param line - The line to fix
 * @returns Fixed line with dash bullet marker
 *
 * @example
 * fixUnsupportedBullet("* [ ] Task") // => "- [ ] Task"
 * fixUnsupportedBullet("+ [x] Done") // => "- [x] Done"
 */
export function fixUnsupportedBullet(line: string): string {
  return line.replace(/^(\s*)[*+](\s+\[[xX ]\])/, '$1-$2');
}

/**
 * Fix malformed checkboxes with extra spaces
 *
 * @param line - The line to fix
 * @returns Fixed line with properly formatted checkbox
 *
 * @example
 * fixMalformedCheckbox("- [x ] Task") // => "- [x] Task"
 * fixMalformedCheckbox("- [ x] Task") // => "- [x] Task"
 */
export function fixMalformedCheckbox(line: string): string {
  // Fix [x ] -> [x]
  let fixed = line.replace(/\[([xX])\s+\]/, '[$1]');
  // Fix [ x] -> [x]
  fixed = fixed.replace(/\[\s+([xX])\]/, '[$1]');
  // Fix [ ] with extra spaces -> [ ]
  fixed = fixed.replace(/\[\s{2,}\]/, '[ ]');
  return fixed;
}

/**
 * Fix missing space after checkbox
 *
 * @param line - The line to fix
 * @returns Fixed line with space after checkbox
 *
 * @example
 * fixMissingSpaceAfter("- [x]Task") // => "- [x] Task"
 * fixMissingSpaceAfter("- [ ]Review") // => "- [ ] Review"
 */
export function fixMissingSpaceAfter(line: string): string {
  return line.replace(/^(\s*-\s+\[[xX ]\])([^\s])/, '$1 $2');
}

/**
 * Fix missing space before checkbox
 *
 * @param line - The line to fix
 * @returns Fixed line with space before checkbox
 *
 * @example
 * fixMissingSpaceBefore("-[x] Task") // => "- [x] Task"
 * fixMissingSpaceBefore("-[ ] Task") // => "- [ ] Task"
 */
export function fixMissingSpaceBefore(line: string): string {
  return line.replace(/^(\s*)-(\[[xX ]\])/, '$1- $2');
}
