-- Energy Ingestion Engine Database Schema
-- Implements Hot (current status) and Cold (historical) storage strategy

-- =============================================
-- COLD STORAGE: Historical telemetry (append-only INSERT)
-- =============================================

-- Meter readings history (billions of rows over time)
CREATE TABLE IF NOT EXISTS meter_readings_history (
    id BIGSERIAL PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL,
    kwh_consumed_ac DECIMAL(12, 4) NOT NULL,
    voltage DECIMAL(8, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytical queries (avoid full table scan)
CREATE INDEX IF NOT EXISTS idx_meter_history_meter_time
ON meter_readings_history (meter_id, recorded_at DESC);

-- Vehicle readings history (billions of rows over time)
CREATE TABLE IF NOT EXISTS vehicle_readings_history (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    soc DECIMAL(5, 2) NOT NULL,
    kwh_delivered_dc DECIMAL(12, 4) NOT NULL,
    battery_temp DECIMAL(5, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytical queries (avoid full table scan)
CREATE INDEX IF NOT EXISTS idx_vehicle_history_vehicle_time
ON vehicle_readings_history (vehicle_id, recorded_at DESC);

-- =============================================
-- HOT STORAGE: Current status (UPSERT for fast dashboard access)
-- =============================================

-- Current meter status (one row per meter)
CREATE TABLE IF NOT EXISTS meter_current_status (
    meter_id VARCHAR(50) PRIMARY KEY,
    kwh_consumed_ac DECIMAL(12, 4) NOT NULL,
    voltage DECIMAL(8, 2) NOT NULL,
    last_reading_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current vehicle status (one row per vehicle)
CREATE TABLE IF NOT EXISTS vehicle_current_status (
    vehicle_id VARCHAR(50) PRIMARY KEY,
    soc DECIMAL(5, 2) NOT NULL,
    kwh_delivered_dc DECIMAL(12, 4) NOT NULL,
    battery_temp DECIMAL(5, 2) NOT NULL,
    last_reading_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CORRELATION TABLE: Links meters to vehicles for analytics
-- =============================================

CREATE TABLE IF NOT EXISTS meter_vehicle_mapping (
    meter_id VARCHAR(50) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (meter_id, vehicle_id)
);

-- Index for reverse lookup
CREATE INDEX IF NOT EXISTS idx_mapping_vehicle
ON meter_vehicle_mapping (vehicle_id);
