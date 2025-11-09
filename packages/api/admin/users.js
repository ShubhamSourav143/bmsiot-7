const bcrypt = require('bcryptjs');
const db = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async (req, res) => {
  const handler = async (req, res) => {
    if (req.method === 'GET') {
      try {
        const { rows } = await db.query('SELECT id, username, role FROM users ORDER BY id');
        return res.status(200).json(rows);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    if (req.method === 'POST') {
      const { username, password, role } = req.body || {};
      if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password and role are required' });
      }
      if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      try {
        const hash = await bcrypt.hash(password, 10);
        const { rows } = await db.query(
          'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
          [username, hash, role]
        );
        return res.status(201).json(rows[0]);
      } catch (err) {
        if (err.code === '23505') {
          return res.status(409).json({ error: 'User already exists' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    return res.status(405).json({ error: 'Method not allowed' });
  };
  return requireAuth(['admin'])(req, res, () => handler(req, res));
};