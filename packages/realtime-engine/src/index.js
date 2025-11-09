require('dotenv').config();
const Simulator = require('./simulation/simulator');
const WebSocketManager = require('./services/webSocket');
const { writeReadings } = require('./services/dbWriter');
const { Pool } = require('pg');

// Optional: separate pool for alerts insertion
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function insertAlert(reading, type, severity, message) {
  try {
    await pool.query(
      'INSERT INTO alerts (battery_id, pack_id, cell_id, timestamp, severity, type, message) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [reading.batteryId, reading.packId, reading.cellId, reading.timestamp, severity, type, message]
    );
  } catch (err) {
    console.error('Failed to insert alert', err);
  }
}

async function main() {
  const wsPort = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 4000;
  const wsManager = new WebSocketManager({ port: wsPort });
  const simulator = new Simulator({ interval: parseInt(process.env.SIMULATION_INTERVAL, 10) || 5000 });
  simulator.start(async (batch) => {
    // Write to DB
    await writeReadings(batch.map((r) => ({
      cell_id: r.cellId,
      timestamp: new Date(r.timestamp),
      voltage: r.voltage,
      current: r.current,
      temperature: r.temperature,
      soc: r.soc,
      soh: r.soh,
    })));
    // Broadcast and check for alerts
    for (const reading of batch) {
      // Simple alert logic
      if (reading.voltage < 3.0) {
        await insertAlert(reading, 'low_voltage', 'warning', `Voltage ${reading.voltage}V below threshold`);
      }
      if (reading.temperature > 50) {
        await insertAlert(reading, 'over_temperature', 'critical', `Temperature ${reading.temperature}°C exceeds safe limit`);
      }
      wsManager.broadcastReading(reading);
    }
  });
  console.log('Real‑time engine started');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});