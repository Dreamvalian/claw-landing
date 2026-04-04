import { NextResponse } from "next/server"
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
    const readSize = Math.min(fileSize, 100 * 1024)
    const startPos = fileSize - readSize
    const fd = require("fs").openSync(filePath, "r")
    const buffer = Buffer.alloc(readSize)
    require("fs").readSync(fd, buffer, 0, readSize, startPos)
    require("fs").closeSync(fd)
    const content = buffer.toString("utf-8")
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

export async function GET() {
  const hermesHome = process.env.HERMES_HOME ?? "/root/.hermes"
  const logsDir = join(hermesHome, "logs")

  try {
    let allLogs: SystemLog[] = []
    try {
      const files = readdirSync(logsDir)
      const fileStats = files
        .filter((f) => f.endsWith(".log"))
        .map((f) => ({
          name: f,
          mtimeMs: statSync(join(logsDir, f)).mtimeMs,
        }))
        .sort((a, b) => b.mtimeMs - a.mtimeMs)

      for (const { name } of fileStats) {
        const logs = getLogsFromFile(join(logsDir, name), 50)
        allLogs.push(...logs)
      }
    } catch { /* ignore */ }

    const seen = new Set<string>()
    allLogs = allLogs
      .filter((l) => {
        if (seen.has(l.timestamp + l.message)) return false
        seen.add(l.timestamp + l.message)
        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)

    return NextResponse.json({ type: "logs", logs: allLogs })
  } catch {
    return NextResponse.json({ type: "logs", logs: [] }, { status: 500 })
  }
}
