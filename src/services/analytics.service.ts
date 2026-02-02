import db from '../db/index.js';
import type { PerformanceAnalytics } from '../types/index.js';

interface AnalyticsRow {
  total_ac_consumed: string;
  total_dc_delivered: string;
  avg_battery_temp: string;
  readings_count: string;
}

export const analyticsService = {
  // Get 24-hour performance analytics for a vehicle
  async getVehiclePerformance(vehicleId: string): Promise<PerformanceAnalytics | null> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Query uses index on (vehicle_id, recorded_at) - no full table scan
    const result = await db.query<AnalyticsRow>(
      `WITH vehicle_data AS (
        SELECT
          kwh_delivered_dc,
          battery_temp
        FROM vehicle_readings_history
        WHERE vehicle_id = $1
          AND recorded_at >= $2
          AND recorded_at <= $3
      ),
      meter_data AS (
        SELECT
          SUM(m.kwh_consumed_ac) as total_ac
        FROM meter_readings_history m
        INNER JOIN meter_vehicle_mapping mv ON m.meter_id = mv.meter_id
        WHERE mv.vehicle_id = $1
          AND m.recorded_at >= $2
          AND m.recorded_at <= $3
      )
      SELECT
        COALESCE((SELECT total_ac FROM meter_data), 0) as total_ac_consumed,
        COALESCE(SUM(v.kwh_delivered_dc), 0) as total_dc_delivered,
        COALESCE(AVG(v.battery_temp), 0) as avg_battery_temp,
        COUNT(*)::text as readings_count
      FROM vehicle_data v`,
      [vehicleId, twentyFourHoursAgo.toISOString(), now.toISOString()]
    );

    const row = result.rows[0];
    if (!row || parseInt(row.readings_count) === 0) {
      return null;
    }

    const totalAc = parseFloat(row.total_ac_consumed);
    const totalDc = parseFloat(row.total_dc_delivered);

    return {
      vehicleId,
      period: {
        start: twentyFourHoursAgo.toISOString(),
        end: now.toISOString()
      },
      totalAcConsumed: totalAc,
      totalDcDelivered: totalDc,
      efficiencyRatio: totalAc > 0 ? totalDc / totalAc : 0,
      avgBatteryTemp: parseFloat(row.avg_battery_temp),
      readingsCount: parseInt(row.readings_count)
    };
  }
};

export default analyticsService;
