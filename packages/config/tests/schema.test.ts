import { describe, it, expect } from 'vitest';
import {
  ConfigSchema,
  MarkdownConfigSchema,
  TodoistConfigSchema,
  OutputConfigSchema,
  DEFAULT_CONFIG,
} from '../src/schema.js';

describe('ConfigSchema', () => {
  it('should validate a complete config', () => {
    const config = {
      markdown: {
        root: '/path/to/markdown',
        exclude: ['node_modules/**'],
        pattern: '**/*.md',
      },
      defaultAssignee: 'nick',
      todoist: {
        apiToken: 'test-token',
        defaultProject: 'Inbox',
        autoSync: true,
        syncDirection: 'both' as const,
        labelMapping: { urgent: 'p1', high: 'p2' },
      },
      output: {
        format: 'pretty' as const,
        colors: true,
        paths: true,
      },
    };

    const result = ConfigSchema.parse(config);
    expect(result).toEqual(config);
  });

  it('should validate a minimal config', () => {
    const config = {};
    const result = ConfigSchema.parse(config);
    expect(result).toEqual({});
  });

  it('should validate partial configs', () => {
    const config = {
      todoist: {
        apiToken: 'test-token',
      },
    };

    const result = ConfigSchema.parse(config);
    expect(result).toEqual(config);
  });

  it('should reject invalid sync direction', () => {
    const config = {
      todoist: {
        syncDirection: 'invalid',
      },
    };

    expect(() => ConfigSchema.parse(config)).toThrow();
  });

  it('should reject invalid output format', () => {
    const config = {
      output: {
        format: 'invalid',
      },
    };

    expect(() => ConfigSchema.parse(config)).toThrow();
  });
});

describe('MarkdownConfigSchema', () => {
  it('should validate markdown config', () => {
    const config = {
      root: '/path/to/markdown',
      exclude: ['node_modules/**', '.git/**'],
      pattern: '**/*.md',
    };

    const result = MarkdownConfigSchema.parse(config);
    expect(result).toEqual(config);
  });

  it('should allow undefined', () => {
    const result = MarkdownConfigSchema.parse(undefined);
    expect(result).toBeUndefined();
  });
});

describe('TodoistConfigSchema', () => {
  it('should validate todoist config', () => {
    const config = {
      apiToken: 'test-token',
      defaultProject: 'Inbox',
      autoSync: false,
      syncDirection: 'push' as const,
      labelMapping: { urgent: 'p1' },
    };

    const result = TodoistConfigSchema.parse(config);
    expect(result).toEqual(config);
  });

  it('should validate sync direction options', () => {
    const push = TodoistConfigSchema.parse({ syncDirection: 'push' });
    expect(push?.syncDirection).toBe('push');

    const pull = TodoistConfigSchema.parse({ syncDirection: 'pull' });
    expect(pull?.syncDirection).toBe('pull');

    const both = TodoistConfigSchema.parse({ syncDirection: 'both' });
    expect(both?.syncDirection).toBe('both');
  });

  it('should allow undefined', () => {
    const result = TodoistConfigSchema.parse(undefined);
    expect(result).toBeUndefined();
  });
});

describe('OutputConfigSchema', () => {
  it('should validate output config', () => {
    const config = {
      format: 'table' as const,
      colors: false,
      paths: false,
    };

    const result = OutputConfigSchema.parse(config);
    expect(result).toEqual(config);
  });

  it('should validate format options', () => {
    const pretty = OutputConfigSchema.parse({ format: 'pretty' });
    expect(pretty?.format).toBe('pretty');

    const table = OutputConfigSchema.parse({ format: 'table' });
    expect(table?.format).toBe('table');

    const json = OutputConfigSchema.parse({ format: 'json' });
    expect(json?.format).toBe('json');
  });

  it('should allow undefined', () => {
    const result = OutputConfigSchema.parse(undefined);
    expect(result).toBeUndefined();
  });
});

describe('DEFAULT_CONFIG', () => {
  it('should have valid defaults', () => {
    expect(DEFAULT_CONFIG).toMatchObject({
      markdown: {
        pattern: '**/*.md',
        exclude: expect.arrayContaining([
          'node_modules/**',
          '.git/**',
        ]) as string[],
      },
      todoist: {
        autoSync: false,
        syncDirection: 'both',
      },
      output: {
        format: 'pretty',
        colors: true,
        paths: true,
      },
    });
  });

  it('should pass schema validation', () => {
    const result = ConfigSchema.parse(DEFAULT_CONFIG);
    expect(result).toEqual(DEFAULT_CONFIG);
  });
});
