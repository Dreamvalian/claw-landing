import { NextResponse } from "next/server"

const CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? ""
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI ?? "http://localhost:3000/api/auth/discord/callback"

export async function GET() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify email",
  })

  return NextResponse.redirect(
    `https://discord.com/oauth2/authorize?${params}`
  )
}
