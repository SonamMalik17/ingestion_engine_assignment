import { Router } from 'express';
import telemetryController from '../controllers/telemetry.controller.js';

const router = Router();

// POST /v1/telemetry/meter - Ingest meter reading
router.post('/meter', async (req, res, next) => {
  try {
    await telemetryController.ingestMeterReading(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /v1/telemetry/vehicle - Ingest vehicle reading
router.post('/vehicle', async (req, res, next) => {
  try {
    await telemetryController.ingestVehicleReading(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /v1/telemetry/link - Link meter to vehicle
router.post('/link', async (req, res, next) => {
  try {
    await telemetryController.linkMeterToVehicle(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
