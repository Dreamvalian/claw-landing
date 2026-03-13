import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

const LOGS_KEY = "claw:system:logs";
const MAX_LOGS = 100;

// GET /api/logs - Retrieve system logs
export async function GET() {
  try {
    // Get logs from Redis
    const logs = await redis.lrange(LOGS_KEY, 0, MAX_LOGS - 1);
    const parsedLogs = logs.map((log: string) => JSON.parse(log));
    
    return NextResponse.json({
      logs: parsedLogs,
      count: parsedLogs.length,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

// POST /api/logs - Add a new log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, source = "system" } = body;

    if (!level || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toLowerCase(),
      message,
      source,
    };

    // Add to Redis
    await redis.lpush(LOGS_KEY, JSON.stringify(logEntry));
    await redis.ltrim(LOGS_KEY, 0, MAX_LOGS - 1);

    return NextResponse.json({ success: true, log: logEntry });
  } catch (error) {
    console.error("Error saving log:", error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}

// DELETE /api/logs - Clear all logs
export async function DELETE(request: NextRequest) {
  try {
    await redis.del(LOGS_KEY);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear logs" }, { status: 500 });
  }
}
