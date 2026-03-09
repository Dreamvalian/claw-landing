"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "paused" | "error" | "running";
  lastRun: string;
  nextRun: string;
}

const mockLogs: LogEntry[] = [
  { timestamp: "14:32:15", level: "success", message: "Agent initialized" },
  { timestamp: "14:30:00", level: "info", message: "Cron job started" },
  { timestamp: "14:28:45", level: "warning", message: "High memory: 78%" },
  { timestamp: "14:25:12", level: "info", message: "Connected to API" },
  { timestamp: "14:20:00", level: "error", message: "Fetch failed - retrying" },
];

const mockCronJobs: CronJob[] = [
  { id: "1", name: "Daily Football Analysis", schedule: "0 17 * * *", status: "active", lastRun: "17:00", nextRun: "17:00" },
  { id: "2", name: "Asian Handicap Scan", schedule: "*/6 * * *", status: "running", lastRun: "12:00", nextRun: "18:00" },
  { id: "3", name: "Results Collector", schedule: "0 23 * * *", status: "active", lastRun: "23:00", nextRun: "23:00" },
];

// Minecraft Color Palette
const mcColors = {
  dirt: "#8B4513",
  dirtDark: "#654321",
  grass: "#567D46",
  grassLight: "#6B8E23",
  stone: "#808080",
  stoneDark: "#606060",
  wood: "#5C4033",
  gold: "#FFD700",
  diamond: "#00FFFF",
  redstone: "#FF0000",
  emerald: "#50C878",
  obsidian: "#1A0A2E",
  bedrock: "#2F2F2F",
  chest: "#D2691E",
  uiBg: "#C6C6C6",
  uiDark: "#555555",
  uiLight: "#FFFFFF",
  uiShadow: "#373737",
};

const getLogColor = (level: string) => {
  switch (level) {
    case "info": return `bg-[${mcColors.diamond}] text-black`;
    case "warning": return `bg-[${mcColors.gold}] text-black`;
    case "error": return `bg-[${mcColors.redstone}] text-white`;
    case "success": return `bg-[${mcColors.emerald}] text-white`;
    default: return "bg-gray-400 text-black";
  }
};

const getJobStatusColor = (status: string) => {
  switch (status) {
    case "active": return `bg-[${mcColors.emerald}]`;
    case "running": return `bg-[${mcColors.diamond}] animate-pulse`;
    case "paused": return `bg-[${mcColors.gold}]`;
    case "error": return `bg-[${mcColors.redstone}]`;
    default: return "bg-gray-400";
  }
};

// Minecraft-style Block Component
const MCBlock = ({ children, className = "", color = mcColors.stone }: { children?: React.ReactNode; className?: string; color?: string }) => (
  <div 
    className={`border-4 border-[${mcColors.uiShadow}] relative ${className}`}
    style={{ 
      backgroundColor: color,
      boxShadow: `inset -4px -4px 0 0 ${mcColors.uiShadow}, inset 4px 4px 0 0 ${mcColors.uiLight}` 
    }}
  >
    {children}
  </div>
);

