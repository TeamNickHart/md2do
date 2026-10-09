import { describe, it, expect, vi, afterEach } from 'vitest';
import { ingestRecordToLine } from '../../src/ingest/index.js';
import type { IngestRecord } from '../../src/types/index.js';
import { LOCAL_TIME_CASES, wallDate } from '../helpers/time-cases.js';

const completedRecord: IngestRecord = {
  source: 'teams',
  externalId: 'msg-1',
  text: 'Done task',
  completed: true,
};

// These run in the process timezone. `pnpm test:tz` repeats them per zone.
describe(`ingest completion date (TZ=${process.env.TZ ?? 'system'})`, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(LOCAL_TIME_CASES)(
    'defaults to the local date: $name ($wall)',
    ({ wall }) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(wall));

      expect(ingestRecordToLine(completedRecord)).toContain(
        `{completed:${wallDate(wall)}}`,
      );
    },
  );
});
