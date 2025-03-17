import { Pool } from 'pg';
import Pusher from 'pusher';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sender_id, receiver_id, content } = req.body;
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)',
      [sender_id, receiver_id, content]
    );

    // Pusher orqali real vaqt xabarini yuborish
    await pusher.trigger(`chat-${receiver_id}`, 'message', {
      sender_id,
      content,
      sent_at: new Date(),
    });

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
