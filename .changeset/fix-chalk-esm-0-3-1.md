---
'@md2do/cli': patch
---

fix: pin chalk to exact version 4.1.2 to prevent ESM compatibility issues

Pinning chalk to exactly 4.1.2 (without caret) ensures that package managers don't accidentally install chalk v5 (which is ESM-only) when users install the CLI globally. This fixes "ERR_REQUIRE_ESM" errors that occurred when chalk v5 was resolved instead of v4.

Fixes: ERR_REQUIRE_ESM when installing @md2do/cli globally
