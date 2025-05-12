#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Add all changes
git add .

# Bump patch version automatically before publishing
npm version patch --no-git-tag-version

# Commit with a message, or use a default if none provided
if [ -z "$1" ]; then
  msg="Update: $(date '+%Y-%m-%d %H:%M:%S')"
else
  msg="$1"
fi

git add package.json package-lock.json

git commit -m "$msg"

echo "Pushing to GitHub..."
git push origin main

echo "Publishing to npm..."
npm publish --access public

echo "Done! Changes pushed to GitHub and published to npm."
