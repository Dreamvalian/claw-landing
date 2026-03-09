# Backend Setup Guide - System Logs

This guide explains how to set up the backend for system logs and how OpenClaw should send logs to the web interface.

## Architecture Overview

```
OpenClaw (VPS)          Web Backend (Vercel)        Frontend
     |                         |                       |
     |---- POST /api/logs ---->|                       |
     |   (log entries)         |                       |
     |                         |---- Store in Redis -->|
     |                         |                       |
     |                         |<--- GET /api/logs ----|
     |                         |   (fetch logs)        |
     |                         |                       |
```

## 1. Redis Setup (Upstash)

The backend uses **Upstash Redis** (serverless Redis with free tier).

### Setup Steps:

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Select the region closest to your users (e.g., `ap-southeast-1` for Singapore)
4. Copy the `REST_URL` and `REST_TOKEN`

### Environment Variables

Add these to your Vercel project:

```env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

To add in Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the two variables above
5. Redeploy the project

## 2. OpenClaw Integration

Your OpenClaw bot needs to send logs to the web backend. Here are the options:

### Option A: Direct HTTP POST (Recommended)

Add this to your OpenClaw code (Python example):

```python
import requests
import os
from datetime import datetime

# Configuration
LOGS_API_URL = "https://ko4lax.dev/api/logs"  # Your website URL

class WebLogger:
    def __init__(self, api_url: str = LOGS_API_URL):
        self.api_url = api_url
    
    def send_log(self, level: str, message: str):
        """Send log to web backend"""
        try:
            payload = {
                "level": level.lower(),  # "info", "warning", "error", "success"
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
                "source": "openclaw"
            }
            
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=5,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                print(f"Failed to send log: {response.text}")
                
        except Exception as e:
            print(f"Error sending log to web: {e}")

# Usage
web_logger = WebLogger()

# Send different log levels
web_logger.send_log("info", "Agent initialized successfully")
web_logger.send_log("warning", "High memory usage: 78%")
web_logger.send_log("error", "Failed to connect to API")
web_logger.send_log("success", "Task completed successfully")
```

### Option B: Discord Webhook Integration

If you already send logs to Discord, modify your Discord webhook handler:

```python
import requests
import discord
from discord.ext import commands

DISCORD_CHANNEL_ID = 123456789  # #system-log channel ID
LOGS_API_URL = "https://ko4lax.dev/api/logs"

class LoggingCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @commands.Cog.listener()
    async def on_message(self, message):
        # Only process messages from #system-log channel
        if message.channel.id != DISCORD_CHANNEL_ID:
            return
        
        # Send to web backend
        try:
            level = self.extract_level_from_message(message.content)
            
            requests.post(LOGS_API_URL, json={
                "level": level,
                "message": message.content,
                "timestamp": message.created_at.isoformat(),
                "source": "discord"
            }, timeout=5)
        except Exception as e:
            print(f"Failed to forward log: {e}")
    
    def extract_level_from_message(self, content: str) -> str:
        """Extract log level from Discord message"""
        content_lower = content.lower()
        if "error" in content_lower or "failed" in content_lower:
            return "error"
        elif "warn" in content_lower:
            return "warning"
        elif "success" in content_lower or "completed" in content_lower:
            return "success"
        else:
            return "info"

async def setup(bot):
    await bot.add_cog(LoggingCog(bot))
```

### Option C: Simple Logging Decorator

Add a decorator to your existing functions:

```python
import functools
import requests
from datetime import datetime

LOGS_API_URL = "https://ko4lax.dev/api/logs"

def log_to_web(level="info"):
    """Decorator to log function execution to web backend"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                send_log(level, f"{func.__name__} executed successfully")
                return result
            except Exception as e:
                send_log("error", f"{func.__name__} failed: {str(e)}")
                raise
        return wrapper
    return decorator

def send_log(level: str, message: str):
    """Send log to web backend"""
    try:
        requests.post(LOGS_API_URL, json={
            "level": level,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "openclaw"
        }, timeout=3)
    except:
        pass  # Fail silently to not break main functionality

# Usage example
@log_to_web("info")
def daily_analysis():
    # Your analysis code here
    pass

@log_to_web("success")
def send_report():
    # Your report code here
    pass
```

## 3. API Reference

### POST /api/logs

Add a new log entry.

**Request Body:**
```json
{
  "level": "info",           // Required: "info", "warning", "error", "success"
  "message": "Log message",  // Required: string
  "timestamp": "2026-03-09T14:32:15Z",  // Optional: ISO 8601 format
  "source": "openclaw"       // Optional: string (default: "openclaw")
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "timestamp": "2026-03-09T14:32:15Z",
    "level": "info",
    "message": "Log message",
    "source": "openclaw"
  }
}
```

### GET /api/logs

Retrieve all logs (newest first).

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2026-03-09T14:32:15Z",
      "level": "info",
      "message": "Agent initialized",
      "source": "openclaw"
    }
  ],
  "count": 1
}
```

### DELETE /api/logs

Clear all logs (requires admin token).

**Headers:**
```
Authorization: Bearer your-admin-token
```

**Response:**
```json
{
  "success": true,
  "message": "All logs cleared"
}
```

## 4. Testing

Test the API with curl:

```bash
# Add a log
curl -X POST https://ko4lax.dev/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"Test log from curl"}'

# Get all logs
curl https://ko4lax.dev/api/logs

# Add error log
curl -X POST https://ko4lax.dev/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level":"error","message":"Something went wrong"}'
```

## 5. Log Retention

- **Max logs stored:** 100 (older logs are automatically trimmed)
- **TTL:** 7 days (logs expire after 7 days)
- **Refresh rate:** Web UI fetches logs every 30 seconds

## 6. Troubleshooting

### Logs not appearing?

1. Check Redis connection:
   ```bash
   curl https://ko4lax.dev/api/logs
   ```

2. Verify environment variables are set in Vercel

3. Check browser console for errors

4. Test from your VPS:
   ```bash
   curl -X POST https://ko4lax.dev/api/logs \
     -H "Content-Type: application/json" \
     -d '{"level":"info","message":"Test from VPS"}'
   ```

### CORS errors?

The API allows all origins. If you get CORS errors, check:
- The request includes `Content-Type: application/json` header
- You're using HTTPS (not HTTP)

## 7. Security Considerations

1. **Rate limiting:** Consider adding rate limiting to prevent spam
2. **Authentication:** For production, add API key authentication
3. **Validation:** The API validates log levels and required fields
4. **Sanitization:** Log messages should be sanitized to prevent XSS

## Next Steps

1. Set up Upstash Redis and add env vars to Vercel
2. Add the logging code to your OpenClaw bot
3. Test by triggering events in OpenClaw
4. Check the web UI to see logs appearing in real-time

---

**Questions?** The web UI auto-refreshes every 30 seconds to show new logs.
