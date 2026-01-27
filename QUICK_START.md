# Quick Start Guide

## 🚀 Start Everything

```bash
docker compose up --build
```

## 📍 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Application | http://localhost:8888 | - |
| Frontend Direct | http://localhost:3002 | - |
| API Service | http://localhost:5002 | - |
| Auth Service | http://localhost:5001 | - |
| Jenkins | http://localhost:8080 | See setup below |
| SonarQube | http://localhost:9000 | admin/admin |
| Prometheus | http://localhost:9091 | - |
| Grafana | http://localhost:3001 | admin/admin |

## 🔧 Jenkins Initial Setup

1. **Get admin password:**
   ```bash
   # Method 1: Using docker exec
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   
   # Method 2: Using docker compose (if Method 1 doesn't work)
   docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   
   # Method 3: If Jenkins is already configured, check your existing admin account
   ```
   
   **Note:** If you already have Jenkins running on port 8080 (host installation), you need to:
   - Stop the host Jenkins service, OR
   - Use a different port for Docker Jenkins (see JENKINS_PASSWORD.md)

2. **Install plugins:**
   - Docker Pipeline
   - SonarQube Scanner
   - Pipeline
   - Git

3. **Configure SonarQube:**
   - Manage Jenkins → Configure System
   - Add SonarQube server: `http://sonarqube:9000`
   - Generate token in SonarQube UI
   - Add as credential: `sonarqube-token`

4. **Create Pipeline Job:**
   - New Item → Pipeline
   - Pipeline script from SCM
   - Point to your Git repo
   - Script path: `Jenkinsfile`

## 🔍 Verify Services

```bash
# Check all services
docker compose ps

# Check logs
docker compose logs [service-name]

# Check specific service
docker compose logs jenkins
docker compose logs sonarqube
```

## 🛑 Stop Everything

```bash
docker compose down
```

## 📊 Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **cAdvisor**: http://localhost:8081

## 🔒 Security Scanning

Trivy automatically scans images in the Jenkins pipeline. Manual scan:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image [image-name]
```

## 📝 Pipeline Stages

1. Checkout code
2. Install dependencies
3. Run tests
4. SonarQube analysis
5. Build Docker images
6. Trivy security scan
7. Tag images
8. Deploy
9. Health check

## 🐛 Troubleshooting

**Port conflicts?**
- Modify ports in `docker-compose.yml`

**Jenkins can't access Docker?**
- Verify Docker socket is mounted
- Check: `docker exec jenkins docker ps`

**SonarQube not starting?**
- Wait 1-2 minutes for initialization
- Check logs: `docker compose logs sonarqube`
