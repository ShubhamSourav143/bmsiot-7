const db = require('../lib/db');
const { requireAuth } = require('../lib/auth');

// Express-style handler for GET /api/battery/:id
module.exports = async (req, res) => {
  // We wrap logic in an inner function so we can re-use requireAuth easily
  const handler = async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const id = req.query.id || req.params?.id;
    if (!id) {
      return res.status(400).json({ error: 'Battery id required' });
    }
    try {
      // Fetch battery record
      const { rows: batteryRows } = await db.query('SELECT * FROM batteries WHERE id = $1', [id]);
      if (batteryRows.length === 0) {
        return res.status(404).json({ error: 'Battery not found' });
      }
      // Fetch packs and cells with latest reading per cell
      const query = `
        SELECT c.id AS cell_id, p.id AS pack_id, p.pack_index,
               r.voltage, r.current, r.temperature, r.soc, r.soh, r.timestamp
        FROM cells c
        JOIN packs p ON c.pack_id = p.id
        LEFT JOIN LATERAL (
          SELECT voltage, current, temperature, soc, soh, timestamp
          FROM readings
          WHERE cell_id = c.id
          ORDER BY timestamp DESC
          LIMIT 1
        ) r ON true
        WHERE p.battery_id = $1
        ORDER BY p.pack_index, c.cell_index;
      `;
      const { rows } = await db.query(query, [id]);
      // Aggregate into hierarchical structure
      const packs = {};
      rows.forEach((row) => {
        if (!packs[row.pack_id]) {
          packs[row.pack_id] = { packId: row.pack_id, packIndex: row.pack_index, cells: [] };
        }
        packs[row.pack_id].cells.push({
          cellId: row.cell_id,
          voltage: row.voltage,
          current: row.current,
          temperature: row.temperature,
          soc: row.soc,
          soh: row.soh,
          timestamp: row.timestamp,
        });
      });
      return res.status(200).json({ battery: batteryRows[0], packs: Object.values(packs) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  // Wrap with authentication middleware; allow user, moderator and admin
  return requireAuth(['user', 'moderator', 'admin'])(req, res, () => handler(req, res));
};