import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface CronJob {
  id: string
  name: string
  schedule: string
  repeat: string
  next_run: string
  deliver: string
  last_run: string | null
  last_status: string | null
  enabled: boolean
}

export async function GET() {
  try {
    const { execSync } = require("child_process")
    const env = { ...process.env, PATH: "/root/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" }
    const raw: Buffer = execSync("/root/.local/bin/hermes cron list --all 2>/dev/null", {
      maxBuffer: 10 * 1024 * 1024,
      encoding: "buffer",
      env,
    })
    const output = raw.toString("utf-8")
    const lines = output.split("\n")

    const jobs: CronJob[] = []
    let i = 0

    // Process
    while (i < lines.length) {
      const trimmed = (lines[i] ?? "").trim()
      const bracketIdx = trimmed.lastIndexOf(" [")
      if (bracketIdx > 0) {
        const id = trimmed.slice(0, bracketIdx)
        const statusPart = trimmed.slice(bracketIdx + 2, -1)
        if (/^[0-9a-f]{7,8}$/.test(id) && (statusPart === "active" || statusPart === "paused")) {
          const _matched = true
          const enabled = statusPart === "active"
          i++
          // Collect fields until blank line
          const fields: Record<string, string> = {}
          while (i < lines.length) {
            const l = (lines[i] ?? "").trim()
            if (l === "") break
            // Check if next job
            const bi = l.lastIndexOf(" [")
            if (bi > 0 && /^[0-9a-f]{7,8}$/.test(l.slice(0, bi))) break
            if (l.startsWith("Name:")) fields["Name:"] = l.slice(5).trim()
            else if (l.startsWith("Schedule:")) fields["Schedule:"] = l.slice(9).trim()
            else if (l.startsWith("Repeat:")) fields["Repeat:"] = l.slice(7).trim()
            else if (l.startsWith("Next run:")) fields["Next run:"] = l.slice(9).trim()
            else if (l.startsWith("Deliver:")) fields["Deliver:"] = l.slice(8).trim()
            else if (l.startsWith("Last run:")) fields["Last run:"] = l.slice(9).trim()
            else if (l.startsWith("Last status:")) fields["Last status:"] = l.slice(12).trim()
            i++
          }
          jobs.push({
            id,
            name: fields["Name:"] ?? "",
            schedule: fields["Schedule:"] ?? "",
            repeat: fields["Repeat:"] ?? "",
            next_run: fields["Next run:"] ?? "",
            deliver: fields["Deliver:"] ?? "",
            last_run: fields["Last run:"] ?? null,
            last_status: fields["Last status:"] ?? null,
            enabled,
          })
          continue
        }
      }
      i++
    }

    return NextResponse.json({ jobs, count: jobs.length })
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: err, jobs: [] }, { status: 500 })
  }
}
