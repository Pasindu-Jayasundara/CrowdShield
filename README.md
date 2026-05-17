# CrowdShield

CrowdShield is a modern cyber threat intelligence dashboard built with React, Convex, and Tailwind CSS. It combines public live feeds, community-sourced scam reports, analyst workflows, and admin operations into a single SaaS-style security product.

## Why CrowdShield?

- Public threat feed with AI-assisted scam analysis
- User-driven report submission and validation
- Analyst workspace with dashboards, geo intelligence, campaigns, analytics, and alerts
- Admin portal for user management, reports moderation, subscriptions, announcements, and newsletters
- Convex backend for auth, data storage, and real-time queries

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- motion/react for UI animation
- Convex for backend database + auth
- @convex-dev/auth for OAuth and session handling
- Recharts for analytics visualization
- Lucide React for icons

## Project Structure

- `src/` — frontend app code
  - `app/` — pages, components, context, screens, and routing
  - `components/` — shared UI + Convex auth provider
  - `lib/` — route helpers
- `convex/` — backend schema, auth, data queries, and mutations
  - `auth.ts` — Convex auth setup and callbacks
  - `schema.ts` — Convex schema and auth user table
  - `users.ts` — viewer role query and admin helpers
  - `subscriptions.ts` — subscription logic
- `.env.local` — local Convex environment variables

## Routes

### Public
- `/` — Landing page
- `/feed` — Live public threat feed
- `/submit` — Submit a report
- `/near-me` — Location-based threat insights
- `/pricing` — Pricing, subscription info, and demo flows
- `/signin` — Google sign-in page

### Analyst
- `/analyst` — Analyst home dashboard
- `/analyst/feed` — Analyst live feed
- `/analyst/geo` — Geo intelligence map
- `/analyst/campaigns` — Campaign tracking
- `/analyst/analytics` — Data analytics and charts
- `/analyst/alerts` — Alerts center

### Admin
- `/admin` — Admin overview dashboard
- `/admin/users` — User management
- `/admin/reports` — Reports moderation
- `/admin/subscriptions` — Subscription overview
- `/admin/messages` — Support inbox
- `/admin/announcements` — Broadcast announcements
- `/admin/newsletter` — Newsletter management

## Local Development

### Prerequisites

- Node.js 20+ recommended
- npm
- Convex CLI installed globally for local backend development if needed

### Setup

```bash
cd crowdshield
npm install
cp .env.local.example .env.local
# update .env.local if needed
npm run dev
```

### Environment

Your local app expects Convex values in `.env.local`:

```env
CONVEX_DEPLOYMENT=dev:clear-jellyfish-418
VITE_CONVEX_URL=https://clear-jellyfish-418.convex.cloud
VITE_CONVEX_SITE_URL=https://clear-jellyfish-418.convex.site
```

> Replace the values with your own Convex deployment config if you are running a different instance.

## Convex Backend

The app uses Convex for auth and storage:

- `convex/auth.ts` configures Convex OAuth with Google and sets user defaults
- `convex/schema.ts` defines the `users`, `reports`, `subscriptions`, and `invitations` tables
- `convex/users.ts` exposes `viewerRole` and admin mutation helpers
- `convex/subscriptions.ts` exposes subscription creation and lookup

## Authentication

- Google OAuth sign-in via `@convex-dev/auth`
- Auth state is provided through `ConvexAuthProvider`
- Protected analyst/admin routes use the app role from `viewerRole`

## Deployment

1. Build the app:

```bash
npm run build
```

2. Deploy the frontend to your chosen host (Vercel, Netlify, etc.)
3. Ensure Convex env variables are configured in production

## Notes

- The project currently routes with role-aware redirects for public, analyst, and admin users
- The `src/proxy.ts` middleware is configured to protect analyst/admin paths while leaving public pages accessible
- The Convex backend stores user roles in the `users` table under the `role` field

## Contributing

- Open an issue for bugs or feature requests
- Create feature branches for changes
- Keep UI and backend logic separated
- Run `npm run lint` and `npm run build` before submitting a PR

## License

This project does not currently specify a license.
