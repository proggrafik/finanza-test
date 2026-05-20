import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
});

export default pool;
