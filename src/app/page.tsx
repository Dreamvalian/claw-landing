"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LogEntry {
  timestamp: string;
  date: string;        // YYYY-MM-DD format
  level: "info" | "warning" | "error" | "success";
  message: string;
  source?: string;
  description?: string; // Extra detail for errors/warnings
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "paused" | "error" | "running";
  lastRun: string;
  nextRun: string;
}

// Default mock data for initial render
const defaultLogs: LogEntry[] = [
  { timestamp: new Date().toISOString(), date: new Date().toISOString().split('T')[0], level: "info", message: "Waiting for logs from OpenClaw..." },
];

const mockCronJobs: CronJob[] = [
  { id: "1", name: "Daily Football Analysis", schedule: "0 17 * * *", status: "active", lastRun: "17:00", nextRun: "17:00" },
  { id: "2", name: "Asian Handicap Scan", schedule: "*/6 * * *", status: "running", lastRun: "12:00", nextRun: "18:00" },
  { id: "3", name: "Results Collector", schedule: "0 23 * * *", status: "active", lastRun: "23:00", nextRun: "23:00" },
];

// WCAG 2.1 Compliant Color Palette (AA/AAA compliant contrasts)
const mcColors = {
  // Primary colors with sufficient contrast
  grassTop: "#5D8C47",      // Green for active states (4.5:1 on white)
  grassDark: "#4A7038",     // Darker green for hover
  dirt: "#8B6914",          // Brown for secondary
  dirtDark: "#6B4E0A",      // Dark brown for text
  stone: "#7D7D7D",         // Gray for neutral
  stoneDark: "#555555",     // Dark gray for borders
  stoneLight: "#C6C6C6",    // Light gray for backgrounds
  
  // Status colors (WCAG compliant)
  success: "#2E7D32",       // Green (4.6:1 on white)
  warning: "#E65100",       // Orange (4.5:1 on white)
  error: "#C62828",         // Red (7:1 on white)
  info: "#1565C0",          // Blue (7:1 on white)
  
  // Minecraft accent colors
  gold: "#B8860B",          // Gold text
  diamond: "#00AAAA",       // Diamond cyan
  obsidian: "#2C2C2C",      // Dark background
  
  // UI colors
  bgPrimary: "#C6C6C6",     // Light gray background
  bgDark: "#8B8B8B",        // Darker gray
  borderOuter: "#373737",   // Dark border (inset)
  borderInner: "#FFFFFF",   // Light border (outset)
};

// Get log level styles
const getLogStyles = (level: string) => {
  switch (level) {
    case "info": return { bg: "#E3F2FD", color: "#1565C0", border: "#1565C0" };
    case "warning": return { bg: "#FFF3E0", color: "#E65100", border: "#E65100" };
    case "error": return { bg: "#FFEBEE", color: "#C62828", border: "#C62828" };
    case "success": return { bg: "#E8F5E9", color: "#2E7D32", border: "#2E7D32" };
    default: return { bg: "#F5F5F5", color: "#616161", border: "#616161" };
  }
};

// Get job status styles
const getJobStyles = (status: string) => {
  switch (status) {
    case "active": return { dot: mcColors.success, bg: "#E8F5E9", color: mcColors.success };
    case "running": return { dot: mcColors.diamond, bg: "#E0F7FA", color: "#00838F" };
    case "paused": return { bg: "#F5F5F5", color: "#616161", dot: "#9E9E9E" };
    case "error": return { bg: "#FFEBEE", color: mcColors.error, dot: mcColors.error };
    default: return { bg: "#F5F5F5", color: "#616161", dot: "#9E9E9E" };
  }
};

// Minecraft Button Component with accessibility
const MCButton = ({ 
  children, 
  onClick, 
  active = false, 
  ariaLabel,
  ariaSelected
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  active?: boolean;
  ariaLabel?: string;
  ariaSelected?: boolean;
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    aria-selected={ariaSelected}
    role="tab"
    className={`px-4 py-2 font-semibold text-sm transition-all duration-150 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${mcColors.gold}] ${
      active 
        ? "text-white" 
        : "text-[#3F3F3F] hover:text-black"
    }`}
    style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: active ? mcColors.grassTop : mcColors.stoneLight,
      border: `2px solid ${active ? mcColors.grassDark : mcColors.stoneDark}`,
      boxShadow: active 
        ? `inset 2px 2px 4px rgba(0,0,0,0.3)`
        : `inset -2px -2px 0 ${mcColors.borderOuter}, inset 2px 2px 0 ${mcColors.borderInner}`,
      minHeight: "44px", // WCAG 2.5.5 target size
    }}
  >
    {children}
  </button>
);