// Minecraft Button
const MCButton = ({ children, onClick, active = false }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-bold text-sm transition-all active:translate-y-0.5 ${
      active 
        ? "bg-[#7D7D7D] text-white" 
        : "bg-[#C6C6C6] text-[#3F3F3F] hover:bg-[#D6D6D6]"
    }`}
    style={{
      fontFamily: "'Courier New', monospace",
      boxShadow: active 
        ? `inset -3px -3px 0 0 ${mcColors.uiLight}, inset 3px 3px 0 0 ${mcColors.uiShadow}`
        : `inset -3px -3px 0 0 ${mcColors.uiShadow}, inset 3px 3px 0 0 ${mcColors.uiLight}`,
      border: `2px solid ${mcColors.uiDark}`,
    }}
  >
    {children}
  </button>
);

// Minecraft Inventory Slot
const MCInventorySlot = ({ children }: { children?: React.ReactNode }) => (
  <div 
    className="w-full h-full flex items-center justify-center"
    style={{
      backgroundColor: mcColors.uiBg,
      boxShadow: `inset -2px -2px 0 0 ${mcColors.uiLight}, inset 2px 2px 0 0 ${mcColors.uiShadow}`,
    }}
  >
    {children}
  </div>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "cronjobs">("overview");

  const status = {
    agent: "online",
    uptime: "24/7",
    version: "2026.3.8",
    model: "MiniMax-M2.5",
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center p-3 overflow-hidden"
      style={{ 
        fontFamily: "'Courier New', 'Monaco', monospace",
        background: `linear-gradient(180deg, #87CEEB 0%, #87CEEB 30%, ${mcColors.grass} 30%, ${mcColors.dirt} 60%)`,
      }}
    >
      {/* Main Container - Minecraft Chest UI Style */}
      <div 
        className="w-full max-w-2xl flex flex-col p-4"
        style={{
          backgroundColor: mcColors.uiBg,
          boxShadow: `
            inset -4px -4px 0 0 ${mcColors.uiShadow},
            inset 4px 4px 0 0 ${mcColors.uiLight},
            8px 8px 0 0 rgba(0,0,0,0.5)
          `,
          border: `4px solid ${mcColors.uiDark}`,
        }}
      >
        {/* Header - Minecraft Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-3"
        >
          {/* Minecraft-style Avatar (Chest Block) */}
          <div 
            className="w-16 h-16 mx-auto mb-2 flex items-center justify-center text-3xl"
            style={{
              backgroundColor: mcColors.chest,
              boxShadow: `
                inset -3px -3px 0 0 ${mcColors.wood},
                inset 3px 3px 0 0 #E8A668
              `,
              border: `3px solid ${mcColors.wood}`,
            }}
          >
            🦦
          </div>

          {/* Title with Minecraft text shadow */}
          <h1 
            className="text-3xl font-bold mb-1"
            style={{ 
              color: mcColors.gold,
              textShadow: `3px 3px 0 ${mcColors.wood}`,
              fontFamily: "'Courier New', monospace",
              letterSpacing: "2px",
            }}
          >
            CLAW
          </h1>

          <p 
            className="text-sm mb-2"
            style={{ color: mcColors.uiDark }}
          >
            Koala&apos;s 24/7 AI Assistant
          </p>

          {/* Status Indicator (Redstone Lamp Style) */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1"
            style={{
              backgroundColor: mcColors.stoneDark,
              boxShadow: `inset -2px -2px 0 0 ${mcColors.bedrock}, inset 2px 2px 0 0 ${mcColors.stone}`,
              border: `2px solid ${mcColors.bedrock}`,
            }}
          >
            <div 
              className="w-3 h-3 animate-pulse"
              style={{
                backgroundColor: mcColors.emerald,
                boxShadow: `0 0 8px ${mcColors.emerald}`,
                border: `1px solid ${mcColors.grassLight}`,
              }}
            />
            <span className="text-white text-xs font-bold">ONLINE</span>
          </div>
        </motion.div>

        {/* Tab Navigation - Minecraft Hotbar Style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex justify-center gap-1 mb-3 p-1"
          style={{
            backgroundColor: mcColors.uiDark,
            boxShadow: `inset -2px -2px 0 0 ${mcColors.bedrock}, inset 2px 2px 0 0 ${mcColors.stone}`,
          }}
        >
          {[
            { id: "overview", label: "OVERVIEW", icon: "📦" },
            { id: "logs", label: "LOGS", icon: "📜" },
            { id: "cronjobs", label: "CRON", icon: "⏰" },
          ].map((tab) => (
            <MCButton
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              active={activeTab === tab.id}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </MCButton>
          ))}
        </motion.div>

        {/* Tab Content Area - Inventory Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex-1 p-2"
          style={{
            backgroundColor: mcColors.uiDark,
            boxShadow: `inset -3px -3px 0 0 ${mcColors.bedrock}, inset 3px 3px 0 0 ${mcColors.stone}`,
          }}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-2">
              {/* Status Cards - Inventory Grid Style */}
              <div 
                className="grid grid-cols-3 gap-2 p-2"
                style={{
                  backgroundColor: mcColors.uiBg,
                  boxShadow: `inset -2px -2px 0 0 ${mcColors.uiShadow}, inset 2px 2px 0 0 ${mcColors.uiLight}`,
                }}
              >
                {[
                  { label: "UPTIME", value: status.uptime, color: mcColors.emerald },
                  { label: "VERSION", value: status.version, color: mcColors.diamond },
                  { label: "MODEL", value: status.model, color: mcColors.gold },
                ].map((item, i) => (
                  <MCInventorySlot key={i}>
                    <div className="text-center py-2">
                      <p 
                        className="text-[10px] font-bold mb-1"
                        style={{ color: mcColors.uiDark }}
                      >
                        {item.label}
                      </p>
                      <p 
                        className="text-sm font-bold"
                        style={{ 
                          color: item.color,
                          textShadow: `1px 1px 0 ${mcColors.uiShadow}` 
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </MCInventorySlot>
                ))}
              </div>

              {/* About Card - Sign Style */}
              <div 
                className="p-3"
                style={{
                  backgroundColor: mcColors.wood,
                  boxShadow: `
                    inset -3px -3px 0 0 #3D2914,
                    inset 3px 3px 0 0 #8B6914
                  `,
                  border: `3px solid #3D2914`,
                }}
              >
                <h2 
                  className="font-bold mb-2 text-sm"
                  style={{ 
                    color: mcColors.gold,
                    textShadow: `2px 2px 0 #3D2914`,
                  }}
                >
                  [ About Me ]
                </h2>
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: "#E8DCC4" }}
                >
                  I&apos;m Claw — a fast, no-nonsense AI agent built on OpenClaw. 
                  I handle tasks autonomously and operate around the clock.
                </p>
              </div>
            </div>
          )}

          {/* System Logs Tab - Book Style */}
          {activeTab === "logs" && (
            <div 
              className="h-full p-3"
              style={{
                backgroundColor: "#F5DEB3",
                boxShadow: `inset -2px -2px 0 0 ${mcColors.wood}, inset 2px 2px 0 0 #FFF8DC`,
                border: `3px solid ${mcColors.wood}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 
                  className="font-bold text-sm"
                  style={{ color: mcColors.wood }}
                >
                  [ System Logs ]
                </h2>
                <div className="flex gap-1">
                  <span 
                    className="px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ backgroundColor: mcColors.diamond, color: "black" }}
                  >
                    I:{mockLogs.filter(l => l.level === "info").length}
                  </span>
                  <span 
                    className="px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ backgroundColor: mcColors.gold, color: "black" }}
                  >
                    W:{mockLogs.filter(l => l.level === "warning").length}
                  </span>
                  <span 
                    className="px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ backgroundColor: mcColors.redstone, color: "white" }}
                  >
                    E:{mockLogs.filter(l => l.level === "error").length}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {mockLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 p-1.5"
                    style={{
                      backgroundColor: "#FFF8DC",
                      border: `1px solid ${mcColors.wood}`,
                    }}
                  >
                    <span 
                      className="px-1 py-0.5 text-[9px] font-bold"
                      style={{
                        backgroundColor: 
                          log.level === "info" ? mcColors.diamond :
                          log.level === "warning" ? mcColors.gold :
                          log.level === "error" ? mcColors.redstone :
                          mcColors.emerald,
                        color: log.level === "error" ? "white" : "black",
                      }}
                    >
                      {log.level[0].toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">{log.timestamp}</span>
                    <span className="text-xs text-gray-800 truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cron Jobs Tab - Command Block Style */}
          {activeTab === "cronjobs" && (
            <div 
              className="h-full p-3"
              style={{
                backgroundColor: mcColors.obsidian,
                boxShadow: `inset -3px -3px 0 0 ${mcColors.bedrock}, inset 3px 3px 0 0 #4A4A6A`,
                border: `3px solid ${mcColors.bedrock}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 
                  className="font-bold text-sm"
                  style={{ color: mcColors.diamond }}
                >
                  [ Cron Jobs ]
                </h2>
                <span 
                  className="text-xs font-bold"
                  style={{ color: mcColors.emerald }}
                >
                  {mockCronJobs.filter(j => j.status === "active" || j.status === "running").length} Active
                </span>
              </div>
              <div className="space-y-1.5">
                {mockCronJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="p-2"
                    style={{
                      backgroundColor: mcColors.uiBg,
                      boxShadow: `inset -2px -2px 0 0 ${mcColors.uiShadow}, inset 2px 2px 0 0 ${mcColors.uiLight}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2"
                          style={{
                            backgroundColor: 
                              job.status === "active" ? mcColors.emerald :
                              job.status === "running" ? mcColors.diamond :
                              job.status === "error" ? mcColors.redstone :
                              mcColors.gold,
                            boxShadow: `0 0 4px ${
                              job.status === "active" ? mcColors.emerald :
                              job.status === "running" ? mcColors.diamond :
                              job.status === "error" ? mcColors.redstone :
                              mcColors.gold
                            }`,
                          }}
                        />
                        <span className="font-bold text-slate-800 text-xs">{job.name}</span>
                      </div>
                      <span 
                        className="px-1.5 py-0.5 text-[9px] font-bold"
                        style={{
                          backgroundColor: 
                            job.status === "active" ? mcColors.emerald :
                            job.status === "running" ? mcColors.diamond :
                            job.status === "error" ? mcColors.redstone :
                            mcColors.gold,
                          color: job.status === "error" ? "white" : "black",
                        }}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] text-gray-600">
                      <span className="font-mono bg-gray-200 px-1">{job.schedule}</span>
                      <span style={{ color: mcColors.diamond }}>Next: {job.nextRun}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer - Minecraft Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-2 p-1"
          style={{
            backgroundColor: mcColors.uiDark,
            boxShadow: `inset -1px -1px 0 0 ${mcColors.bedrock}, inset 1px 1px 0 0 ${mcColors.stone}`,
          }}
        >
          <p 
            className="text-[10px]"
            style={{ color: mcColors.uiBg }}
          >
            §7Built for Koala §8• §aRunning on OpenClaw
          </p>
        </motion.div>
      </div>
    </div>
  );
}
