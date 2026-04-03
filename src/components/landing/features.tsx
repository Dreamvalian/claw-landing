"use client"

import { motion } from "framer-motion"
import { MessageSquare, Zap, Shield, Sparkles } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Natural Language",
    description:
      "Talk to Onyx like a teammate. No special syntax or command prefixes to remember.",
  },
  {
    icon: Zap,
    title: "24/7 Availability",
    description:
      "Always online, always responsive. Handles requests while you sleep.",
  },
  {
    icon: Shield,
    title: "Privacy-First",
    description:
      "Runs on your own VPS. Your data never touches third-party servers.",
  },
  {
    icon: Sparkles,
    title: "Original Character",
    description:
      "Onyx is Koala's OC — built with personality, not a generic AI wrapper.",
  },
]

export function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            More than a bot
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500 dark:text-neutral-400">
            Onyx is an original character with a distinct voice and work style.
            Built to be useful, not just impressive.
          </p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-12 grid gap-6 md:grid-cols-2"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <feature.icon className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
