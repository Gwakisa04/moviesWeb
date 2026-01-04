#!/bin/bash
set -e

# Install dependencies
npm install

# Build using node directly
node node_modules/vite/bin/vite.js build

echo "Build completed successfully!"

