-- Migration: Create readings table

CREATE TABLE IF NOT EXISTS readings (
    id BIGSERIAL PRIMARY KEY,
    cell_id INTEGER NOT NULL REFERENCES cells (id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    voltage REAL NOT NULL,
    current REAL NOT NULL,
    temperature REAL,
    soc REAL, -- State of Charge (0–100)
    soh REAL  -- State of Health (0–100)
);

-- Index to speed up queries by cell and time
CREATE INDEX IF NOT EXISTS idx_readings_cell_time ON readings (cell_id, timestamp DESC);