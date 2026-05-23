#!/usr/bin/env bash
# Pre-Commit Hook: Lint / TypeCheck — SKINgenius
# Runs `npm run build` (typecheck) before allowing commit.
# Blocks commit if TypeScript errors exist.
#
# Install: ln -s .claude/hooks/pre-commit-lint.sh .git/hooks/pre-commit-lint

set -euo pipefail

# Only run if package.json exists
if [ ! -f "package.json" ]; then
    echo "⚠️  No package.json found — skipping lint hook."
    exit 0
fi

# Check if we're in a git repo
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    exit 0
fi

# Check for staged TypeScript/JS files
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json)$' || true)
if [ -z "$STAGED" ]; then
    echo "✅  No staged TS/JS files — skipping typecheck."
    exit 0
fi

echo "🔍  Running typecheck (npm run build) on staged changes..."

# Capture output to a temp file for clean error display
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

if ! npm run build >"$TMPFILE" 2>&1; then
    echo ""
    echo "🚨  TYPECHECK FAILED — COMMIT BLOCKED 🚨"
    echo ""
    # Show first 60 lines of error output
    head -n 60 "$TMPFILE"
    echo ""
    echo "Fix TypeScript errors before committing."
    echo "To bypass (not recommended): git commit --no-verify"
    exit 1
fi

echo "✅  TypeScript typecheck passed."
exit 0
