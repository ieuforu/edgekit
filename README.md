# EdgeKit

全栈任务管理应用 — Cloudflare Workers + React + Drizzle ORM

## ScreenShot

<p align="center">
  <img src="screenshot/preview_1.png" width="80%" />
</p>
<p align="center">
  <img src="screenshot/preview_2.png" width="80%" />
</p>
<p align="center">
  <img src="screenshot/preview_3.png" width="80%" />
</p>

## Tech Stack

| Layer    | Tech                                   |
| -------- | -------------------------------------- |
| Frontend | React 19 + Vite + Tailwind CSS         |
| Backend  | Hono on Cloudflare Workers             |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM   |
| Auth     | JWT (jose) + bcrypt + HttpOnly cookies |
| API Docs | 自动生成 Swagger UI (chanfana)         |
| Monorepo | pnpm workspaces                        |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm i -g wrangler`)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Initialize local D1 database

The project uses Cloudflare D1 locally through Wrangler/Miniflare.

```bash
cd apps/api

npx wrangler d1 execute edgekit-db \
  --local \
  --file=./schema.sql
```

This creates the local D1 database used during development.

> Local D1 data is stored in `.wrangler/` and is not committed to git.

### 3. Start development servers

From the project root:

```bash
pnpm dev
```

Services:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8787
- **API Docs**: http://localhost:8787 (Swagger UI)

## Production D1 Setup (Optional)

For deploying to Cloudflare Workers, create a remote D1 database:

```bash
cd apps/api

npx wrangler d1 create edgekit-db
```

Update the generated `database_id` in:

```
apps/api/wrangler.jsonc
```

Apply the schema to the remote database:

```bash
npx wrangler d1 execute edgekit-db \
  --remote \
  --file=./schema.sql
```

## Project Structure

```
edgekit/
├── apps/
│   ├── web/              # React frontend
│   │   └── src/
│   │       ├── components/   # UI components
│   │       ├── pages/        # Login / Register
│   │       ├── context/      # Auth state
│   │       └── lib/          # API client
│   └── api/              # Cloudflare Worker backend
│       ├── schema.sql        # D1 表结构
│       └── src/
│           ├── endpoints/    # Auth + Task CRUD
│           ├── db/           # Drizzle schema + client
│           └── middleware/   # Auth middleware
└── packages/
    └── shared/           # 共享类型 & Zod schemas
```

## Features

- 注册 / 登录 / 登出（JWT + HttpOnly cookies）
- 任务 CRUD + 标记完成
- 按用户隔离任务
- 筛选栏（全部 / 进行中 / 已完成）
- 响应式 Tailwind UI + 弹窗交互
- 自动 OpenAPI 文档（Swagger UI）
- Hono RPC 端到端类型安全

## Development

```bash
pnpm dev          # API + Frontend 并行
pnpm dev:web      # 仅前端
pnpm dev:api      # 仅后端
pnpm lint         # OxLint
pnpm fmt          # Oxfmt
```

## License

MIT
