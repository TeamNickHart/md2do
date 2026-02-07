import { Command } from 'commander';
import { filterWarnings, applyFixes, isFixable } from '@md2do/core';
import { loadConfig, DEFAULT_CONFIG } from '@md2do/config';
import { scanMarkdownFiles } from '../scanner.js';
import chalk from 'chalk';

interface LintCommandOptions {
  path?: string;
  pattern?: string;
  exclude?: string[];
  fix?: boolean;
  dryRun?: boolean;
  format?: string;
  severity?: string;
  rule?: string;
  colors?: boolean;
}

export function createLintCommand(): Command {
  const command = new Command('lint');

  command
    .description('Lint markdown files for task format issues')
    .option('-p, --path <path>', 'Path to scan (defaults to current directory)')
    .option('--pattern <pattern>', 'Glob pattern for markdown files', '**/*.md')
    .option('--exclude <patterns...>', 'Patterns to exclude from scanning')
    .option('--fix', 'Auto-fix formatting issues')
    .option('--dry-run', 'Show what would be fixed without making changes')
    .option('-f, --format <type>', 'Output format (pretty|json)', 'pretty')
    .option('--severity <level>', 'Filter by severity (error|warning|info)')
    .option('--rule <ruleId>', 'Show only specific rule')
    .option('--no-colors', 'Disable colors in output')

    .action(async (options: LintCommandOptions) => {
      try {
        const colors = options.colors ?? true;

        // Load config
        const config = await loadConfig({
          cwd: options.path || process.cwd(),
        });

        // Scan markdown files
        if (colors) {
          console.log(chalk.blue('📋 Linting markdown files...\n'));
        } else {
          console.log('Linting markdown files...\n');
        }

        const scanResult = await scanMarkdownFiles({
          root: options.path || process.cwd(),
          ...(options.pattern !== undefined && { pattern: options.pattern }),
          ...(options.exclude !== undefined && { exclude: options.exclude }),
          ...(config.workday?.startTime && {
            workdayStartTime: config.workday.startTime,
          }),
          ...(config.workday?.endTime && {
            workdayEndTime: config.workday.endTime,
          }),
          ...(config.workday?.defaultDueTime && {
            defaultDueTime: config.workday.defaultDueTime,
          }),
        });

        // Apply warning filters from config
        const warningConfig = config.warnings ?? DEFAULT_CONFIG.warnings;
        let warnings = filterWarnings(scanResult.warnings, warningConfig ?? {});

        // Apply severity filter
        if (options.severity) {
          warnings = warnings.filter((w) => w.severity === options.severity);
        }

        // Apply rule filter
        if (options.rule) {
          warnings = warnings.filter((w) => w.ruleId === options.rule);
        }

        // Handle fix mode
        if (options.fix || options.dryRun) {
          const fixableCount = warnings.filter(isFixable).length;
          const nonFixableCount = warnings.length - fixableCount;

          if (fixableCount === 0) {
            if (colors) {
              console.log(
                chalk.yellow(
                  '⚠️  No auto-fixable issues found. All issues require manual review.\n',
                ),
              );
            } else {
              console.log(
                'No auto-fixable issues found. All issues require manual review.\n',
              );
            }

            // Show non-fixable warnings
            if (nonFixableCount > 0) {
              showWarnings(warnings, colors);
              process.exit(1);
            }
            process.exit(0);
          }

          // Apply fixes
          if (options.dryRun && colors) {
            console.log(
              chalk.cyan('🔍 Dry run - showing what would be fixed...\n'),
            );
          } else if (options.fix && colors) {
            console.log(chalk.cyan('🔧 Auto-fixing formatting issues...\n'));
          }

          const fixResult = await applyFixes(warnings, {
            dryRun: options.dryRun ?? false,
          });

          if (!fixResult.success) {
            if (colors) {
              console.error(
                chalk.red(`❌ Error applying fixes: ${fixResult.error}\n`),
              );
            } else {
              console.error(`Error applying fixes: ${fixResult.error}\n`);
            }
            process.exit(2);
          }

          // Show fix results
          if (fixResult.fixes.length > 0) {
            showFixResults(fixResult, options.dryRun ?? false, colors);
          }

          // Show remaining non-fixable warnings
          const remainingWarnings = warnings.filter((w) => !isFixable(w));
          if (remainingWarnings.length > 0) {
            if (colors) {
              console.log(
                chalk.yellow(
                  `\nRemaining issues (${remainingWarnings.length}) require manual review:\n`,
                ),
              );
            } else {
              console.log(
                `\nRemaining issues (${remainingWarnings.length}) require manual review:\n`,
              );
            }
            showWarnings(remainingWarnings, colors);
            process.exit(1);
          }

          // All clean!
          if (colors) {
            console.log(chalk.green('\n✅ All issues fixed!\n'));
          } else {
            console.log('\nAll issues fixed!\n');
          }
          process.exit(0);
        }

        // Normal lint mode (no fix)
        if (warnings.length === 0) {
          if (colors) {
            console.log(chalk.green('✅ No issues found!\n'));
          } else {
            console.log('No issues found!\n');
          }
          process.exit(0);
        }

        // Show warnings
        const fixableCount = warnings.filter(isFixable).length;

        if (colors) {
          console.log(
            chalk.yellow(
              `Found ${warnings.length} issue${warnings.length > 1 ? 's' : ''} in ${scanResult.metadata.filesScanned} file${scanResult.metadata.filesScanned > 1 ? 's' : ''}:\n`,
            ),
          );
        } else {
          console.log(
            `Found ${warnings.length} issue${warnings.length > 1 ? 's' : ''} in ${scanResult.metadata.filesScanned} file${scanResult.metadata.filesScanned > 1 ? 's' : ''}:\n`,
          );
        }

        // Show summary
        const errorCount = warnings.filter(
          (w) => w.severity === 'error',
        ).length;
        const warningCount = warnings.filter(
          (w) => w.severity === 'warning',
        ).length;
        const infoCount = warnings.filter((w) => w.severity === 'info').length;

        if (errorCount > 0) {
          if (colors) {
            console.log(chalk.red(`  ❌ ${errorCount} error(s)`));
          } else {
            console.log(`  ${errorCount} error(s)`);
          }
        }
        if (warningCount > 0) {
          if (colors) {
            console.log(chalk.yellow(`  ⚠  ${warningCount} warning(s)`));
          } else {
            console.log(`  ${warningCount} warning(s)`);
          }
        }
        if (infoCount > 0) {
          if (colors) {
            console.log(chalk.blue(`  ℹ  ${infoCount} info`));
          } else {
            console.log(`  ${infoCount} info`);
          }
        }

        console.log('');

        // Show warnings
        showWarnings(warnings, colors);

        // Show fix hint
        if (fixableCount > 0) {
          if (colors) {
            console.log(
              chalk.green(
                `\n✨ ${fixableCount} issue${fixableCount > 1 ? 's' : ''} can be auto-fixed with --fix\n`,
              ),
            );
          } else {
            console.log(
              `\n${fixableCount} issue${fixableCount > 1 ? 's' : ''} can be auto-fixed with --fix\n`,
            );
          }
        }

        process.exit(1);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(2);
      }
    });

  return command;
}

