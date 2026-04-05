import pg from "pg";
const { Pool } = pg;

const url = process.env.DATABASE_URL;
console.log("Connecting to:", url.replace(/:[^:@]+@/, ':***@'));

const pool = new Pool({ connectionString: url });

try {
  const res = await pool.query('SELECT 1 as test');
  console.log("DB CONNECTION OK:", res.rows);
  
  // Check if users table exists
  const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  console.log("Tables:", tables.rows.map(r => r.tablename));
  
  // Check if there are any users
  try {
    const users = await pool.query('SELECT id, email, role FROM users LIMIT 5');
    console.log("Users:", users.rows);
  } catch (e) {
    console.log("Users table error:", e.message);
  }
} catch (e) {
  console.error("DB ERROR:", e.message);
} finally {
  await pool.end();
}
