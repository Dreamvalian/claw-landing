import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Github, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact — Hermes",
  description: "Get in touch.",
}

export default function ContactPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="text-4xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Have a question, feature request, or just want to say hi? Reach out through any of these channels.
        </p>

        <Separator className="my-8" />

        <div className="space-y-6">
          <a
            href="mailto:koala@example.com"
            className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <Mail className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-neutral-500">koala@example.com</p>
            </div>
          </a>

          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <MessageSquare className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="font-medium">Discord</p>
              <p className="text-sm text-neutral-500">Join the server</p>
            </div>
          </a>

          <a
            href="https://github.com/dreamvalian"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <Github className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="font-medium">GitHub</p>
              <p className="text-sm text-neutral-500">@dreamvalian</p>
            </div>
          </a>
        </div>

        <Separator className="my-8" />

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-medium">Prefer a direct message?</p>
          <p className="mt-1 text-sm text-neutral-500">
            Send me an email or message on Discord. I typically respond within 24–48 hours.
          </p>
          <a href="mailto:koala@example.com">
            <Button className="mt-4">Send an email</Button>
          </a>
        </div>
      </div>
    </div>
  )
}
