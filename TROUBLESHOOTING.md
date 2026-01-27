# Troubleshooting Guide

## Port Conflicts - RESOLVED

Port conflicts have been resolved by changing the following ports:

- **Nginx**: 80 → **8888** (changed to avoid conflict with Jenkins on 8080)
- **Frontend**: 3000 → **3002**
- **API Service**: 5000 → **5002**
- **Jenkins**: 8080 → **8082**
- **Prometheus**: 9090 → **9091**

## Starting Containers

After port changes, restart all containers:

```bash
# Stop all containers
docker compose down

# Remove old containers
docker compose rm -f

# Start with new port mappings
docker compose up --build -d
```

## Verify All Services Are Running

```bash
# Check status
docker compose ps

# All services should show "Up" status
```

## Common Issues

### 1. Containers Still Not Starting

**Check logs:**
```bash
docker compose logs [service-name]
```

**Common causes:**
- Port still in use: Check with `netstat -ano | findstr ":PORT"`
- Docker socket access: On Windows, ensure Docker Desktop is running
- Insufficient resources: Check Docker Desktop resource allocation

### 2. Jenkins Docker Access Issues

**On Windows:**
- Ensure Docker Desktop is running
- Jenkins container has Docker socket mounted
- Verify: `docker exec jenkins docker ps`

**If issues persist:**
- Restart Docker Desktop
- Restart Jenkins container: `docker compose restart jenkins`

### 3. Prometheus Not Scraping

**Check targets:**
- Open: http://localhost:9091/targets
- All targets should show "UP" status

**If targets are down:**
- Verify service names in `prometheus.yml` match container names
- Check network: `docker network inspect devops-cicd_microservices-network`

### 4. Services Not Accessible

**Check if ports are actually listening:**
```bash
netstat -ano | findstr ":8888 :3002 :5002 :8080 :9091"
```

**Verify container is running:**
```bash
docker compose ps
```

### 5. Windows-Specific Issues

**Docker Socket:**
- On Windows, Docker Desktop uses named pipe: `//./pipe/dockerDesktopLinuxEngine`
- The docker-compose.yml uses Unix socket path (works in WSL2/Docker Desktop)
- If issues occur, ensure Docker Desktop is using WSL2 backend

**File Paths:**
- Volume mounts use relative paths (should work)
- If issues, use absolute paths in docker-compose.yml

## Health Checks

**Check individual service health:**
```bash
# API Service
curl http://localhost:5002/health

# Auth Service
curl http://localhost:5001/health

# Frontend
curl http://localhost:3002

# Jenkins
curl http://localhost:8082/login

# Prometheus
curl http://localhost:9091/-/healthy
```

## Reset Everything

If you need to completely reset:

```bash
# Stop and remove all containers
docker compose down -v

# Remove all images (optional)
docker compose down --rmi all

# Start fresh
docker compose up --build
```

## Port Reference

See `PORT_MAPPING.md` for complete port reference.
