#!/usr/bin/env bash
# PostToolUse hook: auto-format an edited front-end file with Prettier.
# Reads the hook payload (JSON) on stdin, extracts tool_input.file_path, and
# runs `npx prettier --write` from the front-end root (so .prettierrc + the
# locally installed prettier resolve). Always exits 0 — never blocks the edit.

set -u

# Extract the edited file path from the JSON payload on stdin.
file_path=$(node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch(e){}})' 2>/dev/null)

# Nothing to do if we could not read a path.
[ -n "$file_path" ] || exit 0

# Only format front-end source files Prettier understands.
case "$file_path" in
  */front-end/*.ts|*/front-end/*.html|*/front-end/*.scss|*/front-end/*.css|*/front-end/*.json) ;;
  *) exit 0 ;;
esac

# Resolve the front-end root from the path and format in place.
fe_root="${file_path%%/front-end/*}/front-end"
[ -d "$fe_root" ] || exit 0
( cd "$fe_root" && npx --no-install prettier --write "$file_path" >/dev/null 2>&1 ) || true

exit 0
