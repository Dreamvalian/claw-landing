#!/bin/bash
set -e

cd /root/claw-landing-new

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building..."
NEXT_DISABLE_ESLINT=1 npm run build

echo "Restarting PM2..."
pm2 restart hermes-web

echo "Done. Site running at https://ko4lax.dev"
