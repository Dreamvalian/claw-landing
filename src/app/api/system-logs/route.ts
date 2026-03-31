import { NextRequest, NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200)
    const filter = searchParams.get("filter")

    let cutoff = 0
    const now = new Date()
    if (filter === "today") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    } else if (filter === "hour") {
      cutoff = now.getTime() - 3600 * 1000
    }

    // Try hermes:logs first, then claw:system:logs, then logs:heartbeat
    let logs: string[] = []
    const keys = ["hermes:logs", "claw:system:logs", "logs:heartbeat"]
    for (const key of keys) {
      try {
        logs = await redis.lrange(key, 0, limit - 1)
        if (logs.length > 0) break
      } catch {
        // try next key
      }
    }

    const parsed = logs
      .map((l, i) => {
        try {
          const obj = JSON.parse(l)
          return { ...obj, _index: i }
        } catch {
          // Plain string log line
          return { id: String(i), message: l, timestamp: new Date().toISOString(), _index: i }
        }
      })
      .filter((l) => {
        if (cutoff === 0) return true
        const ts = l.timestamp ? new Date(l.timestamp).getTime() : 0
        return ts >= cutoff
      })

    return NextResponse.json({ logs: parsed, total: parsed.length })
  } catch {
    return NextResponse.json({ logs: [], total: 0 })
  }
}
