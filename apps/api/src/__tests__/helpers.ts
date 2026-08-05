import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

/**
 * Create an in-memory SQLite database with the full EdgeKit schema.
 * Returns a drizzle instance backed by better-sqlite3.
 */
export function createTestDb() {
  const sqlite = new Database(':memory:')

  // Enable WAL mode for better concurrency behavior in tests
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  // Create all tables matching the Drizzle schema
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      owner_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'MEMBER',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'TODO',
      priority TEXT NOT NULL DEFAULT 'NO_PRIORITY',
      assignee_id INTEGER REFERENCES users(id),
      creator_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  const db = drizzle(sqlite, { schema })
  return { sqlite, db }
}

/**
 * Seed a test user and return the user record.
 */
export function seedUser(
  db: ReturnType<typeof createTestDb>['db'],
  overrides: Partial<{ email: string; name: string; passwordHash: string }> = {},
) {
  const email = overrides.email ?? 'test@example.com'
  const name = overrides.name ?? 'Test User'
  const passwordHash =
    overrides.passwordHash ?? '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12'

  const result = db.insert(schema.users).values({ email, passwordHash, name }).returning().get()

  return result
}

/**
 * Seed a workspace with an OWNER member.
 */
export function seedWorkspace(
  db: ReturnType<typeof createTestDb>['db'],
  ownerId: number,
  overrides: Partial<{ name: string; slug: string }> = {},
) {
  const name = overrides.name ?? 'Test Workspace'
  const slug = overrides.slug ?? 'test-workspace'

  const workspace = db.insert(schema.workspaces).values({ name, slug, ownerId }).returning().get()

  db.insert(schema.workspaceMembers)
    .values({ workspaceId: workspace.id, userId: ownerId, role: 'OWNER' })
    .run()

  return workspace
}

/**
 * Seed a project in a workspace.
 */
export function seedProject(
  db: ReturnType<typeof createTestDb>['db'],
  workspaceId: number,
  overrides: Partial<{ name: string; description: string }> = {},
) {
  const project = db
    .insert(schema.projects)
    .values({
      workspaceId,
      name: overrides.name ?? 'Test Project',
      description: overrides.description ?? null,
    })
    .returning()
    .get()

  return project
}

/**
 * Seed an issue in a project.
 */
export function seedIssue(
  db: ReturnType<typeof createTestDb>['db'],
  projectId: number,
  creatorId: number,
  overrides: Partial<{ title: string; status: string; priority: string }> = {},
) {
  const issue = db
    .insert(schema.issues)
    .values({
      projectId,
      title: overrides.title ?? 'Test Issue',
      status: (overrides.status as schema.IssueStatus) ?? 'TODO',
      priority: (overrides.priority as schema.IssuePriority) ?? 'NO_PRIORITY',
      creatorId,
    })
    .returning()
    .get()

  return issue
}
