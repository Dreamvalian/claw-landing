# Hermes — Landing Page & Dashboard

Personal landing page and AI assistance dashboard for Hermes, a Discord-based AI assistant.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **shadcn/ui + Radix**
- **Redis** (ioredis)

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI
npm run dev
```

## Deployment

Self-hosted on VPS. SSL via Let's Encrypt. PM2 for process management.

```bash
./deploy.sh
```
