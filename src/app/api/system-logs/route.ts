import { NextRequest, NextResponse } from "next/server"
import { readFileSync, statSync, readdirSync } from "fs"
import { join } from "path"

export const dynamic = "force-dynamic"

interface SystemLog {
  id: string
  level: string
  source: string
  message: string
  timestamp: string
  _index: number
}

function parseLine(line: string, index: number): SystemLog | null {
  // Format: 2026-04-04 03:24:44,748 INFO discord.gateway: Shard ID None has successfully RESUMED session ...
  const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) (\w+)\s+(\S+):\s*(.*)$/)
  if (!match) return null
  const [, timestamp, level, source, message] = match
  return {
    id: `log-${index}`,
    level: level.toLowerCase(),
    source: source.replace(/"/g, ""),
    message,
    timestamp: timestamp.replace(",", ".") + "Z",
    _index: index,
  }
}

function getLogsFromFile(filePath: string, maxLines: number): SystemLog[] {
  try {
    const stats = statSync(filePath)
    const fileSize = stats.size
    // For large files, read last 100KB to get recent entries
    const readSize = Math.min(fileSize, 100 * 1024)
    const startPos = fileSize - readSize
    const fd = require("fs").openSync(filePath, "r")
    const buffer = Buffer.alloc(readSize)
    require("fs").readSync(fd, buffer, 0, readSize, startPos)
    require("fs").closeSync(fd)
    const content = buffer.toString("utf-8")
    // Skip potentially partial first line
    const lines = content.split("\n").slice(1)
    const logs: SystemLog[] = []
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim()
      if (!l) continue
      const parsed = parseLine(l, logs.length)
      if (parsed) logs.push(parsed)
      if (logs.length >= maxLines) break
    }
    return logs
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500)
    const filter = searchParams.get("filter") as "all" | "error" | null
    const hermesHome = process.env.HERMES_HOME ?? "/root/.hermes"
    const logsDir = join(hermesHome, "logs")

    let allLogs: SystemLog[] = []

    try {
      const files = readdirSync(logsDir)
      // Process in reverse mtime order (newest first)
      const fileStats = files
        .filter((f) => f.endsWith(".log"))
        .map((f) => ({
          name: f,
          mtimeMs: statSync(join(logsDir, f)).mtimeMs,
        }))
        .sort((a, b) => b.mtimeMs - a.mtimeMs)

      for (const { name } of fileStats) {
        const logs = getLogsFromFile(join(logsDir, name), limit)
        allLogs.push(...logs)
      }
    } catch { /* logs dir missing */ }

    // Deduplicate and sort by timestamp descending
    const seen = new Set<string>()
    allLogs = allLogs
      .filter((l) => {
        if (seen.has(l.timestamp + l.message)) return false
        seen.add(l.timestamp + l.message)
        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    // Apply level filter
    if (filter === "error") {
      allLogs = allLogs.filter((l) => l.level === "error" || l.level === "warning")
    }

    // Apply time filter
    const now = Date.now()
    const cutoffMap: Record<string, number> = {
      today: new Date(now).setHours(0, 0, 0, 0),
      hour: now - 3600 * 1000,
    }
    const cutoff = cutoffMap[filter ?? ""] ?? 0
    if (cutoff) {
      allLogs = allLogs.filter((l) => new Date(l.timestamp).getTime() >= cutoff)
    }

    return NextResponse.json({ logs: allLogs, total: allLogs.length })
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: err, logs: [], total: 0 }, { status: 500 })
  }
}
