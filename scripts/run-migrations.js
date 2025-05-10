// scripts/run-migrations.js
require('dotenv').config({ path: '.env.local' });
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Parse command line arguments
const args = process.argv.slice(2);
const isMigrateDown = args.includes('--down');

async function main() {
  console.log('Starting database migration...');
  
  try {
    // Connect to the database
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    // Create a Postgres client
    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql);
    
    // Run migrations
    if (isMigrateDown) {
      console.log('Rolling back the last migration...');
      // For drizzle, rollbacks are typically handled manually
      // This would depend on your specific needs
    } else {
      console.log('Running migrations...');
      await migrate(db, { migrationsFolder: './lib/db/migrations' });
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();