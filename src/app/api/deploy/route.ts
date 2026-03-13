export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Deploy endpoint working!' });
}

export async function POST(request: Request) {
  const { execSync } = await import('child_process');
  
  try {
    const body = await request.json();
    
    if (body.ref === 'refs/heads/main') {
      execSync('cd /root/.openclaw/landing/claw-landing && git pull origin main', { encoding: 'utf8' });
      execSync('cd /root/.openclaw/landing/claw-landing && npm install', { encoding: 'utf8' });
      execSync('cd /root/.openclaw/landing/claw-landing && npm run build', { encoding: 'utf8' });
      execSync('pm2 restart claw-landing', { encoding: 'utf8' });
      
      return NextResponse.json({ message: 'Deployed successfully!' });
    }
    
    return NextResponse.json({ message: 'Not a main branch push, skipped' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
