#!/bin/bash
echo "Deploying to Netlify..."
cd mobile
pnpm install
npx expo export -p web
npx netlify deploy --prod --dir=dist
echo "Deploy complete!"
