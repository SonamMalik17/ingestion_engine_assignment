#!/bin/bash

# Energy Ingestion Engine - API Test Script
# Usage: ./test-api.sh

BASE_URL="http://localhost:3000"

echo "=== Energy Ingestion Engine API Tests ==="
echo ""

# Health check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq
echo ""

# Link meter to vehicle (do this first for analytics correlation)
echo "2. Link Meter to Vehicle"
curl -s -X POST "$BASE_URL/v1/telemetry/link" \
  -H "Content-Type: application/json" \
  -d '{"meterId": "METER-001", "vehicleId": "VEH-001"}' | jq
echo ""

# Ingest meter readings
echo "3. Ingest Meter Reading"
curl -s -X POST "$BASE_URL/v1/telemetry/meter" \
  -H "Content-Type: application/json" \
  -d "{
    \"meterId\": \"METER-001\",
    \"kwhConsumedAc\": 50.5,
    \"voltage\": 230.5,
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }" | jq
echo ""

# Ingest vehicle readings
echo "4. Ingest Vehicle Reading"
curl -s -X POST "$BASE_URL/v1/telemetry/vehicle" \
  -H "Content-Type: application/json" \
  -d "{
    \"vehicleId\": \"VEH-001\",
    \"soc\": 75.5,
    \"kwhDeliveredDc\": 42.8,
    \"batteryTemp\": 28.5,
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }" | jq
echo ""

# Add more readings to see aggregated analytics
echo "5. Ingest Second Meter Reading"
curl -s -X POST "$BASE_URL/v1/telemetry/meter" \
  -H "Content-Type: application/json" \
  -d "{
    \"meterId\": \"METER-001\",
    \"kwhConsumedAc\": 55.0,
    \"voltage\": 231.0,
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }" | jq
echo ""

echo "6. Ingest Second Vehicle Reading"
curl -s -X POST "$BASE_URL/v1/telemetry/vehicle" \
  -H "Content-Type: application/json" \
  -d "{
    \"vehicleId\": \"VEH-001\",
    \"soc\": 80.0,
    \"kwhDeliveredDc\": 45.5,
    \"batteryTemp\": 30.0,
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }" | jq
echo ""

# Get analytics
echo "7. Get Vehicle Performance Analytics (24-hour)"
curl -s "$BASE_URL/v1/analytics/performance/VEH-001" | jq
echo ""

# Test validation errors
echo "8. Test Invalid Meter Reading (negative kWh)"
curl -s -X POST "$BASE_URL/v1/telemetry/meter" \
  -H "Content-Type: application/json" \
  -d '{"meterId": "METER-001", "kwhConsumedAc": -10, "voltage": 220, "timestamp": "2024-01-01T00:00:00Z"}' | jq
echo ""

echo "9. Test Invalid Vehicle Reading (SoC > 100)"
curl -s -X POST "$BASE_URL/v1/telemetry/vehicle" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": "VEH-001", "soc": 150, "kwhDeliveredDc": 10, "batteryTemp": 25, "timestamp": "2024-01-01T00:00:00Z"}' | jq
echo ""

echo "10. Test Analytics for Non-existent Vehicle"
curl -s "$BASE_URL/v1/analytics/performance/NON-EXISTENT" | jq
echo ""

echo "=== Tests Complete ==="
