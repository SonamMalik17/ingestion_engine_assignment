import { z } from 'zod';

// Meter telemetry schema
export const MeterReadingSchema = z.object({
  meterId: z.string().min(1),
  kwhConsumedAc: z.number().positive(),
  voltage: z.number().positive(),
  timestamp: z.string().datetime()
});

// Vehicle telemetry schema
export const VehicleReadingSchema = z.object({
  vehicleId: z.string().min(1),
  soc: z.number().min(0).max(100),
  kwhDeliveredDc: z.number().min(0),
  batteryTemp: z.number(),
  timestamp: z.string().datetime()
});

// Inferred types from schemas
export type MeterReading = z.infer<typeof MeterReadingSchema>;
export type VehicleReading = z.infer<typeof VehicleReadingSchema>;

// Analytics response type
export interface PerformanceAnalytics {
  vehicleId: string;
  period: {
    start: string;
    end: string;
  };
  totalAcConsumed: number;
  totalDcDelivered: number;
  efficiencyRatio: number;
  avgBatteryTemp: number;
  readingsCount: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
