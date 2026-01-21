#!/usr/bin/env bash

# E2E Test Suite for md2do CLI
# This script validates all documented features work as expected with the examples

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

# CLI command
CLI="pnpm cli --"
EXAMPLES_PATH="examples"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  md2do E2E Test Suite                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Helper function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    local should_fail="${4:-false}"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Test $TOTAL_TESTS:${NC} $test_name"
    echo -e "${BLUE}  Command:${NC} $command"

    # Run command and capture output
    set +e  # Don't exit on error for this command
    OUTPUT=$(eval "$command" 2>&1)
    EXIT_CODE=$?
    set -e

    # Check if test should fail
    if [ "$should_fail" = "true" ]; then
        if [ $EXIT_CODE -ne 0 ]; then
            echo -e "${GREEN}  ✓ PASSED${NC} (expected failure)\n"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            echo -e "${RED}  ✗ FAILED${NC} (should have failed but didn't)\n"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    fi

    # Check exit code for normal tests
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}  ✗ FAILED${NC} (exit code: $EXIT_CODE)"
        echo -e "${RED}  Output:${NC} $OUTPUT\n"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi

    # Check output pattern if provided
    if [ -n "$expected_pattern" ]; then
        if echo "$OUTPUT" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}  ✓ PASSED${NC} (found: '$expected_pattern')\n"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            echo -e "${RED}  ✗ FAILED${NC} (pattern '$expected_pattern' not found)"
            echo -e "${RED}  Output:${NC} $OUTPUT\n"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    fi

    echo -e "${GREEN}  ✓ PASSED${NC}\n"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Basic Functionality Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 1: Basic list command
run_test "Basic list command" \
    "$CLI list --path $EXAMPLES_PATH" \
    "Found.*tasks"

# Test 2: List with stats command
run_test "Stats command" \
    "$CLI stats --path $EXAMPLES_PATH" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Filter Tests - Assignees${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 3: Filter by assignee
run_test "Filter by assignee (alice)" \
    "$CLI list --path $EXAMPLES_PATH --assignee alice" \
    "@alice"

# Test 4: Filter by assignee (bob)
run_test "Filter by assignee (bob)" \
    "$CLI list --path $EXAMPLES_PATH --assignee bob" \
    "@bob"

# Test 5: Filter by assignee (charlie)
run_test "Filter by assignee (charlie)" \
    "$CLI list --path $EXAMPLES_PATH --assignee charlie" \
    "@charlie"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Filter Tests - Priorities${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 6: Filter by urgent priority
run_test "Filter by urgent priority" \
    "$CLI list --path $EXAMPLES_PATH --priority urgent" \
    "!!!"

# Test 7: Filter by high priority
run_test "Filter by high priority" \
    "$CLI list --path $EXAMPLES_PATH --priority high" \
    "!!"

# Test 8: Filter by normal priority
run_test "Filter by normal priority" \
    "$CLI list --path $EXAMPLES_PATH --priority normal" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Filter Tests - Tags${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 9: Filter by backend tag
run_test "Filter by backend tag" \
    "$CLI list --path $EXAMPLES_PATH --tag backend" \
    "#backend"

# Test 10: Filter by frontend tag
run_test "Filter by frontend tag" \
    "$CLI list --path $EXAMPLES_PATH --tag frontend" \
    "#frontend"

# Test 11: Filter by bug tag
run_test "Filter by bug tag" \
    "$CLI list --path $EXAMPLES_PATH --tag bug" \
    "#bug"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Filter Tests - Completion Status${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 12: Show only incomplete tasks
run_test "Filter incomplete tasks" \
    "$CLI list --path $EXAMPLES_PATH --incomplete" \
    "incomplete"

# Test 13: Show only completed tasks
run_test "Filter completed tasks" \
    "$CLI list --path $EXAMPLES_PATH --completed" \
    "completed"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Filter Tests - Date Filters${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 14: Filter overdue tasks
run_test "Filter overdue tasks" \
    "$CLI list --path $EXAMPLES_PATH --overdue" \
    "tasks"

# Test 15: Filter due today
run_test "Filter due today" \
    "$CLI list --path $EXAMPLES_PATH --due-today" \
    "tasks"

# Test 16: Filter due this week
run_test "Filter due this week" \
    "$CLI list --path $EXAMPLES_PATH --due-this-week" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Filter Tests - Projects${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 17: Filter by project (acme-app)
run_test "Filter by project (acme-app)" \
    "$CLI list --path $EXAMPLES_PATH --project acme-app" \
    "tasks"

# Test 18: Filter by project (widget-co)
run_test "Filter by project (widget-co)" \
    "$CLI list --path $EXAMPLES_PATH --project widget-co" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Sorting Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 19: Sort by priority
run_test "Sort by priority" \
    "$CLI list --path $EXAMPLES_PATH --sort priority --limit 5" \
    "tasks"

# Test 20: Sort by due date
run_test "Sort by due date" \
    "$CLI list --path $EXAMPLES_PATH --sort due --limit 5" \
    "tasks"

# Test 21: Sort by assignee
run_test "Sort by assignee" \
    "$CLI list --path $EXAMPLES_PATH --sort assignee --limit 5" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Output Format Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 22: JSON output format
run_test "JSON output format" \
    "$CLI list --path $EXAMPLES_PATH --format json --limit 5" \
    '"tasks"'

# Test 23: Table output format
run_test "Table output format" \
    "$CLI list --path $EXAMPLES_PATH --format table --limit 5" \
    "tasks"

# Test 24: Pretty output format (default)
run_test "Pretty output format" \
    "$CLI list --path $EXAMPLES_PATH --format pretty --limit 5" \
    "Found.*tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Combined Filter Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 25: Multiple filters (assignee + priority)
run_test "Filter by assignee and priority" \
    "$CLI list --path $EXAMPLES_PATH --assignee alice --priority urgent" \
    "tasks"

# Test 26: Multiple filters (tag + priority + incomplete)
run_test "Filter by tag, priority, and incomplete" \
    "$CLI list --path $EXAMPLES_PATH --tag backend --priority high --incomplete" \
    "tasks"

# Test 27: Filter with sorting
run_test "Filter with sorting" \
    "$CLI list --path $EXAMPLES_PATH --assignee bob --sort priority" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Stats Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 28: Stats by assignee
run_test "Stats grouped by assignee" \
    "$CLI stats --path $EXAMPLES_PATH --by assignee" \
    "tasks"

# Test 29: Stats by priority
run_test "Stats grouped by priority" \
    "$CLI stats --path $EXAMPLES_PATH --by priority" \
    "tasks"

# Test 30: Stats by project
run_test "Stats grouped by project" \
    "$CLI stats --path $EXAMPLES_PATH --by project" \
    "tasks"

# Test 31: Stats by tag
run_test "Stats grouped by tag" \
    "$CLI stats --path $EXAMPLES_PATH --by tag" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Limit and Context Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 32: Limit results
run_test "Limit results to 10" \
    "$CLI list --path $EXAMPLES_PATH --limit 10" \
    "tasks"

# Test 33: Show context
run_test "Show task context" \
    "$CLI list --path $EXAMPLES_PATH --context --limit 5" \
    "tasks"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Edge Case Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 34: Filter with no results
run_test "Filter with no results" \
    "$CLI list --path $EXAMPLES_PATH --assignee nonexistent" \
    "Found 0 tasks"

# Test 35: Very specific filter combination
run_test "Very specific filter (should have few/no results)" \
    "$CLI list --path $EXAMPLES_PATH --assignee alice --priority urgent --tag backend --overdue" \
    "tasks"

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
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
fi
