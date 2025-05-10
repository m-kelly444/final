import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Initialize postgres connection
const connectionString = process.env.DATABASE_URL!;

// For server-side only
const queryClient = postgres(connectionString, { max: 1 });
const db = drizzle(queryClient, { schema });

export { db };