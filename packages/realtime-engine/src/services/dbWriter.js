const { Pool } = require('pg');

// Setup a pool for writing data.  Reuses DATABASE_URL from environment.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * Writes an array of reading objects into the `readings` table.  Each object
 * must contain: cell_id, voltage, current, temperature, soc, soh, timestamp.
 */
async function writeReadings(batch) {
  if (!batch || batch.length === 0) return;
  const client = await pool.connect();
  try {
    const values = [];
    const params = [];
    batch.forEach((r, idx) => {
      const i = idx * 7;
      values.push(`($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6}, $${i + 7})`);
      params.push(r.cell_id, r.timestamp, r.voltage, r.current, r.temperature, r.soc, r.soh);
    });
    const query = `INSERT INTO readings (cell_id, timestamp, voltage, current, temperature, soc, soh)
                   VALUES ${values.join(',')}`;
    await client.query(query, params);
  } finally {
    client.release();
  }
}

module.exports = { writeReadings };