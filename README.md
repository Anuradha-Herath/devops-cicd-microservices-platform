# Microservices DevOps CI/CD Project

A production-style microservices project designed for DevOps CI/CD pipeline automation with Jenkins, Docker, Prometheus, and Grafana.

## Architecture

This project consists of the following microservices:

- **Frontend**: Next.js React application
- **API Service**: Node.js Express REST API
- **Auth Service**: Node.js Express authentication service
- **MongoDB**: Database for storing products
- **Nginx**: Reverse proxy for routing requests

## Project Structure

```
devops-project/
├── frontend/           # Next.js application
├── api-service/        # REST API service
├── auth-service/       # Authentication service
├── nginx/              # Nginx reverse proxy configuration
├── jenkins/            # Jenkins Dockerfile and configuration
├── Jenkinsfile         # Jenkins CI/CD pipeline definition
├── docker-compose.yml  # Docker Compose configuration
└── README.md          # This file
```

## Services and Ports

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| Frontend | 3000 | 3000 | Next.js application |
| API Service | 5000 | 5000 | REST API endpoints |
| Auth Service | 5001 | 5001 | Authentication endpoints |
| MongoDB | 27017 | 27017 | Database |
| Nginx | 80 | 80 | Reverse proxy (main entry point) |
| Jenkins | 8080 | 8081 | CI/CD automation server |

## API Endpoints

### API Service (via Nginx: `/api`)

- `GET /api/health` - Health check endpoint
- `GET /api/products` - Get list of products

### Auth Service (via Nginx: `/auth`)

- `GET /auth/health` - Health check endpoint
- `POST /auth/login` - Login endpoint (dummy authentication)

## Quick Start

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Running the Project

1. Clone or navigate to the project directory:
   ```bash
   cd devops-project
   ```

2. Build and start all services:
   ```bash
   docker compose up --build
   ```

3. Access the application:
   - Frontend via Nginx: http://localhost
   - Frontend directly: http://localhost:3000
   - API Service: http://localhost:5000
   - Auth Service: http://localhost:5001
   - Jenkins: http://localhost:8081

### Stopping the Project

```bash
docker compose down
```

To remove volumes (including MongoDB data):
```bash
docker compose down -v
```

## Service Details

### Frontend

- Built with Next.js 14
- Displays service health status
- Fetches and displays products from API service
- Uses standalone output for optimized Docker builds

### API Service

- Express.js REST API
- Connects to MongoDB for product storage
- Falls back to in-memory products if MongoDB is unavailable
- Automatically initializes sample products on first run

### Auth Service

- Express.js authentication service
- Provides dummy authentication (accepts any username/password)
- Returns dummy tokens for demonstration purposes

### MongoDB

- Stores product data
- Persistent volume for data storage
- Health checks ensure service is ready before dependent services start

### Nginx

- Reverse proxy routing:
  - `/` → Frontend
  - `/api/*` → API Service
  - `/auth/*` → Auth Service

## Docker Configuration

- Each service has its own Dockerfile with multi-stage builds
- Production-optimized containers (no dev dependencies)
- Health checks for service dependencies
- Shared Docker network for service communication
- Environment variables for configuration

## Development

### Running Services Individually

Each service can be run independently for development:

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

## Jenkins CI/CD Pipeline

This project includes a fully automated Jenkins CI/CD pipeline for building, testing, and deploying the microservices stack.

### Jenkins Setup

#### 1. Start Jenkins

Jenkins is included in the `docker-compose.yml` file. To start Jenkins along with all services:

```bash
docker compose up --build
```

Or to start only Jenkins:

```bash
docker compose up jenkins --build
```

#### 2. Unlock Jenkins

1. Access Jenkins at http://localhost:8081
2. You'll see the "Unlock Jenkins" page
3. Get the initial admin password:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
4. Copy the password and paste it into the Jenkins unlock page
5. Click "Continue"

#### 3. Install Suggested Plugins

1. On the "Customize Jenkins" page, click "Install suggested plugins"
2. Wait for plugins to install
3. Create an admin user (or skip and continue as admin)
4. Click "Save and Finish"
5. Click "Start using Jenkins"

#### 4. Create Pipeline Job

1. Click "New Item" on the Jenkins dashboard
2. Enter a name for your pipeline (e.g., "microservices-cicd")
3. Select "Pipeline" as the job type
4. Click "OK"

