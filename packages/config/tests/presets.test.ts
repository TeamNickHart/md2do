import { describe, it, expect } from 'vitest';
import {
  PRESET_STRICT,
  PRESET_RECOMMENDED,
  getPreset,
} from '../src/presets.js';

describe('Warning Presets', () => {
  describe('PRESET_STRICT', () => {
    it('should have warnings enabled', () => {
      expect(PRESET_STRICT.enabled).toBe(true);
    });

    it('should have all format rules set to error', () => {
      expect(PRESET_STRICT.rules['unsupported-bullet']).toBe('error');
      expect(PRESET_STRICT.rules['malformed-checkbox']).toBe('error');
      expect(PRESET_STRICT.rules['missing-space-after']).toBe('error');
      expect(PRESET_STRICT.rules['missing-space-before']).toBe('error');
      expect(PRESET_STRICT.rules['relative-date-no-context']).toBe('error');
    });

    it('should have metadata rules set to warn', () => {
      expect(PRESET_STRICT.rules['missing-due-date']).toBe('warn');
      expect(PRESET_STRICT.rules['missing-completed-date']).toBe('warn');
    });

    it('should have critical rules set to error', () => {
      expect(PRESET_STRICT.rules['duplicate-todoist-id']).toBe('error');
      expect(PRESET_STRICT.rules['file-read-error']).toBe('error');
    });

    it('should have all 9 warning rules configured', () => {
      expect(Object.keys(PRESET_STRICT.rules)).toHaveLength(9);
    });
  });

  describe('PRESET_RECOMMENDED', () => {
    it('should have warnings enabled', () => {
      expect(PRESET_RECOMMENDED.enabled).toBe(true);
    });

    it('should have format rules set to warn', () => {
      expect(PRESET_RECOMMENDED.rules['unsupported-bullet']).toBe('warn');
      expect(PRESET_RECOMMENDED.rules['malformed-checkbox']).toBe('warn');
      expect(PRESET_RECOMMENDED.rules['missing-space-after']).toBe('warn');
      expect(PRESET_RECOMMENDED.rules['missing-space-before']).toBe('warn');
      expect(PRESET_RECOMMENDED.rules['relative-date-no-context']).toBe('warn');
    });

    it('should have metadata rules set to off', () => {
      expect(PRESET_RECOMMENDED.rules['missing-due-date']).toBe('off');
      expect(PRESET_RECOMMENDED.rules['missing-completed-date']).toBe('off');
    });

    it('should have critical rules set to error', () => {
      expect(PRESET_RECOMMENDED.rules['duplicate-todoist-id']).toBe('error');
      expect(PRESET_RECOMMENDED.rules['file-read-error']).toBe('error');
    });

    it('should have all 9 warning rules configured', () => {
      expect(Object.keys(PRESET_RECOMMENDED.rules)).toHaveLength(9);
    });
  });

  describe('getPreset()', () => {
    it('should return PRESET_STRICT when "strict" is requested', () => {
      const preset = getPreset('strict');
      expect(preset).toEqual(PRESET_STRICT);
    });

    it('should return PRESET_RECOMMENDED when "recommended" is requested', () => {
      const preset = getPreset('recommended');
      expect(preset).toEqual(PRESET_RECOMMENDED);
    });

    it('should return PRESET_RECOMMENDED by default for invalid input', () => {
      // Testing the default case in the switch statement
      const preset = getPreset('unknown' as 'strict' | 'recommended');
      expect(preset).toEqual(PRESET_RECOMMENDED);
    });
  });
});
