import db from '../db/index.js';
import type { MeterReading, VehicleReading } from '../types/index.js';

export const telemetryService = {
  // Ingest meter reading: INSERT to history (cold) + UPSERT to current (hot)
  async ingestMeterReading(reading: MeterReading): Promise<void> {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Cold storage: append-only history
      await client.query(
        `INSERT INTO meter_readings_history (meter_id, kwh_consumed_ac, voltage, recorded_at)
         VALUES ($1, $2, $3, $4)`,
        [reading.meterId, reading.kwhConsumedAc, reading.voltage, reading.timestamp]
      );

      // Hot storage: upsert current status
      await client.query(
        `INSERT INTO meter_current_status (meter_id, kwh_consumed_ac, voltage, last_reading_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (meter_id) DO UPDATE SET
           kwh_consumed_ac = EXCLUDED.kwh_consumed_ac,
           voltage = EXCLUDED.voltage,
           last_reading_at = EXCLUDED.last_reading_at,
           updated_at = NOW()`,
        [reading.meterId, reading.kwhConsumedAc, reading.voltage, reading.timestamp]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Ingest vehicle reading: INSERT to history (cold) + UPSERT to current (hot)
  async ingestVehicleReading(reading: VehicleReading): Promise<void> {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Cold storage: append-only history
      await client.query(
        `INSERT INTO vehicle_readings_history (vehicle_id, soc, kwh_delivered_dc, battery_temp, recorded_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [reading.vehicleId, reading.soc, reading.kwhDeliveredDc, reading.batteryTemp, reading.timestamp]
      );

      // Hot storage: upsert current status
      await client.query(
        `INSERT INTO vehicle_current_status (vehicle_id, soc, kwh_delivered_dc, battery_temp, last_reading_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (vehicle_id) DO UPDATE SET
           soc = EXCLUDED.soc,
           kwh_delivered_dc = EXCLUDED.kwh_delivered_dc,
           battery_temp = EXCLUDED.battery_temp,
           last_reading_at = EXCLUDED.last_reading_at,
           updated_at = NOW()`,
        [reading.vehicleId, reading.soc, reading.kwhDeliveredDc, reading.batteryTemp, reading.timestamp]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Link a meter to a vehicle for correlation
  async linkMeterToVehicle(meterId: string, vehicleId: string): Promise<void> {
    await db.query(
      `INSERT INTO meter_vehicle_mapping (meter_id, vehicle_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [meterId, vehicleId]
    );
  }
};

export default telemetryService;
