import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

const SESSION_PREFIX = "claw:session:";

// Session storage (simple key-value for now)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const key = searchParams.get("key");

  try {
    // Session: Get session data
    if (action === "session" && key) {
      const sessionData = await redis.get(`${SESSION_PREFIX}${key}`);
      return NextResponse.json({ 
        session: sessionData ? JSON.parse(sessionData) : null 
      });
    }

    // Cache: Get cached value
    if (action === "cache" && key) {
      const cached = await redis.get(`claw:cache:${key}`);
      return NextResponse.json({ 
        cached: cached ? JSON.parse(cached) : null 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key, value, ttl = 3600 } = body;

    if (!key || !value) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const stringValue = JSON.stringify(value);

    // Session: Store session
    if (action === "session") {
      await redis.setex(`${SESSION_PREFIX}${key}`, ttl, stringValue);
      return NextResponse.json({ success: true, action: "session" });
    }

    // Cache: Store in cache
    if (action === "cache") {
      await redis.setex(`claw:cache:${key}`, ttl, stringValue);
      return NextResponse.json({ success: true, action: "cache" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to store" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const key = searchParams.get("key");

  try {
    if (action === "session" && key) {
      await redis.del(`${SESSION_PREFIX}${key}`);
    } else if (action === "cache" && key) {
      await redis.del(`claw:cache:${key}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
