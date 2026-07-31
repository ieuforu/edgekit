# edgekit

A full-stack task management app built with the modern edge-native stack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite 8 · Tailwind CSS 4 |
| Type Safety | Hono RPC (auto-inferred client ↔ server types) |
| API | Hono · Chanfana (OpenAPI 3.1) · Zod validation |
| Database | Cloudflare D1 · Drizzle ORM |
| Auth | bcrypt + session tokens · protected routes |
| Deploy | Cloudflare Workers (free tier) |

## Architecture

```
edgekit/
├── apps/
│   ├── web/          # React frontend
│   │   └── src/
│   │       ├── components/    # UI components
│   │       ├── pages/         # Login / Register
│   │       ├── context/       # Auth state
│   │       └── lib/           # Hono RPC client
│   └── api/          # Cloudflare Worker backend
│       └── src/
│           ├── endpoints/     # Auth + Task CRUD
│           ├── db/            # Drizzle schema + client
│           └── middleware/     # Auth middleware
└── packages/
    └── shared/       # Shared types & Zod schemas
```

## Features

- Full CRUD for tasks (create, read, update, delete, toggle complete)
- Per-user task isolation
- Auth system with register / login / logout
- Filter bar (all / active / completed)
- Responsive Tailwind UI with modals
- Auto-generated OpenAPI docs at `/` (Swagger UI)
- End-to-end type safety via Hono RPC

## Getting Started

```bash
# Install dependencies
pnpm install

# Start both API and frontend
pnpm dev
```

- **Frontend**: http://localhost:5173
- **API docs**: http://localhost:8787 (Swagger UI)

### Database Setup

Tables are created automatically via `wrangler d1 execute`:

```bash
cd apps/api
npx wrangler d1 execute edgekit-db --local --command "CREATE TABLE IF NOT EXISTS ..."
```

Or use the Drizzle migration:

```bash
npx drizzle-kit push
```

## Development

```bash
pnpm dev          # Start both API + web in parallel
pnpm dev:web      # Frontend only
pnpm dev:api      # API only
pnpm lint         # OxLint
pnpm fmt          # Oxfmt
```

## License

MIT
