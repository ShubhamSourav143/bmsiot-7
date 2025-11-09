-- Migration: Create battery hierarchy tables (batteries, packs, cells)

-- Batteries table: represents an entire battery system
CREATE TABLE IF NOT EXISTS batteries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Packs table: each battery is divided into packs
CREATE TABLE IF NOT EXISTS packs (
    id SERIAL PRIMARY KEY,
    battery_id INTEGER NOT NULL REFERENCES batteries (id) ON DELETE CASCADE,
    pack_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pack_per_battery UNIQUE (battery_id, pack_index)
);

-- Cells table: each pack contains many cells
CREATE TABLE IF NOT EXISTS cells (
    id SERIAL PRIMARY KEY,
    pack_id INTEGER NOT NULL REFERENCES packs (id) ON DELETE CASCADE,
    cell_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cell_per_pack UNIQUE (pack_id, cell_index)
);