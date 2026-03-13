import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

interface CronJob {
  name: string;
  schedule: string;
  script: string;
  lastRun: string | null;
  nextRun: string | null;
  status: string;
}

function getCronJobs(): CronJob[] {
  const jobs: CronJob[] = [];
  
  // Get active crontab
  let crontab = '';
  try {
    crontab = execSync('crontab -l', { encoding: 'utf8' });
  } catch {
    crontab = '';
  }
  
  // Map script names to friendly names
  const nameMap: Record<string, string> = {
    'heartbeat.sh': 'Heartbeat',
    'cron-health.sh': 'Cron Health',
    'morning-briefing.sh': 'Morning Briefing',
    'evening-review.sh': 'Evening Review',
    'security-audit.sh': 'Security Audit',
    'backup-github.sh': 'Backup',
    'hyperspace-check.sh': 'Hyperspace Check',
    'ux-digest.sh': 'UX Digest',
    'session-log.sh': 'Session Log',
    'redis-log-summary.sh': 'Redis Log Summary',
  };
  
  // Parse crontab lines
  const lines = crontab.split('\n').filter(line => 
    line.trim() && !line.startsWith('#') && !line.startsWith('CRON') && !line.startsWith('TZ=')
  );
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;
    
    const schedule = parts.slice(0, 5).join(' ');
    const scriptMatch = line.match(/\/([^/]+\.sh)/);
    if (!scriptMatch) continue;
    
    const script = scriptMatch[1];
    const name = nameMap[script] || script.replace('.sh', '');
    
    // Get log file for last run
    const logFile = `/root/.openclaw/logs/${script.replace('.sh', '')}.log`;
    let lastRun: string | null = null;
    let status = 'idle';
    
    if (existsSync(logFile)) {
      try {
        const fs = require('fs');
        const content = fs.readFileSync(logFile, 'utf8');
        const fileStat = fs.statSync(logFile);
        const now = new Date();
        const diffMs = now.getTime() - fileStat.mtime.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        
        if (diffMinutes < 5) {
          status = 'running';
        }
        
        const lines = content.trim().split('\n');
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          const match = lastLine.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
          if (match) {
            lastRun = match[1];
          }
        }
      } catch {
        // Ignore
      }
    }
    
    // Calculate next run
    const nextRun = calculateNextRun(schedule);
    
    jobs.push({
      name,
      schedule,
      script,
      lastRun,
      nextRun,
      status,
    });
  }
  
  return jobs;
}

function calculateNextRun(schedule: string): string {
  try {
    const now = new Date();
    const parts = schedule.trim().split(/\s+/);
    
    if (parts.length !== 5) return 'N/A';
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    let nextDate = new Date(now);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    
    // Handle intervals
    if (minute.startsWith('*/')) {
      const interval = parseInt(minute.replace('*/', ''));
      const currentMinute = nextDate.getMinutes();
      const nextMinute = Math.ceil(currentMinute / interval) * interval;
      nextDate.setMinutes(nextMinute);
      if (nextMinute <= currentMinute) {
        nextDate.setHours(nextDate.getHours() + 1);
      }
    } else if (minute === '*') {
      nextDate.setMinutes(0);
      nextDate.setHours(nextDate.getHours() + 1);
    } else {
      nextDate.setMinutes(parseInt(minute));
      if (nextDate <= now) {
        nextDate.setHours(nextDate.getHours() + 1);
      }
    }
    
    // Handle hour intervals
    if (hour.startsWith('*/')) {
      const interval = parseInt(hour.replace('*/', ''));
      const currentHour = nextDate.getHours();
      const nextHour = Math.ceil(currentHour / interval) * interval;
      nextDate.setHours(nextHour);
      if (nextHour <= currentHour) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      nextDate.setMinutes(0);
    }
    
    return nextDate.toISOString().replace('T', ' ').substring(0, 16);
  } catch {
    return 'N/A';
  }
}

export async function GET() {
  try {
    const jobs = getCronJobs();
    
    // Get system status
    let systemStatus = {
      gateway: 'unknown',
      hyperspace: 'unknown',
      disk: 'unknown',
    };
    
    try {
      const gatewayCheck = execSync('pgrep -f "openclaw.*gateway" | head -1', { encoding: 'utf8' }).trim();
      systemStatus.gateway = gatewayCheck ? 'running' : 'stopped';
    } catch {
      systemStatus.gateway = 'stopped';
    }
    
    try {
      const hyperspaceCheck = execSync('hyperspace status 2>/dev/null | grep Status: | awk \'{print $2}\'', { encoding: 'utf8' }).trim();
      systemStatus.hyperspace = hyperspaceCheck || 'stopped';
    } catch {
      systemStatus.hyperspace = 'stopped';
    }
    
    try {
      const diskCheck = execSync('df / | tail -1 | awk \'{print $5}\'', { encoding: 'utf8' }).trim();
      systemStatus.disk = diskCheck;
    } catch {
      systemStatus.disk = 'unknown';
    }
    
    return NextResponse.json({
      jobs,
      system: systemStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    );
  }
}
