import { Command } from 'commander';
import { migrateContent } from '@md2do/core';
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import fg from 'fast-glob';

interface MigrateCommandOptions {
  path?: string;
  pattern?: string;
  dryRun?: boolean;
}

export function createMigrateCommand(): Command {
  const command = new Command('migrate');

  command
    .description(
      'Migrate markdown files from legacy bracket syntax to new tag/brace syntax',
    )
    .option('-p, --path <path>', 'Path to scan (defaults to current directory)')
    .option('--pattern <pattern>', 'Glob pattern for markdown files', '**/*.md')
    .option(
      '--dry-run',
      'Show what would change without modifying files',
      false,
    )
    .action(async (options: MigrateCommandOptions) => {
      try {
        const root = options.path || process.cwd();
        const pattern = options.pattern || '**/*.md';

        const files = await fg(pattern, {
          cwd: root,
          ignore: ['**/node_modules/**', '**/.git/**'],
        });

        if (files.length === 0) {
          console.log('No markdown files found.');
          return;
        }

        let totalChanges = 0;
        let totalWarnings = 0;
        let filesChanged = 0;

        for (const file of files) {
          const filePath = path.join(root, file);
          const content = readFileSync(filePath, 'utf-8');
          const result = migrateContent(content);

          if (result.changes.length === 0 && result.warnings.length === 0) {
            continue;
          }

          if (result.changes.length > 0) {
            filesChanged++;
            totalChanges += result.changes.length;

            if (options.dryRun) {
              console.log(`\n${file}:`);
              for (const change of result.changes) {
                console.log(`  L${change.line}:`);
                console.log(`    - ${change.original}`);
                console.log(`    + ${change.migrated}`);
              }
            } else {
              writeFileSync(filePath, result.content, 'utf-8');
              console.log(`  ${file}: ${result.changes.length} change(s)`);
            }
          }

          if (result.warnings.length > 0) {
            totalWarnings += result.warnings.length;
            for (const warning of result.warnings) {
              console.error(
                `  warning: ${file}:${warning.line} - ${warning.message}`,
              );
            }
          }
        }

        console.log(
          `\n${options.dryRun ? '[DRY RUN] ' : ''}${filesChanged} file(s) ${options.dryRun ? 'would be ' : ''}modified, ${totalChanges} change(s), ${totalWarnings} warning(s)`,
        );
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}
