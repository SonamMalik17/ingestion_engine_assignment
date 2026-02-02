import type { Request, Response } from 'express';
import { MeterReadingSchema, VehicleReadingSchema } from '../types/index.js';
import telemetryService from '../services/telemetry.service.js';

export const telemetryController = {
  async ingestMeterReading(req: Request, res: Response): Promise<void> {
    const parsed = MeterReadingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }

    await telemetryService.ingestMeterReading(parsed.data);
    res.status(201).json({ success: true, data: { message: 'Meter reading ingested' } });
  },

  async ingestVehicleReading(req: Request, res: Response): Promise<void> {
    const parsed = VehicleReadingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }

    await telemetryService.ingestVehicleReading(parsed.data);
    res.status(201).json({ success: true, data: { message: 'Vehicle reading ingested' } });
  },

  async linkMeterToVehicle(req: Request, res: Response): Promise<void> {
    const { meterId, vehicleId } = req.body;
    if (!meterId || !vehicleId) {
      res.status(400).json({ success: false, error: 'meterId and vehicleId are required' });
      return;
    }

    await telemetryService.linkMeterToVehicle(meterId, vehicleId);
    res.status(201).json({ success: true, data: { message: 'Meter linked to vehicle' } });
  }
};

export default telemetryController;
