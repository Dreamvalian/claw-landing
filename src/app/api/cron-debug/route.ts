import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { execSync } = require("child_process")
    const env = { ...process.env, PATH: "/root/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" }
    
    // Test 1: basic echo
    const test1 = execSync("echo 'hello'", { env, encoding: "utf8" })
    
    // Test 2: which hermes
    const test2 = execSync("which hermes || echo 'not found'", { env, encoding: "utf8" })
    
    // Test 3: hermes cron list
    const raw: Buffer = execSync("/root/.local/bin/hermes cron list --all 2>/dev/null", {
      maxBuffer: 10 * 1024 * 1024,
      encoding: "buffer",
      env,
    })
    const test3 = raw.toString("utf-8").slice(0, 300)
    
    return NextResponse.json({ test1: test1.trim(), test2: test2.trim(), test3 })
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: err })
  }
}
