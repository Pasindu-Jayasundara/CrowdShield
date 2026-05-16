# CrowdShield

Real-time cyber threat intelligence web application with AI-powered analysis, community validation, and analyst tools.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Motion (animations)
- Recharts (analytics)
- Lucide React (icons)

## Quick start

```bash
cd crowdshield
npm install
npm run dev
```

Open http://localhost:5173

## Routes

### Public
- `/` — Landing page
- `/feed` — Live threat feed
- `/submit` — Report a scam (AI analysis)
- `/near-me` — Location-based threats
- `/pricing` — Subscription & demo access

### Analyst (demo via Pricing page)
- `/analyst` — Dashboard
- `/analyst/geo` — Geo intelligence map
- `/analyst/campaigns` — Campaign tracking
- `/analyst/analytics` — Charts & exports
- `/analyst/alerts` — Alert center

### Admin (demo via Pricing page)
- `/admin` — System dashboard
- `/admin/users` — User management
- `/admin/reports` — Report moderation
- `/admin/subscriptions` — Billing
- `/admin/messages` — Support inbox
- `/admin/announcements` — Broadcasts
- `/admin/newsletter` — Newsletter composer

## Next steps (backend)

Wire to Convex, Azure OpenAI, Stripe, and SendGrid per `Development.pdf` in the project root.
