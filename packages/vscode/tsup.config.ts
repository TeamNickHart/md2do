import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  external: ['vscode'],
  noExternal: ['@md2do/core', '@md2do/config'],
  bundle: true,
  minify: true,
  sourcemap: false,
  clean: true,
});
