import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    const [commandsToday, lastActive, servers] = await Promise.all([
      redis.get("hermes:metrics:commands_today"),
      redis.get("hermes:metrics:last_active"),
      redis.scard("hermes:servers"),
    ])

    const uptime = process.uptime()
    const uptimeFormatted =
      uptime > 86400
        ? `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h`
        : uptime > 3600
        ? `${Math.floor(uptime / 3600)}h`
        : `${Math.floor(uptime / 60)}m`

    const lastActiveFormatted = lastActive
      ? new Date(Number(lastActive)).toLocaleTimeString()
      : "—"

    return NextResponse.json({
      commandsToday: commandsToday ?? 0,
      lastActive: lastActiveFormatted,
      servers: servers ?? 0,
      uptime: uptimeFormatted,
    })
  } catch {
    return NextResponse.json({
      commandsToday: 0,
      lastActive: "—",
      servers: 0,
      uptime: "—",
    })
  }
}
