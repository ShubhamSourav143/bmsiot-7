const db = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async (req, res) => {
  const handler = async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      const query = `
        SELECT b.id AS battery_id,
               AVG(r.soc) AS avg_soc,
               AVG(r.soh) AS avg_soh,
               COALESCE(al.count, 0) AS active_alerts
        FROM batteries b
        JOIN packs p ON p.battery_id = b.id
        JOIN cells c ON c.pack_id = p.id
        JOIN LATERAL (
          SELECT soc, soh
          FROM readings
          WHERE cell_id = c.id
          ORDER BY timestamp DESC
          LIMIT 1
        ) r ON true
        LEFT JOIN (
          SELECT battery_id, COUNT(*) AS count
          FROM alerts
          WHERE severity IN ('warning', 'critical')
          GROUP BY battery_id
        ) al ON al.battery_id = b.id
        GROUP BY b.id, al.count
        ORDER BY b.id;
      `;
      const { rows } = await db.query(query);
      // Rename keys to camelCase for the frontend
      const result = rows.map((row) => ({
        batteryId: row.battery_id,
        avgSoc: parseFloat(row.avg_soc),
        avgSoh: parseFloat(row.avg_soh),
        activeAlerts: parseInt(row.active_alerts, 10),
      }));
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  return requireAuth(['moderator', 'admin'])(req, res, () => handler(req, res));
};