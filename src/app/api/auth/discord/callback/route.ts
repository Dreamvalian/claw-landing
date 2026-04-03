import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { exchangeCode } from "@/lib/discord-auth"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ko4lax.dev"
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.ko4lax.dev"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(new URL("/?auth_error=1", BASE_URL))
  }

  const session = await exchangeCode(code)

  if (!session) {
    return NextResponse.redirect(new URL("/?auth_error=1", BASE_URL))
  }

  const cookieStore = await cookies()
  // Set cookie on root domain so dashboard subdomain can read it
  cookieStore.set("discord_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    domain: ".ko4lax.dev",
  })

  // Redirect to dashboard subdomain
  return NextResponse.redirect(new URL("/", DASHBOARD_URL))
}