/**
 * Show warnings grouped by file
 */
function showWarnings(warnings: Warning[], colors: boolean): void {
  // Group by file
  const byFile = new Map<string, Warning[]>();
  for (const warning of warnings) {
    const fileWarnings = byFile.get(warning.file) ?? [];
    fileWarnings.push(warning);
    byFile.set(warning.file, fileWarnings);
  }

  // Show each file
  for (const [file, fileWarnings] of byFile.entries()) {
    if (colors) {
      console.log(
        chalk.cyan(
          `📁 ${file} (${fileWarnings.length} issue${fileWarnings.length > 1 ? 's' : ''})`,
        ),
      );
    } else {
      console.log(
        `${file} (${fileWarnings.length} issue${fileWarnings.length > 1 ? 's' : ''})`,
      );
    }

    // Sort by line number
    const sorted = [...fileWarnings].sort((a, b) => a.line - b.line);

    for (const warning of sorted) {
      const icon = getSeverityIcon(warning.severity, colors);
      const ruleId = colors
        ? chalk.gray(`[${warning.ruleId}]`)
        : `[${warning.ruleId}]`;

      console.log(
        `  Line ${warning.line}: ${icon} ${ruleId} ${warning.message}`,
      );

      // Show the problematic line if available
      if (warning.text) {
        if (colors) {
          console.log(chalk.gray(`           ${warning.text}`));
        } else {
          console.log(`           ${warning.text}`);
        }
      }

      // Show helpful hint for non-fixable issues
      const hint = getHelpHint(warning.ruleId);
      if (hint) {
        if (colors) {
          console.log(chalk.dim(`           💡 ${hint}`));
        } else {
          console.log(`           Tip: ${hint}`);
        }
      }
    }

    console.log('');
  }
}

