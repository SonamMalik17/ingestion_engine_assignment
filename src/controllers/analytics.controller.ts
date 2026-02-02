import type { Request, Response } from 'express';
import analyticsService from '../services/analytics.service.js';

export const analyticsController = {
  async getVehiclePerformance(req: Request, res: Response): Promise<void> {
    const { vehicleId } = req.params;
    if (!vehicleId) {
      res.status(400).json({ success: false, error: 'vehicleId is required' });
      return;
    }

    const analytics = await analyticsService.getVehiclePerformance(vehicleId);
    if (!analytics) {
      res.status(404).json({ success: false, error: 'No data found for vehicle' });
      return;
    }

    res.json({ success: true, data: analytics });
  }
};

export default analyticsController;
