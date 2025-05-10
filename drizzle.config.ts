// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts', // CORRECT PATH to your schema
  out: './lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    // Use environment variable or fallback to a development database URL
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/echelon',
  },
} satisfies Config;