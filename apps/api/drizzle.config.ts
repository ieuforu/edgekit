import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'd1',
  dbCredentials: {
    databaseId: 'de79d128-2df1-448a-a117-5d6c2a64a204',
  },
})
