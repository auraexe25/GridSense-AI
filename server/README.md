# Grid Sense API Server

## Setup Instructions

### 1. Create Virtual Environment

```bash
# Create a virtual environment
python -m venv venv
```

### 2. Activate Virtual Environment

**On Windows:**

```bash
venv\Scripts\activate
```

**On macOS/Linux:**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Development Server

```bash
fastapi dev main.py
```

The server will start at `http://localhost:8000`

### 5. Access API Documentation

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Available Endpoints

### General

- `GET /` - Root endpoint (Server status)
- `GET /health` - Health check endpoint

### API Endpoints

**Live Data**

- `GET /api/live` - Real-time telemetry from all devices

**Devices**

- `GET /api/devices` - List all devices
- `GET /api/devices/telemetry` - All device telemetry
- `GET /api/devices/{device_id}` - Specific device telemetry
- `POST /api/devices/{device_id}/control/on` - Turn device on
- `POST /api/devices/{device_id}/control/off` - Turn device off
- `POST /api/devices/{device_id}/control/start` - Start motor (inrush current)
- `POST /api/devices/{device_id}/control/inject-fault` - Inject fault in motor
- `POST /api/devices/{device_id}/control/brightness` - Set lighting brightness

**Grid Context**

- `GET /api/grid` - Carbon intensity and electricity pricing

**Data Streams**

- `GET /api/stream/combined` - Internal + External streams
- `GET /api/stream/internal` - Device data only
- `GET /api/stream/external` - Grid context only

## Pathway Real-Time Processing

### Running Pathway Pipeline

The Pathway pipeline provides real-time stream processing with LLM-powered recommendations:

```bash
# Terminal 1: Start API server
fastapi dev main.py

# Terminal 2: Start Pathway processor
python run_pathway.py
```

### Features

- Real-time anomaly detection
- Device statistics and aggregations
- LLM-powered optimization recommendations using Gemini 2.0 Flash
- Specific, actionable insights with cost and carbon savings

### Pathway Endpoints

- `GET /pathway/recommendations` - Get LLM-generated optimization recommendations
- `GET /pathway/anomalies` - Get detected anomalies
- `GET /pathway/statistics` - Get device statistics
- `GET /pathway/status` - Check if Pathway is running
- `GET /pathway/summary` - Get summary of all results

## Testing

Run the comprehensive test suite:

```bash
# Make sure server is running in one terminal
fastapi dev main.py

# Run tests in another terminal
python tests/simulation_test.py
```

The test suite will:

- Test all API endpoints
- Demonstrate motor startup with two-phase inrush current:
    - Phase 1: Peak hold at 120A for 0.5 seconds
    - Phase 2: Exponential decay to 45A over 3 seconds
- Inject and monitor locked rotor fault (110A sustained)
- Control all devices (HVAC, compressor, lighting)
- Test grid context integration
- Demonstrate economic and carbon awareness scenarios

## Deactivate Virtual Environment

When you're done working:

```bash
deactivate
```
