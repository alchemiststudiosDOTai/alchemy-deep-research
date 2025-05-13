#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

echo "Building CommonJS output to dist/cjs/index.js using esbuild..."

# Create the output directory if it doesn't exist
mkdir -p dist/cjs

# Use esbuild to bundle src/index.ts into a single CJS file.
# esbuild will handle TypeScript compilation and import.meta.url conversion.
# It will bundle your local src/ files together.
# Dependencies listed in package.json should be automatically treated as external
# by esbuild when platform is 'node'.
npx esbuild src/index.ts \
  --bundle \
  --outfile=dist/cjs/index.js \
  --platform=node \
  --format=cjs \
  --sourcemap \
  --tsconfig=tsconfig.json # Helps esbuild respect paths, target, etc. from your main tsconfig

echo "CommonJS build with esbuild complete: dist/cjs/index.js created."