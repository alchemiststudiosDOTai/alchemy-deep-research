#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# 1. Add all current changes to staging
echo "Staging all changes..."
git add .

# 2. Bump patch version (updates package.json, package-lock.json but doesn't commit or tag yet)
echo "Bumping patch version..."
npm version patch --no-git-tag-version
# This outputs the new version, e.g., v0.1.3

# 3. Add updated package.json and package-lock.json to staging
git add package.json package-lock.json

# 4. Commit all staged changes (including version bump)
commit_msg="$1"
if [ -z "$commit_msg" ]; then
 new_version=$(node -p "require('./package.json').version") # Read new version
 commit_msg="chore: release v${new_version}" # Default commit message for release
else
 # If a message is provided, use it and append version info.
 new_version=$(node -p "require('./package.json').version")
 commit_msg="$1 - release v${new_version}"
fi

echo "Committing changes with message: $commit_msg"
git commit -m "$commit_msg"

# 5. Push commit to GitHub (main branch)
echo "Pushing commit to GitHub..."
git push origin main

# 6. Build the project (compiles src to dist)
echo "Building the project..."
npm run build

# 7. Publish to npm
echo "Publishing to npm..."
npm publish --access public

echo "Done! Changes pushed to GitHub and published to npm."
