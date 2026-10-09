import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { DEFAULT_CONFIG, type Config } from '@md2do/config';
import { resolveScanTarget } from '../src/scanner.js';

const cwd = '/work';

function withMarkdown(markdown: Config['markdown']): Config {
  return { ...DEFAULT_CONFIG, markdown };
}

describe('resolveScanTarget', () => {
  it('should use config root and pattern when no CLI options are given', () => {
    const config = withMarkdown({ root: './notes', pattern: '*.md' });

    expect(resolveScanTarget({}, config, cwd)).toEqual({
      root: join(cwd, 'notes'),
      pattern: '*.md',
    });
  });

  it('should prefer explicit CLI options over config', () => {
    const config = withMarkdown({ root: './notes', pattern: '*.md' });

    expect(
      resolveScanTarget(
        { path: '/elsewhere', pattern: 'todo/**/*.md' },
        config,
        cwd,
      ),
    ).toEqual({ root: '/elsewhere', pattern: 'todo/**/*.md' });
  });

  it('should keep an absolute config root as is', () => {
    const config = withMarkdown({ root: '/vault' });

    expect(resolveScanTarget({}, config, cwd).root).toBe('/vault');
  });

  it('should fall back to cwd and the default pattern', () => {
    expect(resolveScanTarget({}, DEFAULT_CONFIG, cwd)).toEqual({
      root: cwd,
      pattern: '**/*.md',
    });
  });

  it('should omit pattern when neither CLI nor config set one', () => {
    expect(resolveScanTarget({}, withMarkdown(undefined), cwd)).toEqual({
      root: cwd,
    });
  });
});
