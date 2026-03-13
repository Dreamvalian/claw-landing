#!/bin/bash
# Webhook endpoint for GitHub deployment
# Creates a simple endpoint that triggers deploy.sh

PORT=3001

echo "Starting webhook server on port $PORT..."

# Simple netcat-based webhook server
while true; do
    echo "Waiting for webhook request..."
    REQUEST=$(echo -e "HTTP/1.1 200 OK\nContent-Type: text/plain\n\nDeploy triggered!" | nc -l -p $PORT -q 1)
    
    if echo "$REQUEST" | grep -q "POST /deploy"; then
        echo "Deploy triggered at $(date)"
        cd /root/.openclaw/landing/claw-landing && git pull origin main && npm install && npm run build
        pm2 restart claw-landing
        echo "Deploy complete!"
    fi
done
