import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sender_id, receiver_id, content } = req.body;
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)',
      [sender_id, receiver_id, content]
    );
    res.status(201).json({ message: 'Message sent' });
  } else if (req.method === 'GET') {
    const { user_id } = req.query;
    const result = await pool.query(
      'SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY sent_at DESC',
      [user_id]
    );
    res.status(200).json(result.rows);
  }
}
