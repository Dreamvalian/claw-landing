import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const LOGS_KEY = "claw:system:logs";
const MAX_LOGS = 100; // Keep last 100 logs

// GET /api/logs - Retrieve system logs
export async function GET(request: NextRequest) {
  try {
    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Return mock data for development
      return NextResponse.json({
        logs: [
          { timestamp: new Date().toISOString(), level: "info", message: "System initialized (Redis not configured)" },
        ],
        warning: "Redis not configured. Using fallback.",
      });
    }

    // Get logs from Redis (stored as a list, newest first)
    const logs = await redis.lrange(LOGS_KEY, 0, MAX_LOGS - 1);

    return NextResponse.json({
      logs: logs || [],
      count: logs?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

// POST /api/logs - Add a new log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, timestamp, source = "openclaw" } = body;

    // Validate required fields
    if (!level || !message) {
      return NextResponse.json(
        { error: "Missing required fields: level, message" },
        { status: 400 }
      );
    }

    // Create log entry
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      level: level.toLowerCase(), // info, warning, error, success
      message,
      source,
    };

    // If Redis is not configured, just return success (for dev)
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log("[LOG]", logEntry);
      return NextResponse.json({
        success: true,
        log: logEntry,
        warning: "Redis not configured. Log logged to console only.",
      });
    }

    // Add log to Redis list (LPUSH adds to front)
    await redis.lpush(LOGS_KEY, JSON.stringify(logEntry));

    // Trim list to max size
    await redis.ltrim(LOGS_KEY, 0, MAX_LOGS - 1);

    // Set expiration (optional - logs expire after 7 days)
    await redis.expire(LOGS_KEY, 7 * 24 * 60 * 60);

    return NextResponse.json({
      success: true,
      log: logEntry,
    });
  } catch (error) {
    console.error("Error saving log:", error);
    return NextResponse.json(
      { error: "Failed to save log" },
      { status: 500 }
    );
  }
}

// DELETE /api/logs - Clear all logs (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check for admin token (simple protection)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
    }

    await redis.del(LOGS_KEY);

    return NextResponse.json({
      success: true,
      message: "All logs cleared",
    });
  } catch (error) {
    console.error("Error clearing logs:", error);
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 }
    );
  }
}
