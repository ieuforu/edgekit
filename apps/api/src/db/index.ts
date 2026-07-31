import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

// The D1Database type from @cloudflare/workers-types and drizzle-orm's internal D1 type
// are structurally identical but nominally incompatible across package boundaries.
// Using 'any' here is the standard approach for this well-known type bridge.
export function createDb(env: any) {
  return drizzle(env.DB, { schema })
}

export type Database = ReturnType<typeof createDb>
export { schema }
