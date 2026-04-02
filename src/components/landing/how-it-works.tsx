"use client"

import { motion } from "framer-motion"
import { Plus, Settings, Check } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Invite the Bot",
    description:
      "Add Hermes to your Discord server with a single click. Takes under a minute.",
    icon: Plus,
  },
  {
    number: "02",
    title: "Configure",
    description:
      "Set up your preferences, connect your tools, and teach Hermes how you work.",
    icon: Settings,
  },
  {
    number: "03",
    title: "Done",
    description:
      "Start chatting. Hermes handles the rest — from questions to complex automations.",
    icon: Check,
  },
]

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Up and running in minutes
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <step.icon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Step {step.number}
              </p>
              <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
