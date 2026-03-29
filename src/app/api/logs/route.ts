import { NextRequest, NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200)
    const filter = searchParams.get("filter")

    let cutoff = 0
    if (filter === "today") {
      const now = new Date()
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
    } else if (filter === "week") {
      cutoff = Date.now() / 1000 - 7 * 86400
    }

    const logs = await redis.lrange("hermes:logs", 0, limit - 1)
    const parsed = logs
      .map((l) => {
        try { return JSON.parse(l) }
        catch { return null }
      })
      .filter((l) => l && (cutoff === 0 || l.timestamp > cutoff))

    return NextResponse.json({ logs: parsed })
  } catch {
    return NextResponse.json({ logs: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { command, response, server } = body

    if (!command) {
      return NextResponse.json({ error: "command required" }, { status: 400 })
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      command,
      response: response ?? "",
      server: server ?? "unknown",
      timestamp: new Date().toISOString(),
    }

    await redis.lpush("hermes:logs", JSON.stringify(entry))
    await redis.ltrim("hermes:logs", 0, 999)
    await redis.incr("hermes:metrics:commands_today")
    await redis.set("hermes:metrics:last_active", Date.now().toString())

    return NextResponse.json({ ok: true, id: entry.id })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await redis.del("hermes:logs")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
