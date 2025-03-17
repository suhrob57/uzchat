import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    const result = await pool.query('SELECT username FROM users WHERE user_id = $1', [user_id]);
    res.status(200).json(result.rows[0]);
  }
}
