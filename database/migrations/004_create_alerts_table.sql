-- Migration: Create alerts table

CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    battery_id INTEGER REFERENCES batteries (id) ON DELETE CASCADE,
    pack_id INTEGER REFERENCES packs (id) ON DELETE CASCADE,
    cell_id INTEGER REFERENCES cells (id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL
);

-- Index to quickly query recent alerts
CREATE INDEX IF NOT EXISTS idx_alerts_time ON alerts (timestamp DESC);