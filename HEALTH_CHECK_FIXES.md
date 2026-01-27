# Health Check Issues - Root Cause Analysis & Fixes

## Problems Identified

### 1. **Unhealthy Services** ❌
- **auth-service**: Showing as "unhealthy" 
- **api-service**: Showing as "unhealthy"
- **Impact**: nginx container cannot start because it depends on these services being healthy

### 2. **Root Cause: Health Check Command Issues**
- **Problem**: The inline Node.js health check command was too complex and had syntax issues
- **Original command**: 
  ```yaml
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  ```
- **Issues**:
  - No error handling for network failures
  - No timeout handling
  - Complex one-liner prone to syntax errors
  - Not waiting for response data

### 3. **Dependency Chain Failure**
- nginx depends on:
  - `api-service` (condition: service_healthy) ❌
  - `auth-service` (condition: service_healthy) ❌
- Since both services are unhealthy, nginx cannot start

## Fixes Applied

### 1. **Created Dedicated Health Check Scripts**
- Created `api-service/healthcheck.js`
- Created `auth-service/healthcheck.js`
- These scripts properly handle:
  - HTTP requests with timeouts
  - Error handling
  - Response status code checking
  - Proper exit codes

### 2. **Updated Health Check Commands**
- Changed from complex one-liner to simple script execution:
  ```yaml
  test: ["CMD", "node", "healthcheck.js"]
  ```

### 3. **Increased Start Period**
- Changed `start_period` from `10s` to `30s`
- Gives services more time to fully start before health checks begin

## Health Check Script Details

### api-service/healthcheck.js
```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();

setTimeout(() => {
  req.destroy();
  process.exit(1);
}, 5000);
```

### auth-service/healthcheck.js
- Same as above but uses port 5001

## How to Apply Fixes

1. **Rebuild the services:**
   ```powershell
   docker compose build api-service auth-service
   ```

2. **Restart the services:**
   ```powershell
   docker compose up -d api-service auth-service
   ```

3. **Wait for health checks to pass:**
   ```powershell
   docker compose ps
   ```
   Wait until both services show as "healthy"

4. **Start nginx:**
   ```powershell
   docker compose up -d nginx
   ```

5. **Or restart everything:**
   ```powershell
   docker compose down
   docker compose up -d --build
   ```

## Verification

1. **Check service health:**
   ```powershell
   docker compose ps
   ```
   Both `api-service` and `auth-service` should show "(healthy)"

2. **Test health endpoints directly:**
   ```powershell
   curl http://localhost:5002/health
   curl http://localhost:5001/health
   ```
   Both should return: `{"status":"ok"}`

3. **Check nginx is running:**
   ```powershell
   docker compose ps nginx
   ```
   Should show "Up" status

4. **Test through nginx:**
   ```powershell
   curl http://localhost:8888/api/health
   curl http://localhost:8888/auth/health
   ```

## Expected Status After Fix

All containers should be running:
- ✅ mongodb (healthy)
- ✅ api-service (healthy) - **FIXED**
- ✅ auth-service (healthy) - **FIXED**
- ✅ frontend (running)
- ✅ nginx (running) - **Should start now**
- ✅ jenkins (healthy)
- ✅ prometheus (running)
- ✅ grafana (running)
- ✅ cadvisor (healthy)
- ✅ node-exporter (running)
- ✅ sonarqube (healthy)

## Troubleshooting

If services are still unhealthy:

1. **Check service logs:**
   ```powershell
   docker compose logs api-service
   docker compose logs auth-service
   ```

2. **Manually test health endpoint:**
   ```powershell
   docker exec api-service node healthcheck.js
   docker exec auth-service node healthcheck.js
   ```

3. **Check if services are listening:**
   ```powershell
   docker exec api-service netstat -tuln | grep 5000
   docker exec auth-service netstat -tuln | grep 5001
   ```

4. **Increase start_period if needed:**
   - If services take longer to start, increase `start_period` in docker-compose.yml
