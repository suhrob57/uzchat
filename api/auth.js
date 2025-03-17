import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, username, password } = req.body;

    if (action === 'register') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (user_id, username, password) VALUES (uuid_generate_v4(), $1, $2)',
        [username, hashedPassword]
      );
      res.status(201).json({ message: 'User registered' });
    } else if (action === 'login') {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length > 0 && await bcrypt.compare(password, result.rows[0].password)) {
        res.status(200).json({ user_id: result.rows[0].user_id });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
