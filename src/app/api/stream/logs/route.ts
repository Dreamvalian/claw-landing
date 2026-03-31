import { NextResponse } from "next/server"
import Redis from "ioredis"

export const dynamic = "force-dynamic"

interface SystemLog {
  id: string
  command?: string
  response?: string
  message?: string
  timestamp: string
  server?: string
  _index: number
}

export async function GET() {
  const encoder = new TextEncoder()

  // Create a fresh Redis connection for this SSE stream
  const redis = new Redis({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? undefined,
    lazyConnect: false,
    connectTimeout: 3000,
    maxRetriesPerRequest: 2,
  })

  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      let intervalId: ReturnType<typeof setInterval>
      let heartbeatId: ReturnType<typeof setInterval>

      const keys = ["hermes:logs", "claw:system:logs", "logs:heartbeat"]

      const sendLogs = async () => {
        for (const key of keys) {
          try {
            const raw = await redis.lrange(key, 0, 49)
            if (raw.length > 0) {
              const results = raw.map((line: string, i: number) => {
                try {
                  return { ...JSON.parse(line), _index: i } as SystemLog
                } catch {
                  return { id: `log-${i}`, message: line, timestamp: new Date().toISOString(), _index: i }
                }
              })
              const payload = JSON.stringify({ type: "logs", logs: results })
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              return
            }
          } catch {
            // try next key
          }
        }
        // All keys empty — still send empty to confirm connection
        const payload = JSON.stringify({ type: "logs", logs: [] })
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
      }

      // Initial send
      sendLogs().then(() => {
        intervalId = setInterval(sendLogs, 5000)
      })

      // Heartbeat
      heartbeatId = setInterval(() => {
        if (closed) { clearInterval(heartbeatId); return }
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          closed = true
          clearInterval(heartbeatId)
          clearInterval(intervalId)
        }
      }, 15000)

      const cleanup = () => {
        closed = true
        clearInterval(intervalId)
        clearInterval(heartbeatId)
        redis.disconnect()
      }

      ;(controller as Record<string, unknown>)._cleanup = cleanup
    },
    cancel(controller) {
      const cleanup = (controller as Record<string, unknown>)._cleanup as (() => void) | undefined
      if (cleanup) cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
