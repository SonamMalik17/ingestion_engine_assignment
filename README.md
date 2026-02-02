# Energy Ingestion Engine

High-scale telemetry ingestion system for Smart Meters and EV Fleets.

## Quick Start

```bash
# Install dependencies and start everything
npm install
npm run docker:up

# Test the API
curl http://localhost:3000/health
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Smart Meter   │     │    EV Vehicle   │
│  (AC consumed)  │     │  (DC delivered) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│            Express Server               │
│  POST /v1/telemetry/meter               │
│  POST /v1/telemetry/vehicle             │
│  GET  /v1/analytics/performance/:id     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│             PostgreSQL                  │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │ Hot Storage │  │   Cold Storage   │  │
│  │  (UPSERT)   │  │  (INSERT only)   │  │
│  │ Current SoC │  │ Historical data  │  │
│  └─────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
```

## NPM Scripts

### Docker Commands (Full Stack)

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start PostgreSQL + Server containers |
| `npm run docker:down` | Stop all containers |
| `npm run docker:logs` | View logs from all services |
| `npm run docker:reset` | Wipe database and restart everything |

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev:local` | Run server locally with dockerized DB |
| `npm run dev` | Run server only (requires DB running) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled server |
| `npm test` | Run test suite |

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start only PostgreSQL container |
| `npm run db:shell` | Open psql shell in database |

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Ingest Meter Reading
```bash
curl -X POST http://localhost:3000/v1/telemetry/meter \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "METER-001",
    "kwhConsumedAc": 50.5,
    "voltage": 230.5,
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

### Ingest Vehicle Reading
```bash
curl -X POST http://localhost:3000/v1/telemetry/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "VEH-001",
    "soc": 75.5,
    "kwhDeliveredDc": 42.8,
    "batteryTemp": 28.5,
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

### Link Meter to Vehicle
```bash
curl -X POST http://localhost:3000/v1/telemetry/link \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "METER-001",
    "vehicleId": "VEH-001"
  }'
```

### Get 24-Hour Performance Analytics
```bash
curl http://localhost:3000/v1/analytics/performance/VEH-001
```

Response:
```json
{
  "success": true,
  "data": {
    "vehicleId": "VEH-001",
    "period": {
      "start": "2024-01-14T10:30:00Z",
      "end": "2024-01-15T10:30:00Z"
    },
    "totalAcConsumed": 105.5,
    "totalDcDelivered": 88.3,
    "efficiencyRatio": 0.837,
    "avgBatteryTemp": 29.25,
    "readingsCount": 2
  }
}
```

## Data Storage Strategy

### Hot Storage (Current Status)
- Tables: `meter_current_status`, `vehicle_current_status`
- Operation: UPSERT (one row per device)
- Use case: Dashboard showing current SoC, voltage, etc.

### Cold Storage (Historical)
- Tables: `meter_readings_history`, `vehicle_readings_history`
- Operation: INSERT only (append)
- Use case: Analytics, audit trail, long-term reporting

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── analytics.controller.ts
│   └── telemetry.controller.ts
├── services/             # Business logic
│   ├── analytics.service.ts
│   └── telemetry.service.ts
├── routers/              # Express routes
│   ├── analytics.router.ts
│   └── telemetry.router.ts
├── db/
│   ├── index.ts          # Database connection
│   └── schema.sql        # Table definitions
├── types/
│   └── index.ts          # TypeScript types & Zod schemas
├── app.ts                # Express app setup
├── app.test.ts           # Test suite
└── server.ts             # Entry point
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | energy_db | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |