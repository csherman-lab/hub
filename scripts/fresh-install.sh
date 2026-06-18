#!/bin/bash
set -e
cd "$(dirname "$0")/.."
echo "Cleaning Hub..."
rm -rf .next node_modules
npm install
echo ""
echo "Done. Run: npm run dev"
echo "Then open: http://localhost:3000/onboarding"
