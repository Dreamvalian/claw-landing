import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const sessionsPath = join(process.env.HERMES_HOME ?? "/root/.hermes", "sessions/sessions.json")

    let sessions: Record<string, unknown> = {}
    try {
      const content = await readFile(sessionsPath, "utf8")
      sessions = JSON.parse(content)
    } catch {
      return NextResponse.json({ sessions: [], total: 0 })
    }

    const now = Date.now()
    const sessionList = Object.values(sessions).map((s: Record<string, unknown>) => {
      const origin = s.origin as Record<string, unknown> | null
      const updatedAt = new Date(s.updated_at as string).getTime()
      const ageMinutes = Math.floor((now - updatedAt) / 60000)
      const isCron = (s.display_name as string)?.toLowerCase().includes("cron") ?? false
      return {
        session_key: s.session_key,
        session_id: s.session_id,
        display_name: s.display_name ?? "Unknown",
        platform: s.platform ?? "—",
        chat_type: s.chat_type ?? "—",
        user_name: origin?.user_name ?? "—",
        chat_id: origin?.chat_id ?? "—",
        created_at: s.created_at,
        updated_at: s.updated_at,
        age_minutes: ageMinutes,
        is_cron: isCron,
        input_tokens: s.input_tokens ?? 0,
        output_tokens: s.output_tokens ?? 0,
        total_tokens: s.total_tokens ?? 0,
      }
    })

    // Active (non-cron) sessions sorted by most recently updated
    const activeSessions = sessionList
      .filter((s) => !s.is_cron)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 20)

    // Cron sessions
    const cronSessions = sessionList
      .filter((s) => s.is_cron)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)

    return NextResponse.json({
      active: activeSessions,
      cron: cronSessions,
      total: sessionList.length,
    })
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
