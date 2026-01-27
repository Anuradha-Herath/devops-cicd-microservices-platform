# Enterprise DevOps CI/CD Platform

A production-ready microservices project with full enterprise-grade DevOps CI/CD pipeline automation using Jenkins, SonarQube, Trivy, Prometheus, and Grafana.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Access                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Nginx (Port 80)                         │
│                    Reverse Proxy & Load Balancer                │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │ API Service  │    │Auth Service  │
│  (Next.js)   │    │  (Node.js)   │    │  (Node.js)   │
│   Port 3000  │    │   Port 5000  │    │  Port 5001   │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    │  Port 27017  │
                    └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CI/CD & Quality                            │
├─────────────────────────────────────────────────────────────────┤
│  Jenkins (8080)  │  SonarQube (9000)  │  Trivy (in pipeline)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Monitoring Stack                          │
├─────────────────────────────────────────────────────────────────┤
│  Prometheus (9091)  │  Grafana (3001)  │  cAdvisor  │  Node Exporter │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
devops-cicd/
├── frontend/                    # Next.js application
│   ├── app/
│   ├── Dockerfile
│   └── package.json
├── api-service/                 # REST API service
│   ├── server.js
│   ├── test.js
│   ├── Dockerfile
│   └── package.json
├── auth-service/                # Authentication service
│   ├── server.js
│   ├── test.js
│   ├── Dockerfile
│   └── package.json
├── nginx/                       # Nginx reverse proxy
│   ├── nginx.conf
│   └── Dockerfile
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml       # Prometheus configuration
│   └── grafana/
│       └── provisioning/        # Grafana datasource configs
├── jenkins/                     # Jenkins configuration (optional)
├── docker-compose.yml           # All services orchestration
├── Jenkinsfile                  # CI/CD pipeline definition
└── README.md                    # This file
```

## Services and Ports

### Application Services

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| Frontend | 3000 | 3002 | Next.js application |
| API Service | 5000 | 5002 | REST API endpoints |
| Auth Service | 5001 | 5001 | Authentication endpoints |
| MongoDB | 27017 | 27017 | Database |
| Nginx | 80 | 8888 | Reverse proxy (main entry point) |

### DevOps & CI/CD Services

| Service | Port | Description |
|---------|------|-------------|
| Jenkins | 8080 | CI/CD automation server |
| SonarQube | 9000 | Code quality analysis |

### Monitoring Services

| Service | Port | Description |
|---------|------|-------------|
| Prometheus | 9091 | Metrics collection & storage |
| Grafana | 3001 | Metrics visualization & dashboards |
| cAdvisor | 8081 | Container metrics |
| Node Exporter | 9100 | Host system metrics |

## Quick Start

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 8GB RAM (for all services)
- Git (for Jenkins pipeline)

### Starting the Full Platform

1. **Clone or navigate to the project directory:**
   ```bash
   cd devops-cicd
   ```

2. **Start all services:**
   ```bash
   docker compose up --build
   ```

   This will start:
   - All microservices (frontend, api-service, auth-service, mongodb, nginx)
   - Jenkins CI/CD server
   - SonarQube code quality server
   - Prometheus monitoring
   - Grafana dashboards
   - cAdvisor and Node Exporter

3. **Access the services:**
   - **Application**: http://localhost:8888 (via Nginx)
   - **Frontend directly**: http://localhost:3002
   - **API Service**: http://localhost:5002
   - **Auth Service**: http://localhost:5001
   - **Jenkins**: http://localhost:8080
   - **SonarQube**: http://localhost:9000 (default: admin/admin)
   - **Prometheus**: http://localhost:9091
   - **Grafana**: http://localhost:3001 (default: admin/admin)
   - **cAdvisor**: http://localhost:8081

### Stopping the Platform

```bash
docker compose down
```

To remove all volumes (including data):
```bash
docker compose down -v
```

## Jenkins CI/CD Pipeline

### Initial Jenkins Setup

1. **Access Jenkins:**
   - Open http://localhost:8888
   - Get initial admin password:
     ```bash
     docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
     ```

2. **Install Required Plugins:**
   - Go to "Manage Jenkins" → "Manage Plugins"
   - Install:
     - Docker Pipeline
     - SonarQube Scanner
     - Pipeline
     - Git

3. **Configure SonarQube:**
   - Go to "Manage Jenkins" → "Configure System"
   - Add SonarQube servers:
     - Name: `SonarQube`
     - Server URL: `http://sonarqube:9000`
   - Generate token in SonarQube (http://localhost:9000) → My Account → Security
   - Add token as credential in Jenkins:
     - Kind: Secret text
     - Secret: [your-sonarqube-token]
     - ID: `sonarqube-token`

4. **Configure Docker:**
   - Jenkins container has Docker socket mounted
   - Docker commands work directly in pipeline

### Pipeline Stages

The Jenkinsfile defines a complete CI/CD pipeline with the following stages:

1. **Checkout**: Retrieves code from Git repository
2. **Install Dependencies**: Installs npm packages for all services
3. **Run Tests**: Executes test suites for each service
4. **SonarQube Analysis**: Performs code quality scanning
5. **Build Docker Images**: Builds all Docker images
6. **Trivy Security Scan**: Scans images for vulnerabilities (fails on HIGH/CRITICAL)
7. **Tag Images**: Tags images with commit ID
8. **Deploy**: Deploys using docker compose
9. **Health Check**: Verifies all services are healthy

### Running the Pipeline

**Option 1: Using Jenkins UI**
1. Create a new Pipeline job in Jenkins
2. Select "Pipeline script from SCM"
3. Point to your Git repository
4. Set script path to `Jenkinsfile`
5. Run the pipeline

**Option 2: Using Jenkins CLI**
```bash
docker exec jenkins jenkins-cli create-job devops-pipeline < Jenkinsfile
```

### Pipeline Features

- **Parallel Execution**: Tests run in parallel for faster execution
- **Security Scanning**: Trivy scans all images before deployment
- **Quality Gates**: SonarQube analysis ensures code quality
- **Automatic Deployment**: Deploys on successful pipeline
- **Health Checks**: Verifies deployment success
- **Artifact Archiving**: Saves Trivy scan reports

## Monitoring

### Prometheus

- **URL**: http://localhost:9090
- **Metrics Endpoints**:
  - cAdvisor: Container metrics
  - Node Exporter: Host metrics
  - Service endpoints: Application metrics (if instrumented)

### Grafana

- **URL**: http://localhost:3001
- **Default Credentials**: admin/admin
- **Pre-configured**: Prometheus datasource
- **Dashboards**: Create custom dashboards or import from Grafana community

### Key Metrics to Monitor

- Container CPU/Memory usage (cAdvisor)
- Host system metrics (Node Exporter)
- Application health endpoints
- Service response times
- Error rates

## Code Quality with SonarQube

### Accessing SonarQube

1. Navigate to http://localhost:9000
2. Login with default credentials: `admin/admin`
3. Change password on first login

### SonarQube Analysis

The Jenkins pipeline automatically runs SonarQube analysis on every build. Results include:

- Code coverage
- Code smells
- Security vulnerabilities
- Technical debt
- Code duplication

### Manual Analysis

```bash
docker run --rm \
  -v $(pwd):/usr/src \
  -w /usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=devops-cicd \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN
```

## Security Scanning with Trivy

Trivy is integrated into the Jenkins pipeline and automatically scans all Docker images for:

- Known vulnerabilities (CVE)
- Misconfigurations
- Secrets exposure
- License compliance

### Pipeline Behavior

- **PASS**: No HIGH or CRITICAL vulnerabilities
- **FAIL**: HIGH or CRITICAL vulnerabilities detected
- **Reports**: Saved as artifacts in Jenkins

### Manual Scanning

```bash
# Scan a Docker image
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image api-service:latest

# Scan with specific severity
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image --severity HIGH,CRITICAL api-service:latest
```

## API Endpoints

### API Service (via Nginx: `/api`)

- `GET /api/health` - Health check endpoint
- `GET /api/products` - Get list of products

### Auth Service (via Nginx: `/auth`)

- `GET /auth/health` - Health check endpoint
- `POST /auth/login` - Login endpoint (dummy authentication)

## Environment Variables

### API Service
- `PORT`: Service port (default: 5000)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://mongodb:27017)
- `DB_NAME`: Database name (default: devops_db)

### Auth Service
- `PORT`: Service port (default: 5001)

### Frontend
- `PORT`: Service port (default: 3000)
- `NODE_ENV`: Environment (production)
- `API_SERVICE_HOST`: API service hostname
- `API_SERVICE_PORT`: API service port
- `AUTH_SERVICE_HOST`: Auth service hostname
- `AUTH_SERVICE_PORT`: Auth service port

### Jenkins
- `DOCKER_HOST`: Docker socket path

### Grafana
- `GF_SECURITY_ADMIN_USER`: Admin username (default: admin)
- `GF_SECURITY_ADMIN_PASSWORD`: Admin password (default: admin)

## Development

### Running Services Individually

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**API Service:**
```bash
cd api-service
npm install
npm run dev
```

**Auth Service:**
```bash
cd auth-service
npm install
npm run dev
```

### Running Tests

**API Service:**
```bash
cd api-service
npm test
```

**Auth Service:**
```bash
cd auth-service
npm test
```

## Troubleshooting

### Services not starting

1. Check Docker logs:
   ```bash
   docker compose logs [service-name]
   ```

2. Verify all services are running:
   ```bash
   docker compose ps
   ```

3. Rebuild services:
   ```bash
   docker compose up --build --force-recreate
   ```

### Jenkins Docker access issues

- Ensure Docker socket is mounted: `/var/run/docker.sock`
- Verify Jenkins user has Docker permissions
- Check Jenkins logs: `docker compose logs jenkins`

### SonarQube not accessible

- Wait for SonarQube to fully start (may take 1-2 minutes)
- Check logs: `docker compose logs sonarqube`
- Verify port 9000 is not in use

### Prometheus not scraping metrics

- Check Prometheus targets: http://localhost:9091/targets
- Verify service names match in `prometheus.yml`
- Check network connectivity: `docker network inspect devops-cicd_microservices-network`

### Port conflicts

If ports are already in use, modify port mappings in `docker-compose.yml`.

## Production Considerations

- **Security**: Change all default passwords
- **Secrets Management**: Use Docker secrets or external secret managers
- **Backup**: Configure backups for Jenkins, SonarQube, and MongoDB volumes
- **Resource Limits**: Add resource limits to docker-compose.yml
- **SSL/TLS**: Configure reverse proxy with SSL certificates
- **High Availability**: Consider multi-node setups for production
- **Monitoring Alerts**: Configure Prometheus alerting rules
- **Log Aggregation**: Add ELK stack or similar for centralized logging

## License

This project is for educational and demonstration purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the Jenkins pipeline
5. Submit a pull request
