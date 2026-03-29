import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    const start = Date.now()
    await redis.ping()
    const latency = Date.now() - start

    const info = await redis.info("server")
    const uptime = info.match(/uptime_in_seconds:(\d+)/)?.[1]
    const uptimeFormatted = uptime
      ? `${Math.floor(Number(uptime) / 86400)}d ${Math.floor((Number(uptime) % 86400) / 3600)}h`
      : "—"

    return NextResponse.json({
      status: "connected",
      latency,
      uptime: uptimeFormatted,
      redis: "connected",
    })
  } catch {
    return NextResponse.json({ status: "disconnected", redis: "disconnected" }, { status: 500 })
  }
}
