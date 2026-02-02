import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller.js';

const router = Router();

// GET /v1/analytics/performance/:vehicleId - Get 24-hour performance
router.get('/performance/:vehicleId', async (req, res, next) => {
  try {
    await analyticsController.getVehiclePerformance(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
