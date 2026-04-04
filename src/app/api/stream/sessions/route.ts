import { NextResponse } from "next/server"
import { readFile, readdir, stat } from "fs/promises"
import { join } from "path"
import { redis } from "@/lib/redis"

export const dynamic = "force-dynamic"

interface SessionData {
  session_key: string
  session_id: string
  display_name: string
  platform: string
  chat_type: string
  user_name: string
  chat_id: string
  created_at: string
  updated_at: string
  age_minutes: number
  is_cron: boolean
  is_current: boolean
  input_tokens: number
  output_tokens: number
  total_tokens: number
}

function getCronSessionsFromFiles(sessionsDir: string): SessionData[] {
  const now = Date.now()
  const cronSessions: SessionData[] = []
  try {
    const files = require("fs").readdirSync(sessionsDir)
    // newest per job_id
    const newestByJob: Record<string, { file: string; mtimeMs: number }> = {}
    for (const file of files) {
      if (!file.startsWith("session_cron_") || !file.endsWith(".json")) continue
      // session_cron_{job_id}_{timestamp}.json
      const parts = file.replace(/^session_cron_/, "").replace(/\.json$/, "")
      const lastSep = parts.lastIndexOf("_")
      const jobId = parts.slice(0, lastSep)
      const mtimeMs = require("fs").statSync(join(sessionsDir, file)).mtimeMs
      if (!newestByJob[jobId] || mtimeMs > newestByJob[jobId].mtimeMs) {
        newestByJob[jobId] = { file, mtimeMs }
      }
    }
    for (const [, { file }] of Object.entries(newestByJob)) {
      try {
        const content = require("fs").readFileSync(join(sessionsDir, file), "utf8")
        const c: Record<string, unknown> = JSON.parse(content)
        const updatedAt = new Date((c.last_updated as string) ?? (c.session_start as string)).getTime()
        const ageMinutes = Math.floor((now - updatedAt) / 60000)
        cronSessions.push({
          session_key: `cron:${c.session_id as string}`,
          session_id: c.session_id as string,
          display_name: `Cron: ${(c.session_id as string).split("_")[1] ?? "unknown"}`,
          platform: "cron",
          chat_type: "cron",
          user_name: "—",
          chat_id: "—",
          created_at: c.session_start as string,
          updated_at: c.last_updated as string ?? c.session_start as string,
          age_minutes: ageMinutes,
          is_cron: true,
          is_current: false,
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
        })
      } catch { /* skip bad files */ }
    }
  } catch { /* ignore dir errors */ }
  return cronSessions
}

function getSessionsFromDisk(): { active: SessionData[]; cron: SessionData[] } {
  const sessionsPath = join(process.env.HERMES_HOME ?? "/root/.hermes", "sessions/sessions.json")
  const sessionsDir = join(process.env.HERMES_HOME ?? "/root/.hermes", "sessions")
  let sessions: Record<string, unknown> = {}

  try {
    const content = require("fs").readFileSync(sessionsPath, "utf8")
    sessions = JSON.parse(content)
  } catch {
    return { active: [], cron: getCronSessionsFromFiles(sessionsDir) }
  }

  const now = Date.now()
  const cutoff5m = now - 5 * 60 * 1000   // active in last 5 min
  const cutoff1h = now - 60 * 60 * 1000    // stale after 1 hour no .jsonl update

  const sessionList: SessionData[] = Object.values(sessions).map((s: Record<string, unknown>) => {
    const origin = s.origin as Record<string, unknown> | null
    const updatedAt = new Date(s.updated_at as string).getTime()
    const ageMinutes = Math.floor((now - updatedAt) / 60000)
    const isCron = (s.display_name as string)?.toLowerCase().includes("cron") ?? false
    return {
      session_key: s.session_key as string,
      session_id: s.session_id as string,
      display_name: s.display_name ?? "Unknown",
      platform: s.platform ?? "—",
      chat_type: s.chat_type ?? "—",
      user_name: origin?.user_name ?? "—",
      chat_id: origin?.chat_id ?? "—",
      created_at: s.created_at as string,
      updated_at: s.updated_at as string,
      age_minutes: ageMinutes,
      is_cron: isCron,
      is_current: false, // will be set below after we check .jsonl files
      input_tokens: s.input_tokens ?? 0,
      output_tokens: s.output_tokens ?? 0,
      total_tokens: s.total_tokens ?? 0,
    }
  })

  // Separate cron vs user sessions
  const cronSessions = sessionList
    .filter((s) => s.is_cron)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)

  const userSessions = sessionList
    .filter((s) => !s.is_cron)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  // Also scan session_cron_*.json files
  const cronFromFiles = getCronSessionsFromFiles(sessionsDir)
  const allCron = [...cronSessions, ...cronFromFiles]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)

  // Mark current sessions: .jsonl file was updated in the last 5 minutes
  const currentSessions = new Set<string>()
  try {
    const files = require("fs").readdirSync(sessionsDir)
    for (const file of files) {
      if (!file.endsWith(".jsonl")) continue
      const sessionId = file.replace(/\.jsonl$/, "")
      const mtimeMs = require("fs").statSync(join(sessionsDir, file)).mtimeMs
      if (now - mtimeMs < cutoff5m) {
        // This session has recent activity
        const match = userSessions.find((s) => s.session_id === sessionId)
        if (match) currentSessions.add(match.session_key)
      }
    }
  } catch {
    // ignore
  }

  // Also mark sessions with updated_at within last 5 min as current (handles sessions
  // that have messages but .jsonl write lag)
  for (const s of userSessions) {
    const updatedAt = new Date(s.updated_at).getTime()
    if (now - updatedAt < cutoff5m) {
      currentSessions.add(s.session_key)
    }
  }

  const finalActive = userSessions.map((s) => ({
    ...s,
    is_current: currentSessions.has(s.session_key),
  }))

  return { active: finalActive, cron: allCron }
}

export async function GET() {
  const encoder = new TextEncoder()
  let isClosed = false

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data immediately
      const initial = getSessionsFromDisk()
      const data = `data: ${JSON.stringify({ type: "sessions", ...initial })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Subscribe to Redis channel for real-time session updates
      const subscriber = redis.duplicate()
      await subscriber.subscribe("hermes:sessions:changed")

      subscriber.on("message", async (_channel: string, message: string) => {
        if (isClosed) return
        try {
          const payload = JSON.parse(message)
          const data2 = `data: ${JSON.stringify({ type: "sessions", ...payload })}\n\n`
          controller.enqueue(encoder.encode(data2))
        } catch {
          // ignore parse errors
        }
      })

      // Heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeat)
          return
        }
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          clearInterval(heartbeat)
        }
      }, 15000)

      // Re-read disk every 5s — checks .jsonl mtimes to detect current sessions
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval)
          clearInterval(heartbeat)
          return
        }
        try {
          const latest = getSessionsFromDisk()
          const data3 = `data: ${JSON.stringify({ type: "sessions", ...latest })}\n\n`
          controller.enqueue(encoder.encode(data3))
        } catch {
          // ignore
        }
      }, 5000)

      // Cleanup on close
      const cleanup = () => {
        isClosed = true
        clearInterval(heartbeat)
        clearInterval(interval)
        subscriber.unsubscribe()
        subscriber.disconnect()
      }

      // Store cleanup for when controller closes
      ;(controller as Record<string, unknown>)._cleanup = cleanup
    },
    cancel(controller) {
      isClosed = true
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
