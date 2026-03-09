"""
OpenClaw Web Logger - Send logs to your web dashboard
Add this to your OpenClaw bot on your VPS
"""

import requests
import json
from datetime import datetime
from typing import Optional
import os

# Configuration
WEB_LOGS_URL = "https://ko4lax.dev/api/logs"  # Your website API

class WebLogger:
    """Logger that sends logs to web dashboard"""
    
    def __init__(self, api_url: str = WEB_LOGS_URL):
        self.api_url = api_url
        self.enabled = True
    
    def send_log(self, level: str, message: str, source: str = "openclaw") -> bool:
        """
        Send a log entry to the web dashboard
        
        Args:
            level: "info", "warning", "error", or "success"
            message: The log message
            source: Source identifier (default: "openclaw")
        
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            return False
        
        # Validate level
        valid_levels = ["info", "warning", "error", "success"]
        level = level.lower()
        if level not in valid_levels:
            level = "info"
        
        payload = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "message": message,
            "source": source
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"[WebLogger] ✓ Log sent: [{level}] {message[:50]}...")
                return True
            else:
                print(f"[WebLogger] ✗ Failed: HTTP {response.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            print("[WebLogger] ✗ Timeout (5s)")
            return False
        except requests.exceptions.ConnectionError:
            print("[WebLogger] ✗ Connection failed")
            return False
        except Exception as e:
            print(f"[WebLogger] ✗ Error: {e}")
            return False
    
    # Convenience methods
    def info(self, message: str) -> bool:
        """Send info level log"""
        return self.send_log("info", message)
    
    def warning(self, message: str) -> bool:
        """Send warning level log"""
        return self.send_log("warning", message)
    
    def error(self, message: str) -> bool:
        """Send error level log"""
        return self.send_log("error", message)
    
    def success(self, message: str) -> bool:
        """Send success level log"""
        return self.send_log("success", message)


# Global logger instance (singleton)
_logger: Optional[WebLogger] = None

def get_logger() -> WebLogger:
    """Get or create the global logger instance"""
    global _logger
    if _logger is None:
        _logger = WebLogger()
    return _logger


# Simple function interface
def log_info(message: str) -> bool:
    """Send info log to web dashboard"""
    return get_logger().info(message)

def log_warning(message: str) -> bool:
    """Send warning log to web dashboard"""
    return get_logger().warning(message)

def log_error(message: str) -> bool:
    """Send error log to web dashboard"""
    return get_logger().error(message)

def log_success(message: str) -> bool:
    """Send success log to web dashboard"""
    return get_logger().success(message)


# Example usage and test
if __name__ == "__main__":
    print("Testing OpenClaw Web Logger...")
    print(f"Target: {WEB_LOGS_URL}")
    print("-" * 50)
    
    logger = get_logger()
    
    # Test all log levels
    logger.info("OpenClaw agent initialized")
    logger.success("Connected to MiniMax-M2.5 API")
    logger.warning("High memory usage detected: 78%")
    logger.error("Failed to fetch betting data - retrying...")
    
    print("-" * 50)
    print("Test complete! Check https://ko4lax.dev/ to see logs.")
