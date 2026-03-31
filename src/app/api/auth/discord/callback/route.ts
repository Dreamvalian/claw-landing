import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { exchangeCode } from "@/lib/discord-auth"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ko4lax.dev"

  if (error || !code) {
    return NextResponse.redirect(new URL("/?auth_error=1", baseUrl))
  }

  const session = await exchangeCode(code)

  if (!session) {
    return NextResponse.redirect(new URL("/?auth_error=1", baseUrl))
  }

  const cookieStore = await cookies()
  cookieStore.set("discord_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return NextResponse.redirect(new URL("/dashboard", baseUrl))
}
