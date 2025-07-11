# Session test script
$API_BASE = "http://localhost:3001"

# Login first
Write-Host "Getting authentication token..." -ForegroundColor Yellow
try {
    $loginBody = '{"email":"testuser@example.com","password":"testpassword123"}'
    $response = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    $token = $response.token
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test session creation with timeout
Write-Host "Testing session creation..." -ForegroundColor Cyan
try {
    $sessionBody = '{"name":"Test Session","description":"Test description","language":"javascript","isPublic":true}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    
    # Use shorter timeout
    $response = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method POST -Body $sessionBody -Headers $headers -TimeoutSec 10
    Write-Host "Session creation successful!" -ForegroundColor Green
    Write-Host "Session ID: $($response._id)" -ForegroundColor Gray
} catch {
    Write-Host "Session creation failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Check if it's a timeout or other error
    if ($_.Exception.Message -like "*timeout*") {
        Write-Host "This appears to be a timeout issue with the collaboration service" -ForegroundColor Yellow
    }
}