#### 5. Configure Pipeline

1. Scroll down to the "Pipeline" section
2. In "Definition", select "Pipeline script from SCM"
3. Select "Git" as SCM
4. Enter your repository URL (or use local path)
   - For local repository: Use "File" SCM or configure Git path
   - For GitHub: Enter repository URL
5. In "Script Path", enter: `Jenkinsfile`
6. Click "Save"

#### 6. Run Pipeline

1. Click "Build Now" on the pipeline job page
2. Click on the build number in the "Build History" to view progress
3. Click "Console Output" to see detailed logs

### Pipeline Stages

The Jenkins pipeline (`Jenkinsfile`) includes the following stages:

1. **Checkout**: Retrieves code from the repository
2. **Build**: Builds all Docker images using `docker compose build`
3. **Test**: Runs basic validation tests on services
4. **Lint**: Runs ESLint for Node.js services (if configured)
5. **Security Scan**: Optional Trivy security scanning (if available)
6. **Deploy**: Deploys the full stack using `docker compose up -d`

### Pipeline Features

- **Declarative Pipeline**: Uses Jenkins declarative pipeline syntax
- **Environment Variables**: Configurable build environment
- **Docker Integration**: Jenkins has full access to Docker and docker-compose
- **Post Actions**: Success/failure notifications and cleanup
- **Health Checks**: Validates service deployment

### Jenkins Configuration

Jenkins is configured with:
- **Docker CLI**: Installed in Jenkins container
- **Docker Compose**: Installed and available
- **Docker Socket**: Mounted from host for Docker access
- **Persistent Storage**: Jenkins data stored in `jenkins_home` volume
- **Plugins**: Pre-installed with essential plugins (Blue Ocean, Docker, Git, etc.)

### Accessing Jenkins

- **Web UI**: http://localhost:8081
- **Jenkins CLI Port**: 50000 (for agent connections)

### Jenkins Data Persistence

Jenkins data is persisted in a Docker volume (`jenkins_home`). To backup or restore:

```bash
# Backup Jenkins data
docker run --rm -v devops-cicd_jenkins_home:/data -v $(pwd):/backup alpine tar czf /backup/jenkins-backup.tar.gz /data

# Restore Jenkins data
docker run --rm -v devops-cicd_jenkins_home:/data -v $(pwd):/backup alpine tar xzf /backup/jenkins-backup.tar.gz -C /
```

### Running Pipeline Manually

You can also trigger the pipeline manually from command line:

```bash
# From Jenkins container
docker exec jenkins jenkins-cli build microservices-cicd

# Or using curl
curl -X POST http://localhost:8081/job/microservices-cicd/build --user admin:password
```

### Pipeline Environment Variables

The pipeline uses these environment variables:
- `COMPOSE_PROJECT_NAME`: Docker Compose project name
- `DOCKER_BUILDKIT`: Enable Docker BuildKit
- `COMPOSE_DOCKER_CLI_BUILD`: Use Docker CLI for builds

### Troubleshooting Jenkins

#### Jenkins won't start
```bash
# Check Jenkins logs
docker compose logs jenkins

# Verify Docker socket access
docker exec jenkins docker ps
```

#### Pipeline fails at Docker commands
```bash
# Verify Docker is accessible from Jenkins
docker exec jenkins docker --version
docker exec jenkins docker-compose --version

# Check Docker socket permissions
ls -la /var/run/docker.sock
```

#### Cannot access Jenkins web UI
- Verify Jenkins container is running: `docker compose ps`
- Check if port 8081 is available: `netstat -an | grep 8081`
- View Jenkins logs: `docker compose logs jenkins`

## CI/CD Integration

This project is designed for CI/CD pipeline automation:

- **Jenkins**: Build and deploy automation (✅ Configured)
- **Docker**: Containerization (✅ Configured)
- **Docker Compose**: Multi-container orchestration (✅ Configured)

## Notes

- All services use health checks for reliable startup
- MongoDB data persists in a Docker volume
- Services communicate via Docker network (no external exposure required)
- Nginx serves as the main entry point on port 80

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

### MongoDB connection issues

- Ensure MongoDB health check passes before API service starts
- Check MongoDB logs: `docker compose logs mongodb`
- Verify network connectivity: `docker network inspect devops-project_microservices-network`

### Port conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`.
