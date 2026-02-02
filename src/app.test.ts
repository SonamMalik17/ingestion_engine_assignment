import request from 'supertest';
import app from './app.js';

describe('Energy Ingestion Engine API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('POST /v1/telemetry/meter', () => {
    it('should validate meter reading payload', async () => {
      const invalidPayload = { meterId: '' };
      const res = await request(app)
        .post('/v1/telemetry/meter')
        .send(invalidPayload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid kwhConsumedAc', async () => {
      const payload = {
        meterId: 'METER-001',
        kwhConsumedAc: -10,
        voltage: 220,
        timestamp: new Date().toISOString()
      };
      const res = await request(app)
        .post('/v1/telemetry/meter')
        .send(payload);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /v1/telemetry/vehicle', () => {
    it('should validate vehicle reading payload', async () => {
      const invalidPayload = { vehicleId: '' };
      const res = await request(app)
        .post('/v1/telemetry/vehicle')
        .send(invalidPayload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject soc outside 0-100 range', async () => {
      const payload = {
        vehicleId: 'VEH-001',
        soc: 150,
        kwhDeliveredDc: 10,
        batteryTemp: 25,
        timestamp: new Date().toISOString()
      };
      const res = await request(app)
        .post('/v1/telemetry/vehicle')
        .send(payload);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /v1/telemetry/link', () => {
    it('should require meterId and vehicleId', async () => {
      const res = await request(app)
        .post('/v1/telemetry/link')
        .send({ meterId: 'METER-001' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });
  });

  describe('GET /v1/analytics/performance/:vehicleId', () => {
    it('should require vehicleId parameter', async () => {
      const res = await request(app).get('/v1/analytics/performance/');
      expect(res.status).toBe(404); // Route not matched
    });
  });
});
