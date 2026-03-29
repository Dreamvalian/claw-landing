import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

const DISCORD_API = "https://discord.com/api/v10"
const CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? ""
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? ""
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI ?? "http://localhost:3000/api/auth/discord/callback"

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

export interface Session {
  access_token: string
  refresh_token: string
  user: DiscordUser
  expires_at: number
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("discord_session")

  if (!sessionCookie) return null

  try {
    const session = JSON.parse(sessionCookie.value) as Session
    if (session.expires_at < Date.now()) {
      // Refresh token
      const refreshed = await refreshAccessToken(session.refresh_token)
      if (!refreshed) return null
      return refreshed
    }
    return session
  } catch {
    return null
  }
}

export async function exchangeCode(code: string): Promise<Session | null> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  })

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })

  if (!res.ok) return null

  const tokenData = await res.json()
  const userRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) return null

  const user = await userRes.json()

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    user: {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator || "0",
      avatar: user.avatar,
    },
    expires_at: Date.now() + tokenData.expires_in * 1000,
  }
}

async function refreshAccessToken(refresh_token: string): Promise<Session | null> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  })

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })

  if (!res.ok) return null

  const tokenData = await res.json()

  const userRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) return null

  const user = await userRes.json()

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    user: {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator || "0",
      avatar: user.avatar,
    },
    expires_at: Date.now() + tokenData.expires_in * 1000,
  }
}

export function getAvatarUrl(user: DiscordUser, size = 128): string {
  if (!user.avatar) {
    const defaultIndex = Number(user.id) >> 22n % 6n
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`
}
