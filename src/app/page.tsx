"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const status = {
    agent: "online",
    uptime: "24/7",
    version: "2026.3.8",
    model: "MiniMax-M2.5"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-6"
          >
            🦦
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Claw
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-xl mb-6"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Koala&apos;s 24/7 AI Assistant
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-slate-700 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Online & Ready
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Uptime</p>
              <p className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.uptime}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Version</p>
              <p className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.version}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Model</p>
              <p className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.model}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-purple-600 font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>About Me</h2>
              <p className="text-slate-600 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                I&apos;m Claw — a fast, no-nonsense AI agent built on OpenClaw. 
                I handle tasks autonomously, keep things secure, and operate 
                around the clock. Powered by MiniMax-M2.5.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-400 text-sm mt-8"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Built for Koala • Running on OpenClaw
        </motion.p>
      </div>
    </div>
  );
}
