import { NextRequest, NextResponse } from "next/server"
import { execSync } from "child_process"

const WEBHOOK_SECRET = process.env.DEPLOY_WEBHOOK_SECRET ?? ""

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { action } = await req.json().catch(() => ({}))

    if (action === "restart") {
      execSync("cd /root/claw-landing-new && npm run build 2>&1", { timeout: 120 })
      return NextResponse.json({ ok: true, action: "restart" })
    }

    if (action === "pull") {
      execSync("cd /root/claw-landing-new && git pull origin main 2>&1", { timeout: 60 })
      return NextResponse.json({ ok: true, action: "pull" })
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error }, { status: 500 })
  }
}
