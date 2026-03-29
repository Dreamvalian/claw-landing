import { NextRequest, NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    const prompts = await redis.hgetall("hermes:prompts")
    const list = Object.entries(prompts).map(([id, data]) => {
      try {
        const parsed = JSON.parse(data)
        return { id, ...parsed }
      } catch {
        return null
      }
    }).filter(Boolean)
    return NextResponse.json({ prompts: list })
  } catch {
    return NextResponse.json({ prompts: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, template } = body
    if (!name || !template) return NextResponse.json({ error: "name and template required" }, { status: 400 })

    const id = `prompt_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const prompt = { name, template, createdAt: new Date().toISOString() }
    await redis.hset("hermes:prompts", id, JSON.stringify(prompt))
    return NextResponse.json({ ok: true, id })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, template } = body
    if (!id || !name || !template) return NextResponse.json({ error: "id, name, template required" }, { status: 400 })

    const existing = await redis.hget("hermes:prompts", id)
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 })

    const parsed = JSON.parse(existing)
    const updated = { ...parsed, name, template }
    await redis.hset("hermes:prompts", id, JSON.stringify(updated))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    await redis.hdel("hermes:prompts", id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
