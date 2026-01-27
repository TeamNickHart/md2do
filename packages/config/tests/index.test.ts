import { describe, it, expect } from 'vitest';
import * as config from '../src/index.js';

describe('Package Exports', () => {
  it('should export loadConfig function', () => {
    expect(typeof config.loadConfig).toBe('function');
  });

  it('should export validateConfig function', () => {
    expect(typeof config.validateConfig).toBe('function');
  });

  it('should export ConfigSchema', () => {
    expect(config.ConfigSchema).toBeDefined();
  });

  it('should export MarkdownConfigSchema', () => {
    expect(config.MarkdownConfigSchema).toBeDefined();
  });

  it('should export TodoistConfigSchema', () => {
    expect(config.TodoistConfigSchema).toBeDefined();
  });

  it('should export OutputConfigSchema', () => {
    expect(config.OutputConfigSchema).toBeDefined();
  });

  it('should export WarningConfigSchema', () => {
    expect(config.WarningConfigSchema).toBeDefined();
  });

  it('should export DEFAULT_CONFIG', () => {
    expect(config.DEFAULT_CONFIG).toBeDefined();
    expect(typeof config.DEFAULT_CONFIG).toBe('object');
  });

  it('should export PRESET_STRICT', () => {
    expect(config.PRESET_STRICT).toBeDefined();
    expect(typeof config.PRESET_STRICT).toBe('object');
  });

  it('should export PRESET_RECOMMENDED', () => {
    expect(config.PRESET_RECOMMENDED).toBeDefined();
    expect(typeof config.PRESET_RECOMMENDED).toBe('object');
  });

  it('should export getPreset function', () => {
    expect(typeof config.getPreset).toBe('function');
  });
});
