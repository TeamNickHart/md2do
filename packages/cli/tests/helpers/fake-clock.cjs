// Test-only preload: freezes `Date` in a spawned CLI process.
//
// Loaded with `node --require fake-clock.cjs dist/cli.js` by run-cli.ts. The
// CLI itself never reads MD2DO_TEST_NOW. The value is anything `new Date()`
// accepts; a string without an offset (`2026-10-09T00:00:30`) is read as
// wall-clock time in the process timezone (TZ).
const fixed = process.env.MD2DO_TEST_NOW;

if (fixed) {
  const RealDate = Date;
  const now = new RealDate(fixed).getTime();

  if (Number.isNaN(now)) {
    throw new Error(`fake-clock: invalid MD2DO_TEST_NOW "${fixed}"`);
  }

  class FakeDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(now);
      } else {
        super(...args);
      }
    }

    static now() {
      return now;
    }
  }

  global.Date = FakeDate;
}
