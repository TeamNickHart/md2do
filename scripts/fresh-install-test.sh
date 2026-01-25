#!/usr/bin/env bash

# Fresh Install Test for @md2do/cli
# This script tests the package as users would install it from npm
# It validates:
# - Package can be installed globally
# - All commands work correctly
# - Examples directory works as test data
# - npx usage works

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Fresh Install Test Suite             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Create temp directory for installation
TEMP_DIR=$(mktemp -d)
TEMP_NPM_PREFIX="$TEMP_DIR/npm-global"
PACKAGE_TGZ=""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    if [ -n "$PACKAGE_TGZ" ] && [ -f "$PACKAGE_TGZ" ]; then
        rm -f "$PACKAGE_TGZ"
        echo "  Removed package tarball"
    fi
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        echo "  Removed temporary directory"
    fi
    echo -e "${GREEN}Cleanup complete!${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Helper function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Test $TOTAL_TESTS:${NC} $test_name"

    # Run command and capture output
    set +e  # Don't exit on error for this command
    OUTPUT=$(eval "$command" 2>&1)
    EXIT_CODE=$?
    set -e

    # Check exit code
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}  ✗ FAILED${NC} (exit code: $EXIT_CODE)"
        echo -e "${RED}  Output:${NC} $OUTPUT"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi

    # Check output pattern if provided
    if [ -n "$expected_pattern" ]; then
        if echo "$OUTPUT" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}  ✓ PASSED${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            echo -e "${RED}  ✗ FAILED${NC} (pattern '$expected_pattern' not found)"
            echo -e "${RED}  Output:${NC} $OUTPUT"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    fi

    echo -e "${GREEN}  ✓ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 1: Build & Pack${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Step 1: Build the CLI package
echo -e "${YELLOW}Building CLI package...${NC}"
cd packages/cli
pnpm build >/dev/null 2>&1
cd ../..
echo -e "${GREEN}✓ Build complete${NC}\n"

# Step 2: Pack the package
echo -e "${YELLOW}Packing @md2do/cli to tarball...${NC}"
cd packages/cli
PACKAGE_TGZ=$(npm pack --silent)
mv "$PACKAGE_TGZ" ../../
cd ../..
PACKAGE_TGZ="$(pwd)/$PACKAGE_TGZ"
echo -e "${GREEN}✓ Created: $PACKAGE_TGZ${NC}\n"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 2: Global Install${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Step 3: Install package globally to temp location
echo -e "${YELLOW}Installing package globally to temp location...${NC}"
mkdir -p "$TEMP_NPM_PREFIX"
if ! npm install --global --prefix "$TEMP_NPM_PREFIX" "$PACKAGE_TGZ" 2>&1 | tail -5; then
    echo -e "${RED}✗ Global install failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Global install complete${NC}\n"

# Add temp npm global bin to PATH
export PATH="$TEMP_NPM_PREFIX/bin:$PATH"

# Verify md2do command is available
echo -e "${YELLOW}Verifying md2do command...${NC}"
if ! command -v md2do &> /dev/null; then
    echo -e "${RED}✗ md2do command not found in PATH!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ md2do command found${NC}\n"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 3: Basic Functionality Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 1: Version command
run_test "Version command works" \
    "md2do --version" \
    "[0-9]"

# Test 2: Help command
run_test "Help command works" \
    "md2do --help" \
    "Usage:"

# Test 3: List command
run_test "List command works" \
    "md2do list --path examples" \
    "Found.*tasks"

# Test 4: Stats command
run_test "Stats command works" \
    "md2do stats --path examples" \
    "Total"

echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 4: Filter Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 5: Filter by assignee
run_test "Filter by assignee" \
    "md2do list --path examples --assignee alice" \
    "@alice"

# Test 6: Filter by priority
run_test "Filter by priority" \
    "md2do list --path examples --priority urgent" \
    "tasks"

# Test 7: Filter by tag
run_test "Filter by tag" \
    "md2do list --path examples --tag backend" \
    "#backend"

# Test 8: Filter incomplete
run_test "Filter incomplete tasks" \
    "md2do list --path examples --incomplete" \
    "incomplete"

echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 5: Output Format Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 9: JSON output
run_test "JSON output format" \
    "md2do list --path examples --format json --assignee alice" \
    '"tasks"'

# Test 10: Table output
run_test "Table output format" \
    "md2do list --path examples --format table --assignee bob" \
    "Status"

# Test 11: Pretty output
run_test "Pretty output format (default)" \
    "md2do list --path examples --format pretty --tag backend" \
    "Found.*tasks"

echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 6: Stats Grouping Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 12: Stats by assignee
run_test "Stats grouped by assignee" \
    "md2do stats --path examples --by assignee" \
    "Total"

# Test 13: Stats by priority
run_test "Stats grouped by priority" \
    "md2do stats --path examples --by priority" \
    "Total"

# Test 14: Stats by project
run_test "Stats grouped by project" \
    "md2do stats --path examples --by project" \
    "Total"

echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 7: npx Usage Test${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 15: npx usage (using installed global version)
# Note: npx can't directly use tarball paths, so we test the global install
run_test "npx md2do works (via global install)" \
    "npx md2do list --path examples --assignee alice" \
    "Found.*tasks"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Results Summary                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests:   $TOTAL_TESTS"
echo -e "${GREEN}Passed:        $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Failed:        $FAILED_TESTS${NC}"
else
    echo -e "Failed:        $FAILED_TESTS"
fi
echo ""

# Calculate percentage
if [ $TOTAL_TESTS -gt 0 ]; then
    PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Success Rate:  $PERCENTAGE%"
    echo ""
fi

# Exit with appropriate code
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All fresh install tests passed!${NC}"
    echo -e "${GREEN}Package is ready for users!${NC}"
    exit 0
fi
