# Direct service test to bypass proxy
Write-Host "=== DIRECT SERVICE TESTING ===" -ForegroundColor Yellow

# Get authentication token
$loginBody = '{"email":"testuser@example.com","password":"testpassword123"}'
$authResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $authResponse.token
Write-Host "Got token: $($token.Substring(0, 20))..." -ForegroundColor Green

# Test AI Service directly
Write-Host "`n1. Testing AI Service directly..." -ForegroundColor Cyan
try {
    $codeBody = '{"code":"function hello() { console.log(\"Hello World\"); }","language":"javascript","fileName":"test.js"}'
    $response = Invoke-RestMethod -Uri "http://localhost:3002/review" -Method POST -Body $codeBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "   AI Service (direct): SUCCESS" -ForegroundColor Green
    Write-Host "   Summary: $($response.summary)" -ForegroundColor Gray
} catch {
    Write-Host "   AI Service (direct): FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Collaboration Service directly
Write-Host "`n2. Testing Collaboration Service directly..." -ForegroundColor Cyan
try {
    $sessionBody = '{"name":"Direct Test Session","description":"Direct test","language":"javascript","isPublic":true}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "http://localhost:3003/sessions" -Method POST -Body $sessionBody -Headers $headers -TimeoutSec 10
    Write-Host "   Collaboration Service (direct): SUCCESS" -ForegroundColor Green
    Write-Host "   Session ID: $($response._id)" -ForegroundColor Gray
} catch {
    Write-Host "   Collaboration Service (direct): FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test AI Service via proxy
Write-Host "`n3. Testing AI Service via proxy..." -ForegroundColor Cyan
try {
    $codeBody = '{"code":"function hello() { console.log(\"Hello World\"); }","language":"javascript","fileName":"test.js"}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/ai/review" -Method POST -Body $codeBody -Headers $headers -TimeoutSec 10
    Write-Host "   AI Service (proxy): SUCCESS" -ForegroundColor Green
    Write-Host "   Summary: $($response.summary)" -ForegroundColor Gray
} catch {
    Write-Host "   AI Service (proxy): FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Collaboration Service via proxy
Write-Host "`n4. Testing Collaboration Service via proxy..." -ForegroundColor Cyan
try {
    $sessionBody = '{"name":"Proxy Test Session","description":"Proxy test","language":"javascript","isPublic":true}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/collaboration/sessions" -Method POST -Body $sessionBody -Headers $headers -TimeoutSec 10
    Write-Host "   Collaboration Service (proxy): SUCCESS" -ForegroundColor Green
    Write-Host "   Session ID: $($response._id)" -ForegroundColor Gray
} catch {
    Write-Host "   Collaboration Service (proxy): FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== DIRECT SERVICE TESTING COMPLETED ===" -ForegroundColor Green
