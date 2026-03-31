import { NextResponse } from "next/server"
import { readFile, readdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET() {
  try {
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

      // Skills from hermes and openclaw
      (async () => {
        try {
          const hermesHome = process.env.HERMES_HOME ?? "/root/.hermes"
          const openclawSkillsPath = "/root/.openclaw/workspace/skills"

          const hermesSkills = existsSync(join(hermesHome, "skills"))
            ? (await readdir(join(hermesHome, "skills")))
                .filter((n) => !n.startsWith("."))
                .map((n) => ({
                  name: n,
                  source: "hermes" as const,
                }))
            : []

          const openclawSkills = existsSync(openclawSkillsPath)
            ? (await readdir(openclawSkillsPath))
                .filter((n) => !n.startsWith("."))
                .map((n) => ({
                  name: n,
                  source: "openclaw" as const,
                }))
            : []

          return [...hermesSkills, ...openclawSkills]
        } catch {
          return []
        }
      })(),

      // Heartbeat from Redis
      (async () => {
        try {
          const { redis } = await import("@/lib/redis")
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
    const skillsResult = skills.status === "fulfilled" ? skills.value : []
    const heartbeatResult = heartbeat.status === "fulfilled" ? heartbeat.value : null

    // Hermes process uptime (from process uptime as proxy)
    const hermesUptimeSeconds = process.uptime()
    const hermesUptimeFormatted =
      hermesUptimeSeconds > 86400
        ? `${Math.floor(hermesUptimeSeconds / 86400)}d ${Math.floor((hermesUptimeSeconds % 86400) / 3600)}h`
        : hermesUptimeSeconds > 3600
        ? `${Math.floor(hermesUptimeSeconds / 3600)}h ${Math.floor((hermesUptimeSeconds % 3600) / 60)}m`
        : `${Math.floor(hermesUptimeSeconds / 60)}m`

    return NextResponse.json({
      uptime: uptimeResult.formatted,
      uptime_seconds: uptimeResult.seconds,
      hermes_uptime: hermesUptimeFormatted,
      model: configResult?.model ?? "—",
      provider: configResult?.provider ?? "—",
      toolsets: configResult?.toolsets ?? [],
      skills: skillsResult,
      cron_jobs: cronResult,
      heartbeat: heartbeatResult,
      now: new Date().toISOString(),
    })
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

function formatUptime(seconds: number): string {
  if (seconds > 86400) return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
  if (seconds > 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 60)}m`
}
