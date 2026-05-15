import { Command } from 'commander';
import { addTask } from '@md2do/core';
import {
  format,
  addDays,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
} from 'date-fns';

interface AddCommandOptions {
  file?: string;
  assignee?: string;
  priority?: string;
  due?: string;
  tag?: string[];
  completed?: boolean;
  line?: number;
}

const PRIORITY_MAP: Record<string, string> = {
  urgent: '!!!',
  high: '!!',
  low: '!',
};

const DAY_RESOLVERS: Record<string, (date: Date) => Date> = {
  monday: nextMonday,
  tuesday: nextTuesday,
  wednesday: nextWednesday,
  thursday: nextThursday,
  friday: nextFriday,
  saturday: nextSaturday,
  sunday: nextSunday,
};

function resolveDate(input: string): string {
  // Pass through YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const now = new Date();
  const lower = input.toLowerCase();

  if (lower === 'today') {
    return format(now, 'yyyy-MM-dd');
  }

  if (lower === 'tomorrow') {
    return format(addDays(now, 1), 'yyyy-MM-dd');
  }

  if (lower === 'next week') {
    return format(nextMonday(now), 'yyyy-MM-dd');
  }

  const resolver = DAY_RESOLVERS[lower];
  if (resolver) {
    return format(resolver(now), 'yyyy-MM-dd');
  }

  throw new Error(
    `Invalid date: "${input}". Use YYYY-MM-DD or: today, tomorrow, monday-sunday, next week`,
  );
}

export function createAddCommand(): Command {
  const command = new Command('add');

  command
    .description('Add a task to a markdown file')
    .argument('<text>', 'Task description')
    .option(
      '-f, --file <path>',
      'Target markdown file (omit to print to stdout)',
    )
    .option('-a, --assignee <name>', 'Assignee (@name)')
    .option('-p, --priority <level>', 'Priority: urgent, high, normal, low')
    .option(
      '-d, --due <date>',
      'Due date: YYYY-MM-DD, today, tomorrow, monday-sunday, next week',
    )
    .option('-t, --tag <tags...>', 'Tags (#tag)')
    .option('--completed', 'Create as completed task')
    .option('--line <n>', 'Insert at specific line number', parseInt)
    .action(async (text: string, options: AddCommandOptions) => {
      try {
        // Build the task text with metadata
        const parts: string[] = [text];

        if (options.assignee) {
          parts.push(`@${options.assignee}`);
        }

        if (options.priority && options.priority !== 'normal') {
          const symbol = PRIORITY_MAP[options.priority];
          if (!symbol && options.priority !== 'normal') {
            console.error(
              `Error: Invalid priority "${options.priority}". Use: urgent, high, normal, low`,
            );
            process.exit(1);
          }
          if (symbol) {
            parts.push(symbol);
          }
        }

        if (options.tag) {
          for (const tag of options.tag) {
            parts.push(`#${tag}`);
          }
        }

        if (options.due) {
          const resolved = resolveDate(options.due);
          parts.push(`#due:${resolved}`);
        }

        const assembledText = parts.join(' ');
        const checkbox = options.completed ? '- [x]' : '- [ ]';

        if (!options.file) {
          if (options.line !== undefined) {
            console.error('Error: --line requires --file');
            process.exit(1);
          }
          console.log(`${checkbox} ${assembledText}`);
          return;
        }

        const addOptions: { completed?: boolean; line?: number } = {};
        if (options.completed) {
          addOptions.completed = options.completed;
        }
        if (options.line !== undefined) {
          addOptions.line = options.line;
        }

        const result = await addTask(options.file, assembledText, addOptions);

        if (result.success) {
          console.log(`${checkbox} ${assembledText}`);
        } else {
          console.error(`Error: ${result.error}`);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });

  return command;
}
