# Integrate OpenClaw with Web Dashboard

Your web backend is working! Now let's connect your OpenClaw bot on the VPS.

## Quick Test (Run on your VPS)

1. Copy `openclaw_logger.py` to your VPS:
```bash
scp openclaw_logger.py root@31.220.83.247:/root/openclaw/
```

2. SSH to your VPS and test:
```bash
ssh root@31.220.83.247
cd /root/openclaw
python3 openclaw_logger.py
```

3. Check https://ko4lax.dev/ - you should see 4 test logs!

## Integration Methods

### Method 1: Simple Function Calls (Easiest)

In your OpenClaw code, add:

```python
from openclaw_logger import log_info, log_warning, log_error, log_success

# In your bot code:
log_info("Agent started")
log_success("Analysis completed")
log_warning("Memory usage high")
log_error("API connection failed")
```

### Method 2: Discord.py Integration

If using discord.py, create a custom handler:

```python
import discord
from discord.ext import commands
from openclaw_logger import get_logger

logger = get_logger()

class OpenClawBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!")
        self.logger = logger
    
    async def on_ready(self):
        self.logger.success(f"Bot logged in as {self.user}")
    
    async def on_command(self, ctx):
        self.logger.info(f"Command executed: {ctx.command}")
    
    async def on_command_error(self, ctx, error):
        self.logger.error(f"Command error: {error}")

# Usage in commands
@commands.command()
async def analyze(ctx):
    bot.logger.info("Starting analysis...")
    try:
        # Your analysis code
        bot.logger.success("Analysis completed")
    except Exception as e:
        bot.logger.error(f"Analysis failed: {e}")
```

### Method 3: Modify Existing Discord Webhook

If you already send logs to Discord #system-log, add this:

```python
import requests
from datetime import datetime

WEB_LOGS_URL = "https://ko4lax.dev/api/logs"

def send_to_discord_and_web(level: str, message: str):
    # Send to Discord (your existing code)
    discord_webhook.send(message)
    
    # Also send to web dashboard
    try:
        requests.post(WEB_LOGS_URL, json={
            "level": level,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "openclaw"
        }, timeout=3)
    except:
        pass  # Don't fail if web is down
```

## Where to Add Logs in Your Bot

Add log calls at these key points:

```python
# 1. Startup
logger.success("OpenClaw agent initialized")
logger.info(f"Version: {VERSION}, Model: {MODEL}")

# 2. When cron jobs run
logger.info("Starting daily analysis...")
# ... do work ...
logger.success("Daily analysis completed")

# 3. API connections
logger.info("Connecting to MiniMax API...")
# ... connect ...
logger.success("Connected to MiniMax API")

# 4. Errors
try:
    fetch_data()
except Exception as e:
    logger.error(f"Failed to fetch data: {e}")

# 5. Warnings
if memory_usage > 80:
    logger.warning(f"High memory usage: {memory_usage}%")

# 6. Discord events
@bot.event
async def on_ready():
    logger.success("Discord bot connected")

@bot.event
async def on_disconnect():
    logger.warning("Discord bot disconnected")
```

## Testing Steps

1. **Start your bot** with logging added
2. **Trigger some events** (commands, errors, etc.)
3. **Check the web dashboard** - logs should appear within 30 seconds
4. **Refresh the page** to see new logs immediately

## Troubleshooting

### Logs not appearing?

1. **Test the logger directly:**
```bash
cd /root/openclaw
python3 -c "from openclaw_logger import log_info; log_info('Test')"
```

2. **Check if API is reachable from VPS:**
```bash
curl https://ko4lax.dev/api/logs
```

3. **Check your bot's console** for "[WebLogger]" messages

4. **Verify logs are being sent:**
Add this to your code:
```python
result = logger.info("Test message")
print(f"Log sent: {result}")  # Should print True
```

### Connection errors?

If you see "Connection failed" or "Timeout":
- Check internet connection on VPS
- Verify the URL is correct: `https://ko4lax.dev/api/logs`
- Try with curl from VPS

### Rate limiting?

The backend doesn't have rate limiting yet. If you send too many logs:
- Add delays between logs
- Batch multiple messages into one log entry

## Advanced: Auto-Log All Discord Messages

Send all #system-log channel messages to web:

```python
@bot.event
async def on_message(message):
    # Only log from system-log channel
    if message.channel.name == "system-log":
        # Determine level from message content
        content = message.content.lower()
        if "error" in content:
            level = "error"
        elif "warn" in content:
            level = "warning"
        elif "success" in content or "✓" in content:
            level = "success"
        else:
            level = "info"
        
        # Send to web
        logger.send_log(level, message.content)
    
    await bot.process_commands(message)
```

## Summary

1. Copy `openclaw_logger.py` to your VPS
2. Import it in your bot: `from openclaw_logger import log_info, log_error`
3. Add log calls throughout your code
4. Logs will automatically appear on https://ko4lax.dev/

The web dashboard refreshes every 30 seconds to show new logs.
