#!/usr/bin/env node
// Run the test suites of the packages with date logic once per timezone.
// Each package's vitest.config.ts keeps a TZ that is already set, so the
// TZ passed here reaches the test workers.
//
// Usage: node scripts/test-tz.mjs [timezone...]

import { spawnSync } from 'node:child_process';

const DEFAULT_ZONES = [
  'UTC',
  'America/Los_Angeles', // UTC-8/-7, DST
  'Europe/Berlin', // UTC+1/+2, DST
  'Asia/Kolkata', // UTC+5:30
  'Pacific/Kiritimati', // UTC+14, furthest ahead
  'Pacific/Pago_Pago', // UTC-11, furthest behind
];

const PACKAGES = ['@md2do/core', '@md2do/cli', '@md2do/todoist', '@md2do/mcp'];

const zones = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_ZONES;
const filters = PACKAGES.flatMap((name) => ['--filter', name]);
const failed = [];

for (const zone of zones) {
  console.log(`\n=== TZ=${zone} ===`);
  const result = spawnSync(
    'pnpm',
    [...filters, '--no-bail', 'run', 'test:run'],
    {
      stdio: 'inherit',
      env: { ...process.env, TZ: zone },
    },
  );
  if (result.status !== 0) {
    failed.push(zone);
  }
}

if (failed.length > 0) {
  console.error(`\nTests failed in: ${failed.join(', ')}`);
  process.exit(1);
}

console.log(`\nTests passed in ${zones.length} timezones.`);
