#!/bin/bash
set -e

# --- Configuration ---
REPO_URL=$(echo "$1" | tr -d '[:space:]')
MY_AI_API_KEY=$(echo "$2" | tr -d '[:space:]')
MODEL_ID=$(echo "$3" | tr -d '[:space:]')

if [ -z "$REPO_URL" ] || [ -z "$MY_AI_API_KEY" ] || [ -z "$MODEL_ID" ]; then
    echo "Error: Required arguments are missing."
    exit 1
fi

# Use /tmp to avoid any parent directory pollution
WORK_DIR="/tmp/bug-fixer-$$"
TARGET_DIR="$WORK_DIR/target_repo"
BRANCH_NAME="bugfix-$(date +%s)"
COMMIT_MESSAGE="feat(cline): autonomous fix for lint issues"

echo "Starting autonomous bug fixer on branch: $BRANCH_NAME"
echo "--------------------------------------------------------"

# Create clean working directory
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# 1. Clone the TARGET repository
echo "Cloning target repo: $REPO_URL"
git clone "$REPO_URL" target_repo

# 2. Enter the target repository
cd target_repo
echo "Current directory: $(pwd)"
echo ""
echo "Files in target repo:"
ls -la

# 3. Setup Git
git config user.email "bughunter-bot@github.com"
git config user.name "BugHunter Bot"

# 4. Create and switch to a new branch
git checkout -b "$BRANCH_NAME"

# 5. Install dependencies
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Verifying ESLint installation:"
if [ -x "./node_modules/.bin/eslint" ]; then
    echo "✓ ESLint found at: ./node_modules/.bin/eslint"
    ./node_modules/.bin/eslint --version
else
    echo "✗ ESLint not found in node_modules!"
    exit 1
fi

echo ""
echo "Checking for ESLint config:"
ls -la .eslintrc* 2>/dev/null || echo "No .eslintrc files"
ls -la eslint.config.* 2>/dev/null || echo "No eslint.config files"

# 6. AUTHENTICATE CLINE
echo ""
echo "Authenticating Cline CLI..."
cline auth --provider openai-native --apikey "$MY_AI_API_KEY" --modelid "$MODEL_ID"

# 7. Run ESLint and capture output
echo ""
echo "Running ESLint..."
LINT_FILE="lint.json"

# Run ESLint with explicit paths to avoid parent directory issues
./node_modules/.bin/eslint . \
  --format json \
  --output-file "$LINT_FILE" \
  2>&1 || echo "ESLint completed (may have found issues)"

echo ""
echo "--- LINT RESULTS ---"
if [ -f "$LINT_FILE" ]; then
    echo "✓ Lint file created successfully"
    cat "$LINT_FILE"
    
    # Count issues using jq if available
    if command -v jq &> /dev/null; then
        ISSUES_COUNT=$(cat "$LINT_FILE" | jq '[.[] | .messages | length] | add // 0')
        echo ""
        echo "Total issues found: $ISSUES_COUNT"
        
        if [ "$ISSUES_COUNT" -eq 0 ]; then
            echo "✓ No lint issues found. Repository is clean!"
            exit 0
        fi
    else
        echo "Note: jq not available for counting issues"
    fi
else
    echo "✗ ERROR: Lint file was not created!"
    echo "This shouldn't happen. Exiting."
    exit 1
fi

# 8. Run Cline to generate fixes
echo ""
echo "Running Cline to fix issues..."
SUMMARY_FILE="cline_summary.txt"

# Create a prompt for Cline
cat > cline_prompt.txt << 'PROMPT'
I have attached a lint.json file with ESLint errors and warnings.

Please fix all the issues by editing the source files directly:
1. Review each issue in lint.json
2. Open and edit the problematic files
3. Fix the issues (unused variables, missing semicolons, etc.)
4. Save all changes

Make minimal changes - only fix what's reported in the lint results.
PROMPT

echo "Prompt for Cline:"
cat cline_prompt.txt
echo ""

# Run Cline
cline "$(cat cline_prompt.txt)" \
  -y \
  -o \
  -f "$LINT_FILE" \
  --no-interactive \
  > "$SUMMARY_FILE" 2>&1 || true

echo ""
echo "--- CLINE OUTPUT ---"
cat "$SUMMARY_FILE"

# 9. Check for changes
echo ""
echo "Checking for changes..."
git status

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo ""
    echo "--- FILES CHANGED ---"
    git diff --name-only
    echo ""
    echo "--- DIFF ---"
    git diff
fi

# 10. Stage all changes
echo ""
echo "Staging changes..."
git add -A

# 11. Verify we have changes to commit
if git diff --cached --quiet; then
    echo ""
    echo "⚠️  No changes were made by Cline."
    echo ""
    echo "Possible reasons:"
    echo "  - Cline couldn't understand the lint.json format"
    echo "  - Cline ran but didn't save the changes"
    echo "  - The issues require manual intervention"
    echo ""
    echo "Lint results were:"
    cat "$LINT_FILE"
    exit 0
fi

# 12. Show what will be committed
echo ""
echo "--- STAGED CHANGES ---"
git diff --cached --stat
echo ""
git diff --cached

# 13. Commit
echo ""
echo "Committing changes..."
git commit -m "$COMMIT_MESSAGE" \
  -m "Auto-generated fixes for ESLint issues using Cline AI" \
  -m "Branch: $BRANCH_NAME"

# 14. Push
echo ""
echo "Pushing branch $BRANCH_NAME..."
git push origin "$BRANCH_NAME"

echo "✅ Branch pushed successfully!"

# 15. Create PR
echo ""
echo "Creating Pull Request..."

PR_BODY="## 🤖 Automated ESLint Fixes

This PR was automatically generated to fix ESLint issues.

### Cline Output
\`\`\`
$(cat "$SUMMARY_FILE" | head -40)
\`\`\`

### Details
- **Branch:** $BRANCH_NAME
- **Generated:** $(date)
- **Tool:** Cline AI + GitHub Actions"

gh pr create \
  --title "🤖 Auto-fix: ESLint issues" \
  --body "$PR_BODY" \
  --base main \
  --head "$BRANCH_NAME" || {
    echo ""
    echo "⚠️  Could not create PR automatically."
    REPO_NAME=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | sed 's/\.git$//')
    echo "Create it manually at:"
    echo "https://github.com/$REPO_NAME/compare/$BRANCH_NAME"
}

echo ""
echo "=========================================="
echo "✅ AUTONOMOUS BUG FIXER COMPLETED!"
echo "=========================================="
echo "Branch: $BRANCH_NAME"
echo "Repository: $REPO_URL"
echo "Working directory: $WORK_DIR"