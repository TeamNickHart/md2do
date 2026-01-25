#!/usr/bin/env bash

# NPM Publish Validation for @md2do/cli
# This script validates the package is ready for npm publish
# It checks:
# - Package structure
# - File inclusions/exclusions
# - package.json fields
# - No workspace references
# - Dependencies are correct

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  NPM Publish Validation                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper function for checks
check() {
    local check_name="$1"
    local command="$2"
    local expected_pattern="$3"

    echo -n "  Checking $check_name... "

    set +e
    OUTPUT=$(eval "$command" 2>&1)
    EXIT_CODE=$?
    set -e

    if [ $EXIT_CODE -eq 0 ]; then
        if [ -n "$expected_pattern" ]; then
            if echo "$OUTPUT" | grep -q "$expected_pattern"; then
                echo -e "${GREEN}✓${NC}"
                CHECKS_PASSED=$((CHECKS_PASSED + 1))
                return 0
            else
                echo -e "${RED}✗${NC}"
                echo -e "    ${YELLOW}Expected pattern: $expected_pattern${NC}"
                echo -e "    ${YELLOW}Got: $OUTPUT${NC}"
                CHECKS_FAILED=$((CHECKS_FAILED + 1))
                return 1
            fi
        else
            echo -e "${GREEN}✓${NC}"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
            return 0
        fi
    else
        echo -e "${RED}✗${NC}"
        echo -e "    ${YELLOW}Command failed with exit code $EXIT_CODE${NC}"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
}

echo -e "${BLUE}Package: @md2do/cli${NC}\n"

cd packages/cli

echo -e "${YELLOW}Running npm pack --dry-run...${NC}\n"
PACK_OUTPUT=$(npm pack --dry-run 2>&1)

echo -e "${BLUE}File Inclusion Checks:${NC}"
check "dist directory included" \
    "echo '$PACK_OUTPUT'" \
    "dist/"
check "package.json included" \
    "echo '$PACK_OUTPUT'" \
    "package.json"
check "README included" \
    "echo '$PACK_OUTPUT'" \
    "README"
echo ""

echo -e "${BLUE}File Exclusion Checks:${NC}"
check "src directory excluded" \
    "echo '$PACK_OUTPUT' | grep -v 'src/'" \
    ""
check "tests excluded" \
    "echo '$PACK_OUTPUT' | grep -v 'test'" \
    ""
check "node_modules excluded" \
    "echo '$PACK_OUTPUT' | grep -v 'node_modules'" \
    ""
echo ""

echo -e "${BLUE}Package.json Field Checks:${NC}"
check "name is @md2do/cli" \
    "cat package.json | jq -r '.name'" \
    "@md2do/cli"
check "version is set" \
    "cat package.json | jq -r '.version'" \
    "[0-9]"
check "main entry point exists" \
    "cat package.json | jq -r '.main' | xargs test -f && echo 'exists'" \
    "exists"
check "bin entry point exists" \
    "cat package.json | jq -r '.bin.md2do' | xargs test -f && echo 'exists'" \
    "exists"
check "repository is set" \
    "cat package.json | jq -r '.repository.url'" \
    "github.com"
check "license is set" \
    "cat package.json | jq -r '.license'" \
    "MIT"
check "homepage is set" \
    "cat package.json | jq -r '.homepage'" \
    "md2do.com"
echo ""

echo -e "${BLUE}Dependency Checks:${NC}"
check "no workspace dependencies" \
    "cat package.json | jq '.dependencies' | grep -v 'workspace:'" \
    ""
check "dependencies are valid" \
    "cat package.json | jq -e '.dependencies'" \
    ""
echo ""

echo -e "${BLUE}Build Artifact Checks:${NC}"
check "dist/cli.js exists" \
    "test -f dist/cli.js && echo 'exists'" \
    "exists"
check "dist/index.js exists" \
    "test -f dist/index.js && echo 'exists'" \
    "exists"
check "dist/index.d.ts exists" \
    "test -f dist/index.d.ts && echo 'exists'" \
    "exists"
check "cli.js has shebang" \
    "head -1 dist/cli.js" \
    "^#!"
echo ""

cd ../..

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Validation Summary                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Checks:  $((CHECKS_PASSED + CHECKS_FAILED))"
echo -e "${GREEN}Passed:        $CHECKS_PASSED${NC}"
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed:        $CHECKS_FAILED${NC}"
    echo ""
    echo -e "${RED}❌ Package is NOT ready for publish!${NC}"
    exit 1
else
    echo -e "Failed:        $CHECKS_FAILED"
    echo ""
    echo -e "${GREEN}✅ Package is ready for publish!${NC}"
    echo ""
    echo -e "${YELLOW}To publish:${NC}"
    echo -e "  cd packages/cli"
    echo -e "  npm publish --access public"
    exit 0
fi