/**
 * Show fix results
 */
function showFixResults(
  result: import('@md2do/core').FixResult,
  dryRun: boolean,
  colors: boolean,
): void {
  // Group fixes by file
  const byFile = new Map<string, import('@md2do/core').Fix[]>();
  for (const fix of result.fixes) {
    const fileFixes = byFile.get(fix.file) ?? [];
    fileFixes.push(fix);
    byFile.set(fix.file, fileFixes);
  }

  // Show each file
  for (const [file, fixes] of byFile.entries()) {
    const prefix = dryRun ? 'Would fix in' : '✓';
    if (colors) {
      console.log(chalk.green(`${prefix} ${file}`));
    } else {
      console.log(`${prefix} ${file}`);
    }

    for (const fix of fixes) {
      const ruleId = colors ? chalk.gray(`[${fix.ruleId}]`) : `[${fix.ruleId}]`;
      console.log(`  Line ${fix.line}: ${ruleId} ${fix.message}`);

      if (dryRun) {
        if (colors) {
          console.log(chalk.red(`    Before: ${fix.originalLine.trim()}`));
          console.log(chalk.green(`    After:  ${fix.fixedLine.trim()}`));
        } else {
          console.log(`    Before: ${fix.originalLine.trim()}`);
          console.log(`    After:  ${fix.fixedLine.trim()}`);
        }
      }
    }

    console.log('');
  }

  // Summary
  const verb = dryRun ? 'Would fix' : 'Fixed';
  if (colors) {
    console.log(
      chalk.green(
        `${verb} ${result.fixes.length} issue${result.fixes.length > 1 ? 's' : ''} in ${result.filesModified} file${result.filesModified > 1 ? 's' : ''}`,
      ),
    );
  } else {
    console.log(
      `${verb} ${result.fixes.length} issue${result.fixes.length > 1 ? 's' : ''} in ${result.filesModified} file${result.filesModified > 1 ? 's' : ''}`,
    );
  }
}

/**
 * Get severity icon
 */
function getSeverityIcon(
  severity: 'error' | 'warning' | 'info',
  colors: boolean,
): string {
  if (!colors) {
    return severity === 'error' ? 'X' : severity === 'warning' ? '!' : 'i';
  }

  switch (severity) {
    case 'error':
      return chalk.red('❌');
    case 'warning':
      return chalk.yellow('⚠');
    case 'info':
      return chalk.blue('ℹ');
  }
}

/**
 * Get helpful hint for non-fixable issues
 */
function getHelpHint(ruleId: string): string | undefined {
  switch (ruleId) {
    case 'relative-date-no-context':
      return 'Add a heading with a date above this task';
    case 'missing-due-date':
      return 'Add [due: YYYY-MM-DD] or place under dated heading';
    case 'missing-completed-date':
      return 'Add [completed: YYYY-MM-DD] after completing the task';
    case 'duplicate-todoist-id':
      return 'Remove duplicate Todoist ID or update one of the tasks';
    default:
      return undefined;
  }
}

type Warning = import('@md2do/core').Warning;
