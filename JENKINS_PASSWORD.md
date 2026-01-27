# Jenkins Admin Password

## Docker Jenkins (Port 8082)

To get the admin password for Jenkins running in Docker:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Or if you can't access via docker exec, try:**

```bash
docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Access Jenkins

- **Docker Jenkins**: http://localhost:8082
- **Host Jenkins** (if installed): http://localhost:8080

## If Password File Doesn't Exist

If Jenkins has already been set up, the initial password file may have been deleted. In that case:

1. Check if you have a Jenkins user account already created
2. If you forgot the password, you can reset it by:
   - Accessing the Jenkins container: `docker exec -it jenkins bash`
   - Or reset the admin user in Jenkins configuration

## Changing Jenkins Port

If you want to use port 8080 for Docker Jenkins instead of 8082:

1. **Stop whatever is using port 8080:**
   ```bash
   # Find what's using port 8080
   netstat -ano | findstr ":8080"
   # Note the PID, then stop that process
   ```

2. **Update docker-compose.yml:**
   Change line 106 from:
   ```yaml
   - "8082:8080"
   ```
   to:
   ```yaml
   - "8080:8080"
   ```

3. **Restart Jenkins:**
   ```bash
   docker compose up -d jenkins
   ```
