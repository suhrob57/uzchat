const { Pool } = require('pg');
const Pusher = require('pusher');

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

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
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
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    try {
      const { user_id } = req.query;
      const result = await pool.query(
        'SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY sent_at DESC',
        [user_id]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
