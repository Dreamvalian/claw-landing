"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Cpu,
  Clock,
  Workflow,
  Brain,
  Shield,
  MessageSquare,
  Terminal,
  BookOpen,
  TrendingUp,
  Zap,
  User,
} from "lucide-react"

const principles = [
  {
    icon: Zap,
    title: "Autonomous when safe",
    description: "Routine tasks execute without asking. Confirmation only when it matters.",
  },
  {
    icon: Shield,
    title: "Security-first",
    description: "Every message scanned. No leaks, no假设, no hallucinated permissions.",
  },
  {
    icon: MessageSquare,
    title: "Terse & direct",
    description: "No fluff. No \"Happy to help!\". Lead with the answer.",
  },
  {
    icon: Brain,
    title: "Accuracy over agreement",
    description: "Will challenge you if you're wrong. Evidence over validation.",
  },
]

const capabilities = [
  {
    icon: Search,
    title: "Research & Synthesis",
    description: "Web search, academic papers, documentation. Delivers findings, not just links.",
    tags: ["web", "arxiv", "blogs"],
  },
  {
    icon: Workflow,
    title: "Automation & Cron",
    description: "Scheduled tasks, Discord workflows, system operations. Runs while you sleep.",
    tags: ["cron", "discord", "api"],
  },
  {
    icon: Terminal,
    title: "Coding & Deploy",
    description: "Write, review, debug, deploy. Full stack from frontend to VPS infrastructure.",
    tags: ["next.js", "python", "nginx"],
  },
  {
    icon: BookOpen,
    title: "Knowledge Management",
    description: "Obsidian vault, session memory, cross-session context. Knows what you've worked on.",
    tags: ["obsidian", "memory"],
  },
  {
    icon: TrendingUp,
    title: "Opportunity Discovery",
    description: "Market analysis, trend mapping, monetization paths. Actively looks for angles.",
    tags: ["research", "strategy"],
  },
  {
    icon: Cpu,
    title: "AI Gateway Ops",
    description: "Multi-provider routing, cost tracking, model optimization. Keeps the stack running.",
    tags: ["vllm", "claude", "openai"],
  },
]

const stack = [
  { label: "Interface", value: "Discord" },
  { label: "Infrastructure", value: "Self-hosted VPS" },
  { label: "Frontend", value: "Next.js 14" },
  { label: "AI Gateway", value: "Custom Hermes" },
  { label: "Deployment", value: "PM2 + Nginx" },
  { label: "Uptime", value: "24/7" },
]

export default function AboutPage() {
  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-4">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100">
                <span className="text-6xl">🖤</span>
              </div>
              <div className="absolute inset-0 -z-10 rounded-full bg-neutral-900/20 blur-2xl dark:bg-neutral-100/20" />
            </div>
          </div>
          <Badge variant="secondary" className="mb-4">
            <User className="mr-1 h-3 w-3" />
            Koala&apos;s Original Character
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Meet{" "}
            <span className="text-neutral-900 dark:text-neutral-100">
              Onyx
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-500 dark:text-neutral-400 md:text-lg">
            Not a product. Not a startup. A 24/7 AI agent built around how one person works —
            with personality, memory, and a stake in the outcome.
          </p>
        </motion.div>

        {/* Origin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-16"
        >
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950 md:p-10">
            <div className="absolute -top-3 left-6 rounded-full bg-white px-3 dark:bg-neutral-950">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Origin
              </span>
            </div>
            <div className="mt-2 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold">The name</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  From the gemstone — dark, sharp, durable. Onyx doesn&apos;t try to be
                  impressive. It just works, precisely and without waste.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">The idea</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Most AI tools are generic. Onyx is specific — built for Koala, running on
                  Koala&apos;s infrastructure, optimizing for Koala&apos;s workflow. It&apos;s
                  an extension of how one person thinks, not a mass-market assistant.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              What Onyx Does
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Six operational areas, all interconnected
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <cap.icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{cap.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {cap.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cap.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              How Onyx Thinks
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Operational principles that shape every response
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900">
                  <p.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {p.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <h2 className="font-semibold">Technical Stack</h2>
            </div>
            <div className="grid gap-0 divide-y divide-neutral-200 dark:divide-neutral-800 md:grid-cols-2 md:divide-y-0">
              {stack.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-6 py-4 ${i % 2 === 1 ? "md:border-l border-neutral-200 dark:border-neutral-800" : ""}`}
                >
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-neutral-400">
            Created and operated by{" "}
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Koala
            </span>{" "}
            — designer, developer, and Onyx&apos;s only user.
          </p>
        </motion.div>

      </div>
    </main>
  )
}
