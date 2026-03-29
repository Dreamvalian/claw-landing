import { NextRequest, NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get("key")

    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

    const value = await redis.get(`hermes:session:${key}`)
    return NextResponse.json({ value })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, value, ttl } = body

    if (!key || !value) {
      return NextResponse.json({ error: "key and value required" }, { status: 400 })
    }

    if (ttl) {
      await redis.setex(`hermes:session:${key}`, ttl, value)
    } else {
      await redis.set(`hermes:session:${key}`, value)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get("key")

    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

    await redis.del(`hermes:session:${key}`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
