# @edgekit/api

Cloudflare Worker backend for edgekit.

## Stack

- Hono + Chanfana (OpenAPI 3.1)
- Drizzle ORM + Cloudflare D1
- Zod validation

## Run

```bash
pnpm dev
```

Starts at http://localhost:8787. Open `/` for Swagger UI docs.

## Endpoints

| Method | Path               | Auth | Description       |
| ------ | ------------------ | ---- | ----------------- |
| POST   | /api/auth/register | No   | Register new user |
| POST   | /api/auth/login    | No   | Login             |
| GET    | /api/auth/me       | Yes  | Current user info |
| POST   | /api/auth/logout   | Yes  | Logout            |
| GET    | /api/tasks         | Yes  | List user's tasks |
| POST   | /api/tasks         | Yes  | Create task       |
| GET    | /api/tasks/:slug   | Yes  | Get task          |
| PATCH  | /api/tasks/:slug   | Yes  | Update task       |
| DELETE | /api/tasks/:slug   | Yes  | Delete task       |
