#!/usr/bin/env node
import { Command } from 'commander';
import { createListCommand, createStatsCommand } from './commands/index.js';

const program = new Command();

program
  .name('md2do')
  .description('Scan and manage TODOs in markdown files')
  .version('0.1.0');

// Add commands
program.addCommand(createListCommand());
program.addCommand(createStatsCommand());

// Show help if no command specified
if (process.argv.length === 2) {
  program.help();
}

program.parse();
