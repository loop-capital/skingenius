---
description: Create isolated branch + worktree for a SKINgenius task
scope: project
argument-hint: <task-name> [base-branch]
---

# Git Worktree — Isolated Task Branch

Create a new git worktree so this task runs on its own branch in its own directory. Main stays untouched.

**Arguments:** $ARGUMENTS

## Step 0 — Parse Arguments

- **First argument:** branch name (required).
- **Second argument:** base branch (optional, defaults to `main`)

Branch naming convention: `task/<descriptive-name>`

## Step 1 — Verify Git State

```bash
# Must be in a git repo
git rev-parse --git-dir

# Check for uncommitted changes on current branch
git status --porcelain
```

**If there are uncommitted changes:** WARN the user. Ask if they want to stash first.

## Step 2 — Determine Base Branch

```bash
# Find the default branch (main or master)
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@'
```

## Step 3 — Create Branch + Worktree

```bash
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
BRANCH_NAME="task/$1"
WORKTREE_DIR="../skingenius-tasks/$1"
BASE_BRANCH="${2:-main}"

# Create the branch and worktree in one step
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$BASE_BRANCH"
```

## Step 4 — Verify

```bash
git worktree list
```

## Step 5 — Report

```
Git Worktree Created
====================
Branch:    task/<name>
Base:      main
Directory: ../skingenius-tasks/<name>
Main repo: (untouched)

Next steps:
  cd ../skingenius-tasks/<name>
  # do work, commit, then merge back

When done:
  cd /home/jason/.openclaw/workspaces/skingenius
  git merge task/<name>
  git worktree remove ../skingenius-tasks/<name>
  git branch -d task/<name>

If something went wrong:
  git worktree remove ../skingenius-tasks/<name> --force
  git branch -D task/<name>
```
