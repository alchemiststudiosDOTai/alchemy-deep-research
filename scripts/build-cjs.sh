#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

echo "Building CommonJS output to dist/cjs/ ..."

# Compile TypeScript to CommonJS using tsconfig.cjs.json
npx tsc -p tsconfig.cjs.json

echo "CommonJS build complete. Output in dist/cjs/"