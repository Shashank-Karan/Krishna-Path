import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only require DATABASE_URL if we're not using Supabase
const hasSupabaseCredentials = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

if (!hasSupabaseCredentials && !process.env.DATABASE_URL) {
  throw new Error(
    "Either Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY) or DATABASE_URL must be set.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
