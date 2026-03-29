import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    const start = Date.now()
    await redis.ping()
    const latency = Date.now() - start

    const memoryUsage = process.memoryUsage()
    const memUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const memTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024)

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      redis: { connected: true, latency },
      memory: { used: memUsed, total: memTotal },
      uptime: process.uptime(),
    }

    // Store heartbeat in Redis
    await redis.setex("hermes:heartbeat", 3600, JSON.stringify(health))

    return NextResponse.json(health)
  } catch {
    return NextResponse.json({ status: "error", redis: { connected: false } }, { status: 500 })
  }
}
