# Port Mapping Reference

Due to port conflicts on your system, the following ports have been changed:

## Updated Port Mappings

| Service | Original Port | New Port | Access URL |
|---------|-------------|----------|------------|
| Nginx | 80 | **8888** | http://localhost:8888 |
| Frontend | 3000 | **3002** | http://localhost:3002 |
| API Service | 5000 | **5002** | http://localhost:5002 |
| Auth Service | 5001 | 5001 | http://localhost:5001 |
| Jenkins | 8080 | **8082** | http://localhost:8082 |
| Prometheus | 9090 | **9091** | http://localhost:9091 |
| Grafana | 3001 | 3001 | http://localhost:3001 |
| SonarQube | 9000 | 9000 | http://localhost:9000 |
| cAdvisor | 8081 | 8081 | http://localhost:8081 |
| Node Exporter | 9100 | 9100 | http://localhost:9100 |
| MongoDB | 27017 | 27017 | mongodb://localhost:27017 |

## Why Ports Were Changed

- **Port 80**: Often used by other web servers (IIS, Apache, etc.)
- **Port 8080**: Reserved for Jenkins (conflict with Nginx resolved by moving Nginx to 8888)
- **Port 3000**: Commonly used by development servers
- **Port 5000**: May be used by other services
- **Port 8080**: Already in use on your system (conflict detected)
- **Port 9090**: May conflict with other services

## Internal Ports (Unchanged)

Note: Internal container ports remain the same. Only external (host) ports were changed:
- Services still communicate internally using original ports
- Only external access URLs have changed

## Update Your Configuration

If you need to access services from other applications, update URLs to use the new ports.
