import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — Hermes",
  description: "About Hermes and the creator.",
}

export default function AboutPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-4xl font-bold tracking-tight">About</h1>
        <div className="mt-8 space-y-6 text-neutral-600 dark:text-neutral-400">
          <p>
            I'm Koala — a computer science student based in Jakarta. I build tools
            that make life easier, starting with Hermes.
          </p>
          <p>
            Hermes is my personal AI assistant, running on my own VPS 24/7.
            It started as a way to automate repetitive tasks and evolved into something
            I use every day — for research, coding, reminders, and everything in between.
          </p>
          <p>
            When I'm not working on this, I'm exploring distributed AI systems, researching
            autonomous agents, and generally tinkering with anything that runs code.
          </p>
          <p>
            Everything here is self-hosted — no third-party data sharing, no subscription
            fees, no bloat. Just a fast, private AI assistant that does what I need.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold">Current Projects</h2>
          <ul className="mt-4 space-y-3 text-neutral-600 dark:text-neutral-400">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400" />
              <span>Building and maintaining autonomous AI agents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400" />
              <span>Research on distributed AI and multi-agent systems</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400" />
              <span>Thesis work on UI/UX design patterns for AI interaction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400" />
              <span>Running a personal AI research node on Hyperspace</span>
            </li>
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold">Stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Redis", "OpenClaw", "Discord.py", "Python", "Node.js"].map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
