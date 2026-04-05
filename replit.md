# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: Session-based (express-session)

## Application: Careera

AI-powered event recommendation platform for students, organizers, and admins.

### Admin Credentials
- Email: `gaurik8149@gmail.com`
- Password: `Admin`

### Color Scheme
- Primary: `#1e3a8a` (Navy Blue) → HSL: 222 72% 33%
- Secondary: `#06b6d4` (Cyan) → HSL: 189 94% 43%
- Background: `#f8fafc` → HSL: 210 40% 98%
- Text: `#1f2937` → HSL: 215 28% 17%
- Muted: `#64748b` → HSL: 215 16% 47%
- Border: `#e2e8f0` → HSL: 214 32% 91%

### User Roles
1. **Student (user)** — Browse events, get recommendations, register, referrals
2. **Organizer** — Create/manage events, post announcements (requires admin approval)
3. **Admin** — Approve/reject organizers, view all data, send announcements

### Key Pages
- `/` — Landing page
- `/login` — Login (all roles)
- `/signup` — Student signup
- `/organizer-signup` — Organizer signup
- `/dashboard` — Student dashboard (6 tabs)
- `/organizer` — Organizer dashboard
- `/admin` — Admin dashboard
- `/events/:id` — Event detail
- `/pending-approval` — Organizer awaiting approval

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── careera/            # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Tables
- `users` — all users (students, organizers, admin)
- `events` — events created by organizers
- `registrations` — student-event registrations
- `notifications` — per-user and broadcast notifications
- `announcements` — platform-wide announcements

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## API Codegen

Run codegen after editing `lib/api-spec/openapi.yaml`:
```bash
pnpm --filter @workspace/api-spec run codegen
```

## DB Schema Push

```bash
pnpm --filter @workspace/db run push
# or if conflicts:
pnpm --filter @workspace/db run push-force
```
