import { Command } from 'commander';
import { loadConfig, validateConfig, type Config } from '@md2do/config';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

interface ConfigInitOptions {
  global?: boolean;
  format?: 'json' | 'yaml' | 'js';
  defaultAssignee?: string;
  workdayStart?: string;
  workdayEnd?: string;
  defaultDueTime?: 'start' | 'end';
  outputFormat?: 'pretty' | 'table' | 'json';
  colors?: boolean;
  warnings?: 'recommended' | 'strict' | 'off';
}

interface ConfigSetOptions {
  global?: boolean;
}

interface ConfigGetOptions {
  global?: boolean;
}

interface ConfigListOptions {
  showOrigin?: boolean;
}

interface ConfigEditOptions {
  global?: boolean;
}

/**
 * Create the config command group
 */
export function createConfigCommand(): Command {
  const command = new Command('config');

  command.description('Manage md2do configuration');

  // Add subcommands
  command.addCommand(createConfigInitCommand());
  command.addCommand(createConfigSetCommand());
  command.addCommand(createConfigGetCommand());
  command.addCommand(createConfigListCommand());
  command.addCommand(createConfigEditCommand());
  command.addCommand(createConfigValidateCommand());

  return command;
}

/**
 * Create the 'config init' subcommand
 */
function createConfigInitCommand(): Command {
  const command = new Command('init');

  command
    .description('Initialize md2do configuration with interactive prompts')
    .option('-g, --global', 'Create global configuration in home directory')
    .option(
      '--format <type>',
      'Config file format (json|yaml|js)',
      'json' as 'json' | 'yaml' | 'js',
    )
    .option('--default-assignee <username>', 'Default assignee username')
    .option('--workday-start <time>', 'Work day start time (HH:MM)')
    .option('--workday-end <time>', 'Work day end time (HH:MM)')
    .option(
      '--default-due-time <when>',
      'Default due time (start|end)',
      'end' as 'start' | 'end',
    )
    .option(
      '--output-format <type>',
      'Output format (pretty|table|json)',
      'pretty' as 'pretty' | 'table' | 'json',
    )
    .option('--no-colors', 'Disable colored output')
    .option(
      '--warnings <level>',
      'Warning level (recommended|strict|off)',
      'recommended' as 'recommended' | 'strict' | 'off',
    )
    .action(async (options: ConfigInitOptions) => {
      try {
        await configInitAction(options);
      } catch (error) {
        if (error instanceof Error && error.message === 'canceled') {
          const p = await import('@clack/prompts');
          p.cancel('Configuration canceled');
          process.exit(0);
        }
        console.error(
          'Error:',
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    });

  return command;
}

/**
 * Action handler for 'config init' command
 */
async function configInitAction(options: ConfigInitOptions): Promise<void> {
  // Dynamic import for ESM-only @clack/prompts
  const p = await import('@clack/prompts');

  p.intro('Welcome to md2do configuration!');

  // Determine if we're in interactive mode
  const hasAnyOption =
    options.defaultAssignee !== undefined ||
    options.workdayStart !== undefined ||
    options.workdayEnd !== undefined ||
    options.defaultDueTime !== undefined ||
    options.outputFormat !== undefined ||
    options.colors !== undefined ||
    options.warnings !== undefined;

  const interactive = !hasAnyOption;

  const config: Partial<Config> = {};

  if (interactive) {
    // Interactive prompts
    const defaultAssignee = await p.text({
      message: 'Your username (for filtering tasks):',
      placeholder: 'Leave empty to skip',
      validate: (value) => {
        if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
          return 'Username should only contain letters, numbers, dashes, and underscores';
        }
      },
    });

    const workdayStart = await p.text({
      message: 'Work day start time (HH:MM):',
      initialValue: '08:00',
      validate: (value) => {
        if (typeof value === 'string' && !/^\d{2}:\d{2}$/.test(value)) {
          return 'Time must be in HH:MM format';
        }
      },
    });

    const workdayEnd = await p.text({
      message: 'Work day end time (HH:MM):',
      initialValue: '17:00',
      validate: (value) => {
        if (typeof value === 'string' && !/^\d{2}:\d{2}$/.test(value)) {
          return 'Time must be in HH:MM format';
        }
      },
    });

    const defaultDueTime = await p.select({
      message: 'Default due time:',
      options: [
        { value: 'end', label: 'End of day' },
        { value: 'start', label: 'Start of day' },
      ],
      initialValue: 'end',
    });

    const outputFormat = await p.select({
      message: 'Output format:',
      options: [
        { value: 'pretty', label: 'Pretty (human-readable)' },
        { value: 'table', label: 'Table (structured)' },
        { value: 'json', label: 'JSON (machine-readable)' },
      ],
      initialValue: 'pretty',
    });

    const colors = await p.confirm({
      message: 'Enable colored output?',
      initialValue: true,
    });

    const warnings = await p.select({
      message: 'Warning level:',
      options: [
        {
          value: 'recommended',
          label: 'Recommended (validates format, metadata optional)',
        },
        {
          value: 'strict',
          label: 'Strict (enforces complete metadata)',
        },
        { value: 'off', label: 'Off (no warnings)' },
      ],
      initialValue: 'recommended',
    });

    // Build config object
    if (defaultAssignee && typeof defaultAssignee === 'string') {
      config.defaultAssignee = defaultAssignee;
    }

    config.workday = {
      startTime: typeof workdayStart === 'string' ? workdayStart : '08:00',
      endTime: typeof workdayEnd === 'string' ? workdayEnd : '17:00',
      defaultDueTime:
        typeof defaultDueTime === 'string'
          ? (defaultDueTime as 'start' | 'end')
          : 'end',
    };

    config.output = {
      format:
        typeof outputFormat === 'string'
          ? (outputFormat as 'pretty' | 'table' | 'json')
          : 'pretty',
      colors: typeof colors === 'boolean' ? colors : true,
      paths: true,
    };

    if (typeof warnings === 'string' && warnings === 'off') {
      config.warnings = { enabled: false };
    } else if (typeof warnings === 'string' && warnings === 'strict') {
      config.warnings = {
        enabled: true,
        rules: {
          'unsupported-bullet': 'warn',
          'malformed-checkbox': 'warn',
          'missing-space-after': 'warn',
          'missing-space-before': 'warn',
          'relative-date-no-context': 'warn',
          'missing-due-date': 'warn',
          'missing-completed-date': 'warn',
          'duplicate-source-id': 'error',
          'file-read-error': 'error',
        },
      };
    }
    // recommended is the default, no need to set explicitly
  } else {
    // Non-interactive mode: use CLI options
    if (options.defaultAssignee) {
      config.defaultAssignee = options.defaultAssignee;
    }

    config.workday = {
      startTime: options.workdayStart || '08:00',
      endTime: options.workdayEnd || '17:00',
      defaultDueTime: options.defaultDueTime || 'end',
    };

    config.output = {
      format: options.outputFormat || 'pretty',
      colors: options.colors ?? true,
      paths: true,
    };

    if (options.warnings === 'off') {
      config.warnings = { enabled: false };
    } else if (options.warnings === 'strict') {
      config.warnings = {
        enabled: true,
        rules: {
          'unsupported-bullet': 'warn',
          'malformed-checkbox': 'warn',
          'missing-space-after': 'warn',
          'missing-space-before': 'warn',
          'relative-date-no-context': 'warn',
          'missing-due-date': 'warn',
          'missing-completed-date': 'warn',
          'duplicate-source-id': 'error',
          'file-read-error': 'error',
        },
      };
    }
  }

  // Validate config
  try {
    validateConfig(config);
  } catch (error) {
    p.cancel(
      `Invalid configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }

  // Determine config file path
  const format = options.format || 'json';
  const configPath = getConfigPath(options.global || false, format);

  // Check if config already exists
  if (existsSync(configPath)) {
    if (interactive) {
      const overwrite = await p.confirm({
        message: `Configuration file already exists at ${configPath}. Overwrite?`,
        initialValue: false,
      });

      if (!overwrite) {
        p.cancel('Configuration canceled');
        process.exit(0);
      }
    }
  }

  // Write config file
  writeConfigFile(configPath, config, format);

  p.outro(`✓ Configuration saved to ${configPath}`);
}

/**
 * Create the 'config set' subcommand
 */
function createConfigSetCommand(): Command {
  const command = new Command('set');

  command
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key (e.g., workday.startTime)')
    .argument('<value>', 'Configuration value')
    .option('-g, --global', 'Set in global configuration')
    .action((key: string, value: string, options: ConfigSetOptions) => {
      try {
        configSetAction(key, value, options);
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

/**
 * Action handler for 'config set' command
 */
function configSetAction(
  key: string,
  value: string,
  options: ConfigSetOptions,
): void {
  const isGlobal = options.global || false;
  const configPath = findExistingConfigPath(isGlobal);

  let config: Partial<Config> = {};
  let format: 'json' | 'yaml' | 'js' = 'json';

  // Load existing config if exists
  if (configPath) {
    format = getConfigFormat(configPath);
    const content = readFileSync(configPath, 'utf-8');
    config = parseConfigFile(content, format);
  } else {
    // Create new config with default format
    format = 'json';
  }

  // Parse and set value
  const parsedValue = parseValue(value);
  setNestedValue(config, key, parsedValue);

  // Validate
  try {
    validateConfig(config);
  } catch (error) {
    console.error(
      `Invalid configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }

  // Write back
  const finalPath = configPath || getConfigPath(isGlobal, format);
  writeConfigFile(finalPath, config, format);

  console.log(`✓ Set ${key} = ${value} in ${finalPath}`);
}

/**
 * Create the 'config get' subcommand
 */
function createConfigGetCommand(): Command {
  const command = new Command('get');

  command
    .description('Get a configuration value')
    .argument('<key>', 'Configuration key (e.g., workday.startTime)')
    .option('-g, --global', 'Get from global configuration only')
    .action(async (key: string, options: ConfigGetOptions) => {
      try {
        await configGetAction(key, options);
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

/**
 * Action handler for 'config get' command
 */
async function configGetAction(
  key: string,
  options: ConfigGetOptions,
): Promise<void> {
  const config = options.global
    ? await loadConfig({ loadGlobal: true, loadEnv: false, cwd: homedir() })
    : await loadConfig();

  const value = getNestedValue(config, key);

  if (value === undefined) {
    console.log('(not set)');
  } else if (typeof value === 'object') {
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log(value);
  }
}

/**
 * Create the 'config list' subcommand
 */
function createConfigListCommand(): Command {
  const command = new Command('list');

  command
    .description('Show all configuration values')
    .option('--show-origin', 'Show where each value comes from')
    .action(async (options: ConfigListOptions) => {
      try {
        await configListAction(options);
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

/**
 * Action handler for 'config list' command
 */
async function configListAction(options: ConfigListOptions): Promise<void> {
  const config = await loadConfig();

  console.log('');
  console.log('Current configuration:');
  console.log('');
  console.log(JSON.stringify(config, null, 2));
  console.log('');

  if (options.showOrigin) {
    console.log('Configuration sources:');
    console.log('  1. Default values (built-in)');
    console.log(`  2. Global config (${getConfigPath(true, 'json')})`);
    console.log(`  3. Project config (${getConfigPath(false, 'json')})`);
    console.log('  4. Environment variables');
    console.log('');
  }
}

/**
 * Create the 'config edit' subcommand
 */
function createConfigEditCommand(): Command {
  const command = new Command('edit');

  command
    .description('Open configuration file in your default editor')
    .option('-g, --global', 'Edit global configuration')
    .action((options: ConfigEditOptions) => {
      try {
        configEditAction(options);
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

/**
 * Action handler for 'config edit' command
 */
function configEditAction(options: ConfigEditOptions): void {
  const isGlobal = options.global || false;
  let configPath = findExistingConfigPath(isGlobal);

  // Create config if it doesn't exist
  if (!configPath) {
    configPath = getConfigPath(isGlobal, 'json');
    writeConfigFile(configPath, {}, 'json');
    console.log(`Created new configuration file: ${configPath}`);
  }

  // Get editor
  const editor =
    process.env.VISUAL ||
    process.env.EDITOR ||
    (process.platform === 'win32' ? 'notepad' : 'vi');

  console.log(`Opening ${configPath} in ${editor}...`);

  try {
    execSync(`${editor} '${configPath}'`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to open editor');
    console.error(`You can manually edit the file at: ${configPath}`);
    process.exit(1);
  }
}

/**
 * Create the 'config validate' subcommand
 */
function createConfigValidateCommand(): Command {
  const command = new Command('validate');

  command.description('Validate current configuration').action(async () => {
    try {
      await configValidateAction();
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

/**
 * Action handler for 'config validate' command
 */
async function configValidateAction(): Promise<void> {
  try {
    const config = await loadConfig();
    validateConfig(config);
    console.log('✓ Configuration is valid');
  } catch (error) {
    console.error(
      `Invalid configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

/**
 * Helper: Get config file path
 */
function getConfigPath(
  isGlobal: boolean,
  format: 'json' | 'yaml' | 'js',
): string {
  const base = isGlobal ? homedir() : process.cwd();
  const fileName =
    format === 'json'
      ? '.md2do.json'
      : format === 'yaml'
        ? '.md2do.yaml'
        : '.md2do.js';
  return join(base, fileName);
}

/**
 * Helper: Find existing config file path
 */
function findExistingConfigPath(isGlobal: boolean): string | null {
  const base = isGlobal ? homedir() : process.cwd();
  const possibleFiles = [
    '.md2do.json',
    '.md2do.yaml',
    '.md2do.yml',
    '.md2do.js',
    '.md2do.cjs',
    'md2do.config.js',
    'md2do.config.cjs',
  ];

  for (const file of possibleFiles) {
    const path = join(base, file);
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

/**
 * Helper: Get format from config path
 */
function getConfigFormat(path: string): 'json' | 'yaml' | 'js' {
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.yaml') || path.endsWith('.yml')) return 'yaml';
  return 'js';
}

/**
 * Helper: Parse config file content
 */
function parseConfigFile(
  content: string,
  format: 'json' | 'yaml' | 'js',
): Partial<Config> {
  if (format === 'json') {
    return JSON.parse(content) as Partial<Config>;
  } else if (format === 'yaml') {
    const loaded = yaml.load(content);
    return (loaded || {}) as Partial<Config>;
  } else {
    // For JS files, we'd need to eval or require, which is complex
    // For now, just parse as JSON
    return JSON.parse(content) as Partial<Config>;
  }
}

/**
 * Helper: Write config file
 */
function writeConfigFile(
  path: string,
  config: Partial<Config>,
  format: 'json' | 'yaml' | 'js',
): void {
  let content: string;

  if (format === 'json') {
    content = JSON.stringify(config, null, 2) + '\n';
  } else if (format === 'yaml') {
    content = yaml.dump(config);
  } else {
    content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
  }

  writeFileSync(path, content, 'utf-8');
}

/**
 * Helper: Parse value from string
 */
function parseValue(value: string): unknown {
  // Try boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Try number
  const num = Number(value);
  if (!isNaN(num)) return num;

  // Try JSON
  try {
    return JSON.parse(value);
  } catch {
    // Return as string
    return value;
  }
}

/**
 * Helper: Get nested value from object
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Helper: Set nested value in object
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current: Record<string, unknown> = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}
