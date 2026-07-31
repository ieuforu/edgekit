#!/bin/bash
npx wrangler d1 execute edgekit-db --local --command "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL)"
npx wrangler d1 execute edgekit-db --local --command "ALTER TABLE tasks ADD COLUMN user_id INTEGER" 2>/dev/null || echo "user_id column may already exist"
echo "D1 setup complete"
