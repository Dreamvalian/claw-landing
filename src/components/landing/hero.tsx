"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight md:text-7xl">
            Your AI assistant,{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              always online.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-500 dark:text-neutral-400 md:mt-6 md:text-lg">
            Hermes lives in your Discord server — answers questions, runs automations,
            and handles tasks 24/7. No setup, no monthly fees.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 md:mt-8 md:flex-row md:gap-4">
            <a href="https://discord.com/oauth2/authorize" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full font-semibold md:w-auto">
                Add to Discord
              </Button>
            </a>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full font-semibold md:w-auto">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 md:mt-20 md:gap-6"
        >
          {[
            { label: "Uptime", value: "99.9%" },
            { label: "Servers", value: "∞" },
            { label: "Responses", value: "Instant" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
