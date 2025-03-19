import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Cors from 'cors';

// CORS uchun middleware
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
});

// PostgreSQL ulanishi
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Next.js API route handler
export default async function handler(req, res) {
  // CORS qo‘llash
  await new Promise((resolve, reject) => {
    cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, username, password } = req.body;

  console.log('Request received:', { action, username });

  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (action === 'register') {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      await pool.query(
        'INSERT INTO users (user_id, username, password) VALUES ($1, $2, $3)',
        [userId, username, hashedPassword]
      );

      return res.status(201).json({ message: 'User registered', user_id: userId });
    }

    if (action === 'login') {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      return res.status(200).json({ user_id: user.user_id });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
