// Test database connection for Supabase/PostgreSQL (ESM)
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set in environment variables.');
      process.exit(1);
    }
    const sqlClient = neon(process.env.DATABASE_URL);
    const result = await sqlClient`SELECT 1 as test`;
    if (result && result[0] && result[0].test === 1) {
      console.log('Database connection successful!');
    } else {
      console.error('Database connection failed: Unexpected result.');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
