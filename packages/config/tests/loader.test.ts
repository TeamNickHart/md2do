import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig, validateConfig } from '../src/loader.js';
import { DEFAULT_CONFIG } from '../src/schema.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('loadConfig', () => {
  let tempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md2do-config-test-'));
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
    // Restore environment
    process.env = originalEnv;
  });

  it('should return default config when no config files exist', async () => {
    const config = await loadConfig({
      cwd: tempDir,
      loadGlobal: false,
      loadEnv: false,
    });

    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('should load config from .md2do.json', async () => {
    const configPath = path.join(tempDir, '.md2do.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({
        todoist: {
          apiToken: 'test-token-json',
          defaultProject: 'Work',
        },
      }),
    );

    const config = await loadConfig({
      cwd: tempDir,
      loadGlobal: false,
      loadEnv: false,
    });

    expect(config.todoist?.apiToken).toBe('test-token-json');
    expect(config.todoist?.defaultProject).toBe('Work');
  });

  it('should load config from .md2do.yaml', async () => {
    const configPath = path.join(tempDir, '.md2do.yaml');
    await fs.writeFile(
      configPath,
      `
todoist:
  apiToken: test-token-yaml
  defaultProject: Personal
`,
    );

    const config = await loadConfig({
      cwd: tempDir,
      loadGlobal: false,
      loadEnv: false,
    });

    expect(config.todoist?.apiToken).toBe('test-token-yaml');
    expect(config.todoist?.defaultProject).toBe('Personal');
  });

  it('should load environment variables', async () => {
    process.env.TODOIST_API_TOKEN = 'env-token';
    process.env.MD2DO_DEFAULT_ASSIGNEE = 'nick';

    const config = await loadConfig({
      cwd: tempDir,
      loadGlobal: false,
      loadEnv: true,
    });

    expect(config.todoist?.apiToken).toBe('env-token');
    expect(config.defaultAssignee).toBe('nick');
  });

  it('should merge configs with correct precedence', async () => {
    // Create project config
    const configPath = path.join(tempDir, '.md2do.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({
        todoist: {
          apiToken: 'project-token',
          defaultProject: 'Work',
          autoSync: true,
        },
        defaultAssignee: 'project-assignee',
      }),
    );

    // Set environment variable (should override project config)
    process.env.TODOIST_API_TOKEN = 'env-token';

    const config = await loadConfig({
      cwd: tempDir,
      loadGlobal: false,
      loadEnv: true,
    });

    // Env should override project for apiToken
    expect(config.todoist?.apiToken).toBe('env-token');
    // Project config should be preserved for other values
    expect(config.todoist?.defaultProject).toBe('Work');
    expect(config.todoist?.autoSync).toBe(true);
    expect(config.defaultAssignee).toBe('project-assignee');
  });

  it('should deep merge nested configs', async () => {
    const configPath = path.join(tempDir, '.md2do.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({
        todoist: {
          defaultProject: 'Work',
        },
        output: {
          colors: false,
        },
      }),
    );

    const config = await loadConfig({
      cwd: tempDir,
      loadGlobal: false,
      loadEnv: false,
    });

    // Should merge with defaults
    expect(config.todoist?.defaultProject).toBe('Work');
    expect(config.todoist?.autoSync).toBe(false); // from DEFAULT_CONFIG
    expect(config.output?.colors).toBe(false);
    expect(config.output?.format).toBe('pretty'); // from DEFAULT_CONFIG
  });

  it('should throw error for invalid config', async () => {
    const configPath = path.join(tempDir, '.md2do.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({
        todoist: {
          syncDirection: 'invalid',
        },
      }),
    );

    await expect(
      loadConfig({
        cwd: tempDir,
        loadGlobal: false,
        loadEnv: false,
      }),
    ).rejects.toThrow('Invalid configuration');
  });

  it('should handle missing home directory gracefully', async () => {
    const originalHome = process.env.HOME;
    const originalUserProfile = process.env.USERPROFILE;

    delete process.env.HOME;
    delete process.env.USERPROFILE;

    const config = await loadConfig({
      cwd: tempDir,
      loadGlobal: true,
      loadEnv: false,
    });

    expect(config).toEqual(DEFAULT_CONFIG);

    process.env.HOME = originalHome;
    process.env.USERPROFILE = originalUserProfile;
  });
});

describe('validateConfig', () => {
  it('should validate valid config', () => {
    const config = {
      todoist: {
        apiToken: 'test-token',
      },
    };

    const result = validateConfig(config);
    expect(result).toEqual(config);
  });

  it('should throw error for invalid config', () => {
    const config = {
      todoist: {
        syncDirection: 'invalid',
      },
    };

    expect(() => validateConfig(config)).toThrow();
  });

  it('should validate DEFAULT_CONFIG', () => {
    const result = validateConfig(DEFAULT_CONFIG);
    expect(result).toEqual(DEFAULT_CONFIG);
  });
});
