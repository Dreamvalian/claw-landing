"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ko4lax.dev"

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("discord_session")
  redirect(BASE_URL)
}
