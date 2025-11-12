require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Example: list items
app.get('/items', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, price FROM items LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Example: create an order (transaction)
app.post('/orders', async (req, res) => {
  const { user_id, items } = req.body;
  if (!user_id || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid payload' });

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [orderResult] = await conn.query('INSERT INTO orders (user_id, created_at) VALUES (?, NOW())', [user_id]);
    const orderId = orderResult.insertId;

    for (const it of items) {
      await conn.query('INSERT INTO order_items (order_id, item_id, qty) VALUES (?,?,?)', [orderId, it.id, it.qty || 1]);
    }

    await conn.commit();
    conn.release();

    res.json({ orderId });
  } catch (err) {
    console.error(err);
    if (conn) {
      try {
        await conn.rollback();
        conn.release();
      } catch (e) {
        console.error('Rollback error', e);
      }
    }
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
