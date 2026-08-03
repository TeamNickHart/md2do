import { Command } from 'commander';
import { parseJsonl, ingestRecords } from '@md2do/core';
import fs from 'fs/promises';
import path from 'path';

interface IngestOptions {
  output?: string;
  vault?: string;
  dryRun?: boolean;
}

/**
 * Create the 'ingest' command
 */
export function createIngestCommand(): Command {
  const command = new Command('ingest');

  command
    .description('Ingest tasks from a JSONL file into a markdown vault file')
    .argument('<file>', 'Path to JSONL file (one task record per line)')
    .option(
      '-o, --output <path>',
      'Output file path (overrides --vault derivation)',
    )
    .option(
      '--vault <root>',
      'Vault root directory (default: current directory)',
    )
    .option('--dry-run', 'Print generated markdown without writing')
    .action(async (file: string, options: IngestOptions) => {
      try {
        await ingestAction(file, options);
      } catch (error) {
        console.error(
          'Error:',
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    });

  return command;
}

async function ingestAction(
  file: string,
  options: IngestOptions,
): Promise<void> {
  // Read JSONL file
  let content: string;
  try {
    content = await fs.readFile(file, 'utf-8');
  } catch (error) {
    console.error(`❌ Error: Could not read file: ${file}`);
    console.error(
      `   ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }

  // Parse records
  const records = parseJsonl(content);

  if (records.length === 0) {
    console.log('No records found in JSONL file.');
    return;
  }

  // Warn if mixed sources
  const sources = new Set(records.map((r) => r.source));
  if (sources.size > 1) {
    console.warn(
      `⚠️  Warning: Mixed sources detected: ${[...sources].join(', ')}. Using first source "${records[0]!.source}" for output path derivation.`,
    );
  }

  // Generate markdown
  const today = new Date().toISOString().slice(0, 10);
  const markdown = ingestRecords(records, undefined, today);

  if (options.dryRun) {
    console.log(markdown);
    return;
  }

  // Derive output path
  let outputPath: string;
  if (options.output) {
    outputPath = path.resolve(options.output);
  } else {
    const vaultRoot = options.vault
      ? path.resolve(options.vault)
      : process.cwd();
    const sourceSlug = records[0]!.source;
    const basename = path.basename(file, path.extname(file)) + '.md';
    outputPath = path.join(vaultRoot, sourceSlug, basename);
  }

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Atomic write: write to temp file then rename
  const tmpPath = `${outputPath}.tmp.${process.pid}`;
  try {
    await fs.writeFile(tmpPath, markdown, 'utf-8');
    await fs.rename(tmpPath, outputPath);
  } catch (error) {
    // Clean up temp file on failure
    await fs.unlink(tmpPath).catch(() => undefined);
    throw error;
  }

  console.log(`✅ Wrote ${records.length} tasks to ${outputPath}`);
}
