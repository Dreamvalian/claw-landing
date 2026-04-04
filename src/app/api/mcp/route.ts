import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface McpServer {
  name: string
  status: string
  transport: string
}

export async function GET() {
  try {
    const { execSync } = require("child_process")
    const env = { ...process.env, PATH: "/root/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" }
    const raw: Buffer = execSync("/root/.local/bin/hermes mcp list 2>&1", {
      maxBuffer: 10 * 1024 * 1024,
      encoding: "utf-8",
      env,
    })
    const output = raw.toString().trim()

    if (output.includes("No MCP servers configured")) {
      return NextResponse.json({ servers: [], count: 0 })
    }

    // Parse table output: name | status | transport
    const lines = output.split("\n")
    const servers: McpServer[] = []
    let parsing = false
    for (const line of lines) {
      if (line.includes("Name")) { parsing = true; continue }
      if (!parsing || !line.trim() || line.includes("Add one with")) break
      const cols = line.split("│").map((c: string) => c.trim()).filter(Boolean)
      if (cols.length >= 2) {
        servers.push({
          name: cols[0],
          status: cols[1] === "●" ? "running" : cols[1] ?? "unknown",
          transport: cols[2] ?? "—",
        })
      }
    }

    return NextResponse.json({ servers, count: servers.length })
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: err, servers: [] }, { status: 500 })
  }
}
