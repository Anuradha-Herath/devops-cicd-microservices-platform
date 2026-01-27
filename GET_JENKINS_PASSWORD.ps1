# PowerShell script to get Jenkins admin password

Write-Host "Getting Jenkins admin password..." -ForegroundColor Green

# Try Method 1: docker exec
Write-Host "`nMethod 1: Using docker exec" -ForegroundColor Yellow
try {
    $password = docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Password found:" -ForegroundColor Green
        Write-Host $password -ForegroundColor Cyan
        exit 0
    }
} catch {
    Write-Host "Method 1 failed, trying Method 2..." -ForegroundColor Yellow
}

# Try Method 2: docker compose exec
Write-Host "`nMethod 2: Using docker compose exec" -ForegroundColor Yellow
try {
    $password = docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Password found:" -ForegroundColor Green
        Write-Host $password -ForegroundColor Cyan
        exit 0
    }
} catch {
    Write-Host "Method 2 failed." -ForegroundColor Red
}

# If both methods fail
Write-Host "`nCould not retrieve password automatically." -ForegroundColor Red
Write-Host "`nPossible reasons:" -ForegroundColor Yellow
Write-Host "1. Jenkins container is not running"
Write-Host "2. Jenkins has already been configured (password file deleted)"
Write-Host "3. Docker access issues"
Write-Host "`nTry manually:" -ForegroundColor Yellow
Write-Host "  docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
Write-Host "`nOr if Jenkins is already set up, use your existing admin credentials."
