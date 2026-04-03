# 🖤 Onyx — Landing Page & Dashboard

> *Terse. Direct. Always online.*

Personal landing page and admin dashboard for **Onyx** — a Discord-based AI assistant and original character built for [Koala](https://ko4lax.dev). Handles research, automation, coding, and everything in between.

**Live site → [ko4lax.dev](https://ko4lax.dev)**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗣️ **Natural Language** | Talk to Onyx like a teammate — no command prefixes |
| ⚡ **24/7 Availability** | Always online, always responsive |
| 🔒 **Privacy-First** | Self-hosted on your VPS, data never leaves your server |
| 🎭 **Original Character** | Onyx is Koala's OC — built with personality, not a generic AI wrapper |
| 🖥️ **Admin Dashboard** | Manage prompts, servers, cron jobs, and view live logs |

---

## 🛠️ Stack

- **[Next.js 14](https://nextjs.org)** — App Router, server components
- **[TypeScript](https://typescriptlang.org)** — type-safe throughout
- **[Tailwind CSS](https://tailwindcss.com)** — utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** — smooth animations
- **[shadcn/ui](https://ui.shadcn.com) + Radix** — accessible UI primitives
- **[Redis](https://redis.io)** (ioredis) — session & data caching
- **PM2** — process management on VPS
- **Let's Encrypt** — automatic SSL

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Discord OAuth (required for dashboard login)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DEPLOY_WEBHOOK_SECRET=your_webhook_secret_here

# Optional AI provider
ANTHROPIC_API_KEY=
```

```bash
# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

Self-hosted on a VPS. One-command deploy:

```bash
./deploy.sh
```

This will:
1. Pull the latest changes from `main`
2. Install dependencies
3. Build the Next.js app
4. Restart the PM2 process (`hermes-web`)

> Ensure PM2 is installed (`npm i -g pm2`) and the `hermes-web` process exists before first deploy.

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── about/            # About page
│   ├── contact/          # Contact page
│   ├── dashboard/        # Admin dashboard
│   │   ├── cron/         # Cron job manager
│   │   ├── logs/         # Live log viewer
│   │   ├── prompts/      # Prompt management
│   │   ├── servers/      # Server overview
│   │   └── settings/     # App settings
│   └── api/              # API routes
├── components/
│   ├── landing/          # Landing page sections
│   ├── dashboard/        # Dashboard UI
│   └── ui/               # shadcn/ui base components
└── lib/                  # Utilities & helpers
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
