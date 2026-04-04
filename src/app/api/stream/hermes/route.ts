import { NextResponse } from "next/server"
import { readFile, readdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { redis } from "@/lib/redis"

export const dynamic = "force-dynamic"

interface HermesData {
  uptime: string
  uptime_seconds: number
  hermes_uptime: string
  model: string
  provider: string
  toolsets: string[]
  skills: { name: string; type: "skill" | "plugin" }[]
  cron_jobs: CronJob[]
  heartbeat: Record<string, unknown> | null
  now: string
}

interface CronJob {
  id: string
  name: string
  schedule: string
  next_run: string
  last_run: string
  last_status: string
  enabled: boolean
}

function formatUptime(seconds: number): string {
  if (seconds > 86400) return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
  if (seconds > 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 60)}m`
}

async function getHermesData(): Promise<HermesData> {
  const [
    systemUptime,
    hermesConfig,
    cronJobs,
    skills,
    heartbeat,
  ] = await Promise.allSettled([
    // System uptime
    (async () => {
      try {
        const uptime = await readFile("/proc/uptime", "utf8")
        const seconds = parseFloat(uptime.split(" ")[0])
        return { seconds, formatted: formatUptime(seconds) }
      } catch {
        return { seconds: 0, formatted: "—" }
      }
    })(),

    // Hermes config (model, provider)
    (async () => {
      try {
        const configPath = join(process.env.HERMES_HOME ?? "/root/.hermes", "config.yaml")
        if (!existsSync(configPath)) return null
        const content = await readFile(configPath, "utf8")
        const model = content.match(/default:\s*(\S+)/)?.[1] ?? null
        const provider = content.match(/provider:\s*(\S+)/)?.[1] ?? null
        const toolsets = content.match(/toolsets:\s*\n((?:\s*-\s*\S+\n)*)/)?.[1]
          ?.split("\n")
          .map((l) => l.replace(/^\s*-\s*/, "").trim())
          .filter(Boolean) ?? []
        return { model, provider, toolsets }
      } catch {
        return null
      }
    })(),

    // Cron jobs
    (async () => {
      try {
        const jobsPath = join(process.env.HERMES_HOME ?? "/root/.hermes", "cron/jobs.json")
        if (!existsSync(jobsPath)) return []
        const content = await readFile(jobsPath, "utf8")
        const data = JSON.parse(content)
        return (data.jobs ?? []).map((j: Record<string, unknown>) => ({
          id: j.id,
          name: j.name,
          schedule: j.schedule_display ?? "",
          next_run: j.next_run_at,
          last_run: j.last_run_at,
          last_status: j.last_status,
          enabled: j.enabled,
        }))
      } catch {
        return []
      }
    })(),

    // Skills and Plugins from hermes
    (async () => {
      try {
        const hermesHome = process.env.HERMES_HOME ?? "/root/.hermes"
        const skillsDir = join(hermesHome, "skills")
        const pluginsDir = join(hermesHome, "plugins")

        const skills = existsSync(skillsDir)
          ? (await readdir(skillsDir))
              .filter((n) => !n.startsWith("."))
              .map((n) => ({ name: n, type: "skill" as const }))
          : []

        const plugins = existsSync(pluginsDir)
          ? (await readdir(pluginsDir))
              .filter((n) => !n.startsWith("."))
              .map((n) => ({ name: n, type: "plugin" as const }))
          : []

        return { skills, plugins }
      } catch {
        return { skills: [], plugins: [] }
      }
    })(),

    // Heartbeat from Redis
    (async () => {
      try {
        const raw = await redis.get("hermes:heartbeat")
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })(),
  ])

  const uptimeResult = systemUptime.status === "fulfilled" ? systemUptime.value : { seconds: 0, formatted: "—" }
  const configResult = hermesConfig.status === "fulfilled" ? hermesConfig.value : null
  const cronResult = cronJobs.status === "fulfilled" ? cronJobs.value : []
  const skillsData = skills.status === "fulfilled" ? skills.value : { skills: [], plugins: [] }
  const heartbeatResult = heartbeat.status === "fulfilled" ? heartbeat.value : null

  const hermesUptimeSeconds = process.uptime()
  const hermesUptimeFormatted =
    hermesUptimeSeconds > 86400
      ? `${Math.floor(hermesUptimeSeconds / 86400)}d ${Math.floor((hermesUptimeSeconds % 86400) / 3600)}h`
      : hermesUptimeSeconds > 3600
      ? `${Math.floor(hermesUptimeSeconds / 3600)}h ${Math.floor((hermesUptimeSeconds % 3600) / 60)}m`
      : `${Math.floor(hermesUptimeSeconds / 60)}m`

  return {
    uptime: uptimeResult.formatted,
    uptime_seconds: uptimeResult.seconds,
    hermes_uptime: hermesUptimeFormatted,
    model: configResult?.model ?? "—",
    provider: configResult?.provider ?? "—",
    toolsets: configResult?.toolsets ?? [],
    skills: skillsData.skills,
    plugins: skillsData.plugins,
    cron_jobs: cronResult,
    heartbeat: heartbeatResult,
    now: new Date().toISOString(),
  }
}

export async function GET() {
  const encoder = new TextEncoder()
  let isClosed = false

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data immediately
      const initial = await getHermesData()
      const data = `data: ${JSON.stringify({ type: "hermes", ...initial })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Redis subscriber for real-time hermes updates (model changes, skill changes)
      const subscriber = redis.duplicate()
      await subscriber.subscribe("hermes:changed")

      subscriber.on("message", async (_channel: string, _message: string) => {
        if (isClosed) return
        try {
          // When hermes publishes a change, re-read all data
          const latest = await getHermesData()
          const data2 = `data: ${JSON.stringify({ type: "hermes", ...latest })}\n\n`
          controller.enqueue(encoder.encode(data2))
        } catch {
          // ignore parse errors
        }
      })

      // Heartbeat every 15s
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

      // Re-read hermes data every 10s as fallback (uptime, model changes via config reload)
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval)
          clearInterval(heartbeat)
          return
        }
        try {
          const latest = await getHermesData()
          const data3 = `data: ${JSON.stringify({ type: "hermes", ...latest })}\n\n`
          controller.enqueue(encoder.encode(data3))
        } catch {
          // ignore
        }
      }, 10000)

      const cleanup = () => {
        isClosed = true
        clearInterval(heartbeat)
        clearInterval(interval)
        subscriber.unsubscribe()
        subscriber.disconnect()
      }

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
