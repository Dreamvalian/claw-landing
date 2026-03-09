import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get OpenClaw status
    const { execSync } = require('child_process');
    
    let status = {
      agent: 'unknown',
      uptime: 'unknown',
      version: 'unknown',
      model: 'unknown',
      sessionStatus: 'unknown'
    };

    try {
      // Get version
      const version = execSync('openclaw --version 2>/dev/null || echo "N/A"', { encoding: 'utf8' });
      status.version = version.trim();
    } catch (e) {}

    try {
      // Get agent status
      const agentStatus = execSync('openclaw status 2>/dev/null | head -20', { encoding: 'utf8' });
      if (agentStatus.includes('running') || agentStatus.includes('active')) {
        status.agent = 'online';
      } else if (agentStatus.includes('error') || agentStatus.includes('failed')) {
        status.agent = 'error';
      } else {
        status.agent = 'online';
      }
    } catch (e) {
      status.agent = 'offline';
    }

    // Get uptime
    try {
      const uptime = execSync('uptime -p 2>/dev/null || uptime 2>/dev/null', { encoding: 'utf8' });
      status.uptime = uptime.trim().replace('up ', '').replace(', load average', '');
    } catch (e) {}

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
