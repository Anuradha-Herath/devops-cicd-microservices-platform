# Container Startup Issues - Root Cause Analysis & Fixes

## Root Causes Identified

### 1. **Port 8080 Conflict** (PRIMARY ISSUE)
- **Problem**: Jenkins was trying to bind to port 8080, but it was already in use by process ID 26432
- **Error**: `bind: Only one usage of each socket address (protocol/network address/port) is normally permitted`
- **Impact**: Jenkins container failed to start, potentially causing cascading failures
- **Fix**: Changed Jenkins external port from `8080:8080` to `8082:8080`
  - Jenkins will now be accessible at `http://localhost:8082`

### 2. **Container Dependency Issues**
- **Problem**: Some containers were using simple `depends_on` without health check conditions
- **Impact**: Containers might start before dependencies are ready
- **Fix**: Updated dependencies to use proper conditions:
  - `service_started`: Container has started
  - `service_healthy`: Container has passed health checks

### 3. **Volume Mount Permissions**
- **Problem**: Some volume mounts weren't marked as read-only where appropriate
- **Fix**: Added `:ro` (read-only) flag to configuration file mounts

## Containers Status After Fixes

### Running Containers ✅
- `mongodb` - Database (port 27017)
- `cadvisor` - Container metrics (port 8081)
- `sonarqube` - Code quality (port 9000)
- `node-exporter` - Host metrics (port 9100)
- `auth-service` - Auth service (port 5001)

### Containers That Should Start Now ✅
- `jenkins` - CI/CD (port 8082) - **FIXED: Port conflict resolved**
- `api-service` - API service (port 5002) - Should start after MongoDB is healthy
- `prometheus` - Monitoring (port 9091) - Should start after cadvisor and node-exporter
- `grafana` - Visualization (port 3001) - Should start after Prometheus
- `frontend` - Frontend app (port 3002) - Should start after API and Auth services
- `nginx` - Reverse proxy (port 8888) - Should start after all services

## How to Restart Everything

```powershell
# Stop all containers
docker compose down

# Remove any conflicting containers
docker rm -f jenkins api-service prometheus grafana frontend nginx 2>$null

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs for any failing services
docker compose logs [service-name]
```

## Port Mapping Reference

| Service | External Port | Internal Port | URL |
|---------|--------------|---------------|-----|
| Jenkins | 8082 | 8080 | http://localhost:8082 |
| Nginx | 8888 | 80 | http://localhost:8888 |
| Frontend | 3002 | 3000 | http://localhost:3002 |
| Grafana | 3001 | 3000 | http://localhost:3001 |
| API Service | 5002 | 5000 | http://localhost:5002 |
| Auth Service | 5001 | 5001 | http://localhost:5001 |
| Prometheus | 9091 | 9090 | http://localhost:9091 |
| SonarQube | 9000 | 9000 | http://localhost:9000 |
| cAdvisor | 8081 | 8080 | http://localhost:8081 |
| Node Exporter | 9100 | 9100 | http://localhost:9100 |
| MongoDB | 27017 | 27017 | mongodb://localhost:27017 |

## Verification Steps

1. **Check all containers are running:**
   ```powershell
   docker compose ps
   ```
   All services should show "Up" status

2. **Check Jenkins:**
   ```powershell
   curl http://localhost:8082/login
   ```

3. **Check API Service:**
   ```powershell
   curl http://localhost:5002/health
   ```

4. **Check Nginx (should route to services):**
   ```powershell
   curl http://localhost:8888/api/health
   curl http://localhost:8888/auth/health
   ```

5. **Check Prometheus:**
   ```powershell
   curl http://localhost:9091/-/healthy
   ```

6. **Check Grafana:**
   ```powershell
   curl http://localhost:3001/api/health
   ```

## If Issues Persist

1. **Check logs:**
   ```powershell
   docker compose logs [service-name]
   ```

2. **Check for port conflicts:**
   ```powershell
   netstat -ano | findstr :[port-number]
   ```

3. **Restart specific service:**
   ```powershell
   docker compose restart [service-name]
   ```

4. **Rebuild and restart:**
   ```powershell
   docker compose up --build -d [service-name]
   ```
