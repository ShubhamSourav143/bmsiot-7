const { randomInt, randomFloat } = require('../utils/random');

/**
 * The Simulator class generates synthetic readings for a configurable number
 * of batteries, packs and cells.  Each cell maintains its own state (voltage,
 * current, temperature, SoC and SoH) which drifts over time to simulate
 * discharge and degradation.  On each tick, the simulator computes new
 * values and invokes the provided callback with an array of readings.
 */
class Simulator {
  constructor({ batteryCount = 1, packsPerBattery = 100, cellsPerPack = 10, interval = 2000 }) {
    this.batteryCount = batteryCount;
    this.packsPerBattery = packsPerBattery;
    this.cellsPerPack = cellsPerPack;
    this.interval = interval;
    this.cells = [];
    // Initialise cell state
    for (let b = 1; b <= batteryCount; b++) {
      for (let p = 1; p <= packsPerBattery; p++) {
        for (let c = 1; c <= cellsPerPack; c++) {
          const cellId = this.getCellId(b, p, c);
          this.cells.push({
            batteryId: b,
            packId: (b - 1) * packsPerBattery + p,
            cellIndex: c,
            cellId,
            voltage: 4.2 - randomFloat(0.0, 0.05),
            soc: 100 - randomFloat(0, 5),
            soh: 100 - randomFloat(0, 1),
            temperature: 30 + randomFloat(-1, 1),
          });
        }
      }
    }
  }

  getCellId(batteryIndex, packIndex, cellIndex) {
    // Create a unique numeric ID for the cell.  This formula matches the
    // ordering used in the migrations (serial IDs) but is deterministic.
    return (batteryIndex - 1) * this.packsPerBattery * this.cellsPerPack +
           (packIndex - 1) * this.cellsPerPack +
           cellIndex;
  }

  start(callback) {
    this.timer = setInterval(() => this.tick(callback), this.interval);
  }

  stop() {
    clearInterval(this.timer);
  }

  tick(callback) {
    const now = new Date();
    const batch = [];
    for (const cell of this.cells) {
      // Simulate slow discharge: reduce SoC and voltage slightly
      const discharge = randomFloat(0.05, 0.2);
      cell.soc = Math.max(0, cell.soc - discharge);
      cell.voltage = 3.5 + (cell.soc / 100) * 0.7 + randomFloat(-0.01, 0.01);
      // Simulate current draw: positive for discharge
      const current = randomFloat(0.5, 5.0);
      // Temperature changes moderately with current
      cell.temperature += (current - 2.5) * 0.1 + randomFloat(-0.05, 0.05);
      // SoH degrades slowly
      cell.soh = Math.max(50, cell.soh - randomFloat(0.0, 0.01));
      const reading = {
        batteryId: cell.batteryId,
        packId: cell.packId,
        cellId: cell.cellId,
        voltage: parseFloat(cell.voltage.toFixed(3)),
        current: parseFloat(current.toFixed(3)),
        temperature: parseFloat(cell.temperature.toFixed(2)),
        soc: parseFloat(cell.soc.toFixed(2)),
        soh: parseFloat(cell.soh.toFixed(2)),
        timestamp: now.toISOString(),
      };
      batch.push(reading);
    }
    callback(batch);
  }
}

module.exports = Simulator;