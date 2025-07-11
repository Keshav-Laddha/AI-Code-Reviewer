# Quick session test
$API_BASE = "http://localhost:3001"

# Get token
$loginBody = '{"email":"testuser@example.com","password":"testpassword123"}'
$authResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $authResponse.token

Write-Host "Testing session creation with fresh token..." -ForegroundColor Yellow
Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Gray

# Test session creation
$sessionBody = '{"name":"Quick Test Session","description":"Quick test","language":"javascript","isPublic":true}'
$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}

try {
    $sessionResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method POST -Body $sessionBody -Headers $headers -TimeoutSec 5
    Write-Host "Session creation: SUCCESS" -ForegroundColor Green
    Write-Host "Session ID: $($sessionResponse._id)" -ForegroundColor Gray
} catch {
    Write-Host "Session creation failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try direct to collaboration service
    Write-Host "Trying direct to collaboration service..." -ForegroundColor Yellow
    try {
        $directResponse = Invoke-RestMethod -Uri "http://localhost:3003/sessions" -Method POST -Body $sessionBody -Headers $headers -TimeoutSec 5
        Write-Host "Direct session creation: SUCCESS" -ForegroundColor Green
        Write-Host "Session ID: $($directResponse._id)" -ForegroundColor Gray
    } catch {
        Write-Host "Direct session creation also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
