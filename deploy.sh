#!/bin/bash
set -e

cd /root/claw-landing-new

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Restarting PM2..."
pm2 restart hermes-web || pm2 start npm --name "hermes-web" -- start

echo "Done."
