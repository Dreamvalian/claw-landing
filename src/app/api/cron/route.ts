import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
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
  
  // Parse crontab and map to job info
  const jobConfigs = [
    { name: 'Heartbeat', script: 'heartbeat.sh', schedule: '*/30 * * * *' },
    { name: 'Cron Health', script: 'cron-health.sh', schedule: '15 */2 * * *' },
    { name: 'Morning Briefing', script: 'morning-briefing.sh', schedule: '0 2 * * *' },
    { name: 'Evening Review', script: 'evening-review.sh', schedule: '0 13 * * *' },
    { name: 'Security Audit', script: 'security-audit.sh', schedule: '0 6 * * *' },
    { name: 'Backup', script: 'backup-github.sh', schedule: '0 */6 * * *' },
    { name: 'Hyperspace Check', script: 'hyperspace-check.sh', schedule: '0 */12 * * *' },
    { name: 'UX Digest', script: 'ux-digest.sh', schedule: '0 16 * * *' },
    { name: 'Session Log', script: 'session-log.sh', schedule: '30 6 * * *' },
    { name: 'UI/UX Research', script: 'uiux-research-alarm.sh', schedule: '0 13 * * *' },
  ];
  
  for (const config of jobConfigs) {
    const logFile = `/root/.openclaw/logs/${config.script.replace('.sh', '')}.log`;
    let lastRun: string | null = null;
    let status = 'idle';
    
    if (existsSync(logFile)) {
      try {
        const content = readFileSync(logFile, 'utf8');
        const lines = content.trim().split('\n');
        if (lines.length > 0) {
          // Get last line timestamp
          const lastLine = lines[lines.length - 1];
          const match = lastLine.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
          if (match) {
            lastRun = match[1];
            // Check if recently modified (within 2x schedule)
            const fileStat = require('fs').statSync(logFile);
            const now = new Date();
            const fileMtime = new Date(fileStat.mtime);
            const diffMs = now.getTime() - fileMtime.getTime();
            const diffMinutes = diffMs / (1000 * 60);
            
            // Consider "running" if log was modified in last 5 minutes
            if (diffMinutes < 5) {
              status = 'running';
            } else {
              status = 'idle';
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }
    
    // Calculate next run (simplified)
    const nextRun = calculateNextRun(config.schedule);
    
    jobs.push({
      name: config.name,
      schedule: config.schedule,
      script: config.script,
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
    
    // Simple next run calculation
    if (minute === '*/30') {
      nextDate.setMinutes(now.getMinutes() < 30 ? 30 : 60);
    } else if (minute.startsWith('*/')) {
      const interval = parseInt(minute.replace('*/', ''));
      nextDate.setMinutes(Math.ceil(now.getMinutes() / interval) * interval);
    } else {
      nextDate.setMinutes(parseInt(minute));
    }
    
    if (nextDate <= now) {
      nextDate.setHours(nextDate.getHours() + 1);
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
      // Check gateway
      const gatewayCheck = execSync('pgrep -f "openclaw.*gateway" | head -1', { encoding: 'utf8' }).trim();
      systemStatus.gateway = gatewayCheck ? 'running' : 'stopped';
    } catch {
      systemStatus.gateway = 'stopped';
    }
    
    try {
      // Check hyperspace
      const hyperspaceCheck = execSync('hyperspace status 2>/dev/null | grep Status: | awk \'{print $2}\'', { encoding: 'utf8' }).trim();
      systemStatus.hyperspace = hyperspaceCheck || 'stopped';
    } catch {
      systemStatus.hyperspace = 'stopped';
    }
    
    try {
      // Check disk
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
