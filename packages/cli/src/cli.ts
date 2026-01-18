#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('md2do')
  .description('Scan and manage TODOs in markdown files')
  .version('0.1.0');

// Placeholder list command
program
  .command('list')
  .description('List tasks with optional filters')
  .action(() => {
    console.log('md2do list command (placeholder)');
  });

// Placeholder stats command
program
  .command('stats')
  .description('Show task statistics')
  .action(() => {
    console.log('md2do stats command (placeholder)');
  });

program.parse();
