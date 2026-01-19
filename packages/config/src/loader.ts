import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { Config, ConfigSchema, DEFAULT_CONFIG } from './schema.js';

const MODULE_NAME = 'md2do';

/**
 * Deep merge two objects, with source values taking precedence
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue !== undefined &&
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue) &&
      targetValue !== null
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Load configuration from environment variables
 */
function loadEnvConfig(): Partial<Config> {
  const config: Partial<Config> = {};

  // Check for Todoist API token in environment
  const todoistToken = process.env.TODOIST_API_TOKEN;
  if (todoistToken) {
    config.todoist = {
      apiToken: todoistToken,
    };
  }

  // Check for default assignee
  const defaultAssignee = process.env.MD2DO_DEFAULT_ASSIGNEE;
  if (defaultAssignee) {
    config.defaultAssignee = defaultAssignee;
  }

  return config;
}

/**
 * Load and validate configuration file
 */
async function loadConfigFile(
  searchFrom: string,
): Promise<Partial<Config> | null> {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      '.md2do.json',
      '.md2do.yaml',
      '.md2do.yml',
      '.md2do.js',
      '.md2do.cjs',
      'md2do.config.js',
      'md2do.config.cjs',
    ],
    loaders: {
      '.js': TypeScriptLoader(),
      '.cjs': TypeScriptLoader(),
    },
  });

  try {
    const result = await explorer.search(searchFrom);
    if (!result || result.isEmpty) {
      return null;
    }

    // Validate the loaded configuration
    const validated = ConfigSchema.parse(result.config);
    return validated;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid configuration: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load global configuration from home directory
 */
async function loadGlobalConfig(): Promise<Partial<Config> | null> {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (!homeDir) {
    return null;
  }

  return loadConfigFile(homeDir);
}

export interface LoadConfigOptions {
  /**
   * Directory to start searching for project config
   * Defaults to process.cwd()
   */
  cwd?: string;

  /**
   * Whether to load global config from home directory
   * Defaults to true
   */
  loadGlobal?: boolean;

  /**
   * Whether to load environment variables
   * Defaults to true
   */
  loadEnv?: boolean;
}

/**
 * Load configuration with hierarchical resolution:
 * 1. Default values
 * 2. Global config (~/.md2do.json)
 * 3. Project config (walks up from cwd)
 * 4. Environment variables
 *
 * Later sources override earlier ones.
 */
export async function loadConfig(
  options: LoadConfigOptions = {},
): Promise<Config> {
  const { cwd = process.cwd(), loadGlobal = true, loadEnv = true } = options;

  let config: Config = DEFAULT_CONFIG;

  // 1. Start with defaults (already set)

  // 2. Load global config
  if (loadGlobal) {
    const globalConfig = await loadGlobalConfig();
    if (globalConfig) {
      config = deepMerge(config, globalConfig);
    }
  }

  // 3. Load project config (walks up from cwd)
  const projectConfig = await loadConfigFile(cwd);
  if (projectConfig) {
    config = deepMerge(config, projectConfig);
  }

  // 4. Load environment variables (highest precedence)
  if (loadEnv) {
    const envConfig = loadEnvConfig();
    config = deepMerge(config, envConfig);
  }

  return config;
}

/**
 * Validate a configuration object
 */
export function validateConfig(config: unknown): Config {
  return ConfigSchema.parse(config);
}