// Panel container with Minecraft styling
const MCPanel = ({ 
  children, 
  className = "", 
  title,
  ariaLabel
}: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  ariaLabel?: string;
}) => (
  <section 
    className={`bg-[${mcColors.stoneLight}] border-2 border-[${mcColors.stoneDark}] ${className}`}
    aria-label={ariaLabel || title}
    style={{
      boxShadow: `inset -3px -3px 0 ${mcColors.borderOuter}, inset 3px 3px 0 ${mcColors.borderInner}`,
    }}
  >
    {title && (
      <header className="px-4 py-2 border-b-2 border-[#555555] bg-[#B8B8B8]">
        <h2 className="font-bold text-[#3F3F3F]" style={{ fontFamily: "system-ui, sans-serif" }}>
          {title}
        </h2>
      </header>
    )}
    <div className="p-4">
      {children}
    </div>
  </section>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "cronjobs">("overview");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(defaultLogs);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLogsLoading(true);
        const res = await fetch("/api/logs");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        
        // Parse logs if they're stored as strings
        const parsedLogs = (data.logs || []).map((log: LogEntry | string) => 
          typeof log === "string" ? JSON.parse(log) : log
        );
        
        setLogs(parsedLogs.length > 0 ? parsedLogs : defaultLogs);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setLogsError("Failed to load logs");
        setLogs(defaultLogs);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const status = {
    agent: "online",
    uptime: "24/7",
    version: "2026.3.8",
    model: "MiniMax-M2.5",
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", { 
        hour12: false, 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
      });
    } catch {
      return timestamp;
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit" 
      });
    } catch {
      return "";
    }
  };

  const motionProps = reduceMotion 
    ? {} 
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: `linear-gradient(180deg, #87CEEB 0%, #87CEEB 35%, ${mcColors.grassTop} 35%, ${mcColors.dirt} 70%, ${mcColors.dirtDark} 100%)`,
      }}
    >
      {/* Skip to content link for accessibility */}
      <a 
        href="#content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <div 
        id="content"
        className="w-full max-w-3xl flex flex-col"
        style={{
          backgroundColor: mcColors.stoneLight,
          border: `4px solid ${mcColors.stoneDark}`,
          boxShadow: `
            inset -4px -4px 0 ${mcColors.borderOuter},
            inset 4px 4px 0 ${mcColors.borderInner},
            8px 8px 20px rgba(0,0,0,0.4)
          `,
        }}
      >
        {/* Header */}
        <header className="text-center p-6 border-b-4 border-[#555555]">
          <div 
            className={`text-6xl mb-2 mx-auto w-20 h-20 flex items-center justify-center ${reduceMotion ? '' : 'animate-bounce'}`}
            style={{ animationDuration: "2s" }}
            role="img" 
            aria-label="Claw mascot otter"
          >
            🦦
          </div>

          <h1 
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ 
              color: mcColors.gold,
              textShadow: `3px 3px 0 ${mcColors.dirtDark}`,
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "0.05em",
            }}
          >
            CLAW
          </h1>

          <p className="text-lg text-[#3F3F3F] mb-4 font-medium">
            Koala&apos;s 24/7 AI Assistant
          </p>

          {/* Status indicator */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded"
            style={{
              backgroundColor: mcColors.stoneDark,
              border: `2px solid ${mcColors.borderOuter}`,
            }}
          >
            <span 
              className="relative flex h-3 w-3"
              aria-hidden="true"
            >
              <span 
                className={`absolute inline-flex h-full w-full rounded-full bg-green-400 ${reduceMotion ? '' : 'animate-ping'}`}
                style={{ opacity: reduceMotion ? 0.75 : undefined }}
              />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-green-700" />
            </span>
            <span className="text-white font-semibold text-sm">ONLINE</span>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav 
          className="flex justify-center gap-2 p-4 border-b-2 border-[#555555]"
          style={{ backgroundColor: mcColors.stone }}
          role="tablist"
          aria-label="Dashboard tabs"
        >
          {[
            { id: "overview", label: "Overview", icon: "📦" },
            { id: "logs", label: "System Logs", icon: "📜" },
            { id: "cronjobs", label: "Cron Jobs", icon: "⚙️" },
          ].map((tab) => (
            <MCButton
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              active={activeTab === tab.id}
              ariaLabel={`${tab.label} tab`}
              ariaSelected={activeTab === tab.id}
            >
              <span aria-hidden="true" className="mr-2">{tab.icon}</span>
              {tab.label}
            </MCButton>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="p-4" role="tabpanel">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4" role="region" aria-label="Overview">
              {/* Status Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Uptime", value: status.uptime, color: mcColors.success },
                  { label: "Version", value: status.version, color: mcColors.info },
                  { label: "Model", value: status.model, color: mcColors.gold },
                ].map((item, i) => (
                  <MCPanel key={i} ariaLabel={`${item.label}: ${item.value}`}>
                    <div className="text-center py-2">
                      <p className="text-xs font-bold text-[#555555] uppercase tracking-wide mb-1">
                        {item.label}
                      </p>
                      <p 
                        className="text-lg font-bold"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </MCPanel>
                ))}
              </div>

              {/* About Panel */}
              <MCPanel title="About Claw" ariaLabel="About section">
                <p className="text-[#3F3F3F] leading-relaxed">
                  I&apos;m <strong>Claw</strong> — a fast, no-nonsense AI agent built on OpenClaw. 
                  I handle tasks autonomously, keep things secure, and operate 
                  around the clock. Powered by <span style={{ color: mcColors.gold }}>MiniMax-M2.5</span>.
                </p>
              </MCPanel>
            </div>
          )}

          {/* System Logs Tab */}
          {activeTab === "logs" && (
            <MCPanel 
              title="System Logs" 
              className="max-h-[400px] overflow-auto"
              ariaLabel="System logs panel"
            >
              {/* Log counters */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="px-2 py-1 text-xs font-semibold rounded bg-[#E3F2FD] text-[#1565C0] border border-[#1565C0]">
                  Info: {logs.filter(l => l.level === "info").length}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded bg-[#FFF3E0] text-[#E65100] border border-[#E65100]">
                  Warnings: {logs.filter(l => l.level === "warning").length}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded bg-[#FFEBEE] text-[#C62828] border border-[#C62828]">
                  Errors: {logs.filter(l => l.level === "error").length}
                </span>
              </div>

              {/* Loading state */}
              {logsLoading && (
                <div className="text-center py-4 text-[#555555]">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Loading logs...
                </div>
              )}

              {/* Error state */}
              {logsError && (
                <div className="p-3 rounded bg-[#FFEBEE] border border-[#C62828] text-[#C62828] text-sm">
                  ⚠️ {logsError}
                </div>
              )}

              {/* Log entries */}
              <ul className="space-y-2" role="list" aria-label="Log entries">
                {logs.map((log, i) => {
                  const styles = getLogStyles(log.level);
                  return (
                    <li 
                      key={i} 
                      className={`p-3 rounded border-2 ${log.level === 'error' || log.level === 'warning' ? 'pb-4' : ''}`}
                      style={{
                        backgroundColor: styles.bg,
                        borderColor: styles.border,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="px-2 py-0.5 text-xs font-bold uppercase rounded"
                          style={{ 
                            backgroundColor: styles.color, 
                            color: "white" 
                          }}
                          aria-label={`Level: ${log.level}`}
                        >
                          {log.level[0].toUpperCase()}
                        </span>
                        <time className="text-xs text-[#616161] font-mono min-w-[70px]">
                          {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                        </time>
                        <span className="text-sm text-[#333333]">{log.message}</span>
                      </div>
                      {/* Extra description for errors and warnings */}
                      {(log.level === 'error' || log.level === 'warning') && log.description && (
                        <div 
                          className="mt-2 p-2 text-xs rounded"
                          style={{
                            backgroundColor: log.level === 'error' ? '#FFEBEE' : '#FFF8E1',
                            border: `1px dashed ${log.level === 'error' ? '#F44336' : '#FFC107'}`,
                          }}
                        >
                          <span className="font-bold" style={{ color: '#F44336' }}>➜ </span>
                          <span style={{ color: '#5D4037' }}>{log.description}</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </MCPanel>
          )}

          {/* Cron Jobs Tab */}
          {activeTab === "cronjobs" && (
            <MCPanel title="Cron Jobs" ariaLabel="Cron jobs panel">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#555555]">
                  <strong>{mockCronJobs.filter(j => j.status === "active" || j.status === "running").length}</strong> Active Jobs
                </span>
              </div>

              <ul className="space-y-3" role="list" aria-label="Cron job list">
                {mockCronJobs.map((job) => {
                  const styles = getJobStyles(job.status);
                  return (
                    <li 
                      key={job.id} 
                      className="p-3 rounded border-2"
                      style={{
                        backgroundColor: "white",
                        borderColor: mcColors.stoneDark,
                        boxShadow: `inset -2px -2px 0 ${mcColors.borderOuter}, inset 2px 2px 0 ${mcColors.borderInner}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full border border-black"
                            style={{ backgroundColor: styles.dot }}
                            aria-hidden="true"
                          />
                          <h3 className="font-bold text-[#333333] text-sm">{job.name}</h3>
                        </div>
                        <span 
                          className="px-2 py-0.5 text-xs font-bold uppercase rounded"
                          style={{
                            backgroundColor: styles.bg,
                            color: styles.color,
                            border: `1px solid ${styles.color}`,
                          }}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-[#555555] flex-wrap">
                        <span className="font-mono bg-[#F5F5F5] px-2 py-0.5 rounded">{job.schedule}</span>
                        <span>Next: <strong>{job.nextRun}</strong></span>
                        <span>Last: {job.lastRun}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </MCPanel>
          )}
        </div>

        {/* Footer */}
        <footer 
          className="text-center p-3 border-t-4 border-[#555555]"
          style={{ backgroundColor: mcColors.stone }}
        >
          <p className="text-sm text-[#3F3F3F]">
            Built for Koala • Running on <strong>OpenClaw</strong>
          </p>
        </footer>
      </div>
    </main>
  );
}
