import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1').then(() => {
  console.log('SUCCESS_DATABASE_CONNECTION');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
