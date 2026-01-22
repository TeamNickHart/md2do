#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  createListCommand,
  createStatsCommand,
  createTodoistCommand,
} from './commands/index.js';

// Read version from package.json
// __dirname will be available in the compiled CJS output
const getVersion = (): string => {
  try {
    const packagePath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
      version: string;
    };
    return packageJson.version;
  } catch {
    return '0.0.0';
  }
};

const program = new Command();

program
  .name('md2do')
  .description('Scan and manage TODOs in markdown files')
  .version(getVersion());

// Add commands
program.addCommand(createListCommand());
program.addCommand(createStatsCommand());
program.addCommand(createTodoistCommand());

// Show help if no command specified
if (process.argv.length === 2) {
  program.help();
}

program.parse();
