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

## CI/CD Integration

This project is designed for CI/CD pipeline automation:

- **Jenkins**: Build and deploy automation
- **Docker**: Containerization
- **Prometheus**: Metrics collection (to be configured)
- **Grafana**: Monitoring dashboards (to be configured)

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
