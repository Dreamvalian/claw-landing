#!/bin/bash
# Deploy script for claw-landing
# Usage: ./deploy.sh

cd /root/.openclaw/landing/claw-landing

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Restarting service..."
pm2 restart claw-landing || pm2 start npm --name claw-landing -- start

echo "Done!"
