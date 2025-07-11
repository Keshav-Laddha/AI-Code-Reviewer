# Direct collaboration service test
$API_BASE = "http://localhost:3001"
$COLLAB_BASE = "http://localhost:3003"

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

# Test collaboration service directly
Write-Host "Testing collaboration service directly..." -ForegroundColor Cyan
try {
    $sessionBody = '{"name":"Test Session","description":"Test description","language":"javascript","isPublic":true}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    
    $response = Invoke-RestMethod -Uri "$COLLAB_BASE/sessions" -Method POST -Body $sessionBody -Headers $headers -TimeoutSec 10
    Write-Host "Direct collaboration service call successful!" -ForegroundColor Green
    Write-Host "Session ID: $($response._id)" -ForegroundColor Gray
} catch {
    Write-Host "Direct collaboration service call failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Check the response for more details
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorDetails = $reader.ReadToEnd()
        Write-Host "Error Details: $errorDetails" -ForegroundColor Red
    }
}
