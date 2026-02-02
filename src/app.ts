import express, { Request, Response, NextFunction } from 'express';
import telemetryRouter from './routers/telemetry.router.js';
import analyticsRouter from './routers/analytics.router.js';

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/v1/telemetry', telemetryRouter);
app.use('/v1/analytics', analyticsRouter);

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

export default app;
