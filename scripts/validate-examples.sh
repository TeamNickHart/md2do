#!/usr/bin/env bash

# Validate Examples Script
# This script checks that all documented features have corresponding examples

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Example Coverage Validation          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

EXAMPLES_DIR="examples"
CLI="pnpm cli --"

# Check if examples directory exists
if [ ! -d "$EXAMPLES_DIR" ]; then
    echo -e "${RED}❌ Examples directory not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}Checking example coverage...${NC}\n"

# Feature checklist
check_feature() {
    local feature="$1"
    local command="$2"
    local expected="$3"

    echo -n "  Checking $feature... "
    OUTPUT=$(eval "$command" 2>&1 || true)

    if echo "$OUTPUT" | grep -q "$expected"; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        echo -e "    ${YELLOW}Expected to find: $expected${NC}"
        return 1
    fi
}

echo -e "${BLUE}Task Metadata Coverage:${NC}"
check_feature "Assignees (@username)" \
    "$CLI list --path $EXAMPLES_DIR | head -20" \
    "@"
check_feature "Priorities (!!!)" \
    "$CLI list --path $EXAMPLES_DIR | head -20" \
    "!!!"
check_feature "Tags (#tag)" \
    "$CLI list --path $EXAMPLES_DIR | head -20" \
    "#"
check_feature "Due dates (YYYY-MM-DD)" \
    "$CLI list --path $EXAMPLES_DIR | head -20" \
    "202[0-9]-"
check_feature "Todoist IDs ([todoist:123])" \
    "$CLI list --path $EXAMPLES_DIR/test-cases/todoist-sync.md" \
    "todoist:"
echo ""

echo -e "${BLUE}Filter Feature Coverage:${NC}"
check_feature "Assignee filtering" \
    "$CLI list --path $EXAMPLES_DIR --assignee alice" \
    "@alice"
check_feature "Priority filtering" \
    "$CLI list --path $EXAMPLES_DIR --priority urgent" \
    "tasks"
check_feature "Tag filtering" \
    "$CLI list --path $EXAMPLES_DIR --tag backend" \
    "#backend"
check_feature "Overdue filtering" \
    "$CLI list --path $EXAMPLES_DIR --overdue" \
    "tasks"
check_feature "Incomplete filtering" \
    "$CLI list --path $EXAMPLES_DIR --incomplete" \
    "incomplete"
check_feature "Completed filtering" \
    "$CLI list --path $EXAMPLES_DIR --completed" \
    "completed"
echo ""

echo -e "${BLUE}Project Structure Coverage:${NC}"
check_feature "Project context (projects/)" \
    "$CLI list --path $EXAMPLES_DIR --project acme-app" \
    "tasks"
check_feature "Person context (1-1s/)" \
    "$CLI list --path $EXAMPLES_DIR --person jane" \
    "tasks"
echo ""

echo -e "${BLUE}Output Format Coverage:${NC}"
check_feature "Pretty format" \
    "$CLI list --path $EXAMPLES_DIR --format pretty --limit 5" \
    "Found.*tasks"
check_feature "JSON format" \
    "$CLI list --path $EXAMPLES_DIR --format json --limit 5" \
    '"tasks"'
check_feature "Table format" \
    "$CLI list --path $EXAMPLES_DIR --format table --limit 5" \
    "tasks"
echo ""

echo -e "${BLUE}Stats Command Coverage:${NC}"
check_feature "Stats by assignee" \
    "$CLI stats --path $EXAMPLES_DIR --by assignee" \
    "tasks"
check_feature "Stats by priority" \
    "$CLI stats --path $EXAMPLES_DIR --by priority" \
    "tasks"
check_feature "Stats by project" \
    "$CLI stats --path $EXAMPLES_DIR --by project" \
    "tasks"
check_feature "Stats by tag" \
    "$CLI stats --path $EXAMPLES_DIR --by tag" \
    "tasks"
echo ""

echo -e "${BLUE}Sorting Coverage:${NC}"
check_feature "Sort by priority" \
    "$CLI list --path $EXAMPLES_DIR --sort priority --limit 5" \
    "tasks"
check_feature "Sort by due date" \
    "$CLI list --path $EXAMPLES_DIR --sort due --limit 5" \
    "tasks"
check_feature "Sort by assignee" \
    "$CLI list --path $EXAMPLES_DIR --sort assignee --limit 5" \
    "tasks"
echo ""

echo -e "${GREEN}✅ Example validation complete!${NC}"
