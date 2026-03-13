#!/bin/sh
REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/git-hooks"

for hook in "$HOOKS_DIR"/*; do
  hook_name="$(basename "$hook")"
  [ "$hook_name" = "setup.sh" ] && continue
  ln -sf "$hook" "$REPO_ROOT/.git/hooks/$hook_name"
  echo "Installed hook: $hook_name"
done
