"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Terminal, 
  Clock,
  HardDrive, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Zap,
  Server,
  Calendar,
  ChevronRight,
  RefreshCw,
  Menu,
  X,
  Home as HomeIcon,
  Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  source?: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "paused" | "error" | "running";
  lastRun: string;
  nextRun: string;
}

type View = "dashboard" | "logs" | "cronjobs";

const defaultLogs: LogEntry[] = [
  { timestamp: new Date().toISOString(), level: "info", message: "System initialized. Waiting for OpenClaw..." },
];

const cronJobs: CronJob[] = [
  { id: "1", name: "Daily Football Analysis", schedule: "0 17 * * *", status: "active", lastRun: "17:00", nextRun: "17:00" },
  { id: "2", name: "Asian Handicap Scan", schedule: "*/6 * * *", status: "running", lastRun: "12:00", nextRun: "18:00" },
  { id: "3", name: "Results Collector", schedule: "0 23 * * *", status: "active", lastRun: "23:00", nextRun: "23:00" },
];

const getLogIcon = (level: string) => {
  switch (level) {
    case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "error": return <AlertCircle className="w-4 h-4 text-rose-500" />;
    case "warning": return <AlertCircle className="w-4 h-4 text-amber-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getLogBorder = (level: string) => {
  switch (level) {
    case "success": return "border-l-emerald-500";
    case "error": return "border-l-rose-500";
    case "warning": return "border-l-amber-500";
    default: return "border-l-blue-500";
  }
};

const getJobBadge = (status: string) => {
  switch (status) {
    case "active": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">Active</Badge>;
    case "running": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 animate-pulse">Running</Badge>;
    case "paused": return <Badge variant="secondary">Paused</Badge>;
    case "error": return <Badge variant="destructive">Error</Badge>;
    default: return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(defaultLogs);
  const [logsLoading, setLogsLoading] = useState(true);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [cronLoading, setCronLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({ gateway: 'unknown', hyperspace: 'unknown', disk: 'unknown' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLogsLoading(true);
        const res = await fetch("/api/logs");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        const parsedLogs = (data.logs || []).map((log: LogEntry | string) => 
          typeof log === "string" ? JSON.parse(log) : log
        );
        setLogs(parsedLogs.length > 0 ? parsedLogs : defaultLogs);
      } catch {
        setLogs(defaultLogs);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch system status
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const res = await fetch("/api/cron");
        const data = await res.json();
        if (data.system) {
          setSystemStatus(data.system);
        }
      } catch (err) {
        console.error("Error fetching system status:", err);
      }
    };

    fetchSystemStatus();
    const sysInterval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(sysInterval);
  }, []);

  // Fetch cron jobs
  useEffect(() => {
    const fetchCronJobs = async () => {
      try {
        setCronLoading(true);
        const res = await fetch("/api/cron");
        if (!res.ok) throw new Error("Failed to fetch cron");
        const data = await res.json();
        
        const mappedJobs = (data.jobs || []).map((job: any, index: number) => ({
          id: String(index + 1),
          name: job.name,
          schedule: job.schedule,
          status: job.status === 'running' ? 'running' : 'idle',
          lastRun: job.lastRun || 'Never',
          nextRun: job.nextRun || 'N/A',
        }));
        
        setCronJobs(mappedJobs);
      } catch (err) {
        console.error("Error fetching cron jobs:", err);
      } finally {
        setCronLoading(false);
      }
    };

    fetchCronJobs();
    const cronInterval = setInterval(fetchCronJobs, 60000);
    return () => clearInterval(cronInterval);
  }, []);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return timestamp;
    }
  };

  const stats = {
    uptime: "24/7",
    version: "2026.3.12",
    model: "MiniMax-M2.5",
    status: systemStatus.gateway === 'running' ? 'online' : 'offline',
    tasksCompleted: 1284,
    activeJobs: cronJobs.length,
    gateway: systemStatus.gateway || 'unknown',
    hyperspace: systemStatus.hyperspace || 'unknown',
    disk: systemStatus.disk || 'unknown',
    heartbeat: "active",
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        if (isMobile) setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeView === view 
          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200" 
          : "hover:bg-gray-100 text-gray-600"
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
      <span className="font-medium">{label}</span>
      {activeView === view && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? (isMobile ? 280 : 280) : 0 }}
        className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden ${isMobile ? "fixed h-full z-50" : "relative h-screen sticky top-0"}`}
      >
        <div className="p-6 brutal-border">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <span className="text-2xl">🐨</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Koala</h1>
              <p className="text-xs text-gray-500">Assistance Hub</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavItem view="dashboard" icon={HomeIcon} label="Dashboard" />
            <NavItem view="logs" icon={Terminal} label="System Logs" />
            <NavItem view="cronjobs" icon={Calendar} label="Cron Jobs" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">System Online</span>
              </div>
              <p className="text-xs text-gray-600">Claw AI Assistant v{stats.version}</p>
            </CardContent>
          </Card>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeView === "dashboard" && "Dashboard"}
                  {activeView === "logs" && "System Logs"}
                  {activeView === "cronjobs" && "Cron Jobs"}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">Online</span>
              </div>
              <Avatar className="w-10 h-10 border-2 border-violet-100">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
                  KO
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 brutal-border">
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Welcome Card */}
                <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <CardContent className="relative p-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-violet-200" />
                          <span className="text-violet-100 text-sm font-medium">AI Assistant</span>
                        </div>
                        <h3 className="text-3xl font-bold">Welcome back, Koala</h3>
                        <p className="text-violet-100 max-w-md">
                          Your AI assistant is running smoothly. All systems operational and ready to help.
                        </p>
                      </div>
                      <div className="hidden sm:block text-right">
                        <div className="text-5xl font-bold">🦦</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Gateway", value: stats.gateway, icon: Server, color: stats.gateway === 'running' ? "text-emerald-600" : "text-red-600", bg: stats.gateway === 'running' ? "bg-emerald-50" : "bg-red-50" },
                    { label: "Hyperspace", value: stats.hyperspace, icon: Zap, color: stats.hyperspace === 'RUNNING' ? "text-emerald-600" : "text-red-600", bg: stats.hyperspace === 'RUNNING' ? "bg-emerald-50" : "bg-red-50" },
                    { label: "Disk", value: stats.disk, icon: HardDrive, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Clock,
  HardDrive, color: "text-amber-600", bg: "bg-amber-50" },
                  ].map((stat, i) => (
                    <Card key={i} className="brutal-card">
                      <CardContent className="p-6 brutal-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-violet-600" />
                      About Claw
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      <strong>Claw</strong> is your dedicated AI assistant built on OpenClaw. 
                      Designed to handle tasks autonomously, maintain security, and operate 
                      24/7 without interruption. Powered by <span className="text-violet-600 font-medium">MiniMax-M2.5</span>.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-violet-50 text-violet-700">Autonomous</Badge>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Secure</Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">24/7 Operation</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeView === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Info:</span>{" "}
                      <span className="font-medium text-gray-900">{logs.filter(l => l.level === "info").length}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Warnings:</span>{" "}
                      <span className="font-medium text-amber-600">{logs.filter(l => l.level === "warning").length}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Errors:</span>{" "}
                      <span className="font-medium text-rose-600">{logs.filter(l => l.level === "error").length}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <Card>
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-2">
                      {logsLoading && (
                        <div className="text-center py-8 text-gray-500">Loading logs...</div>
                      )}
                      {logs.map((log, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100 border-l-4 ${getLogBorder(log.level)} hover:shadow-sm transition-shadow`}
                        >
                          {getLogIcon(log.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-gray-400">{formatTime(log.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{log.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>
            )}

            {activeView === "cronjobs" && (
              <motion.div
                key="cronjobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{stats.activeJobs}</span> active scheduled tasks
                  </p>
                </div>

                <div className="grid gap-4">
                  {cronJobs.map((job) => (
                    <Card key={job.id} className="brutal-card">
                      <CardContent className="p-6 brutal-border">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{job.name}</h3>
                              {getJobBadge(job.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{job.schedule}</span>
                              <span>Last: {job.lastRun}</span>
                              <span>Next: {job.nextRun}</span>
                            </div>
                          </div>
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
