# Complete test script for all services
$API_BASE = "http://localhost:3001"

Write-Host "=== TESTING ALL SERVICES ===" -ForegroundColor Yellow

# Test 1: Health checks
Write-Host "1. Testing health checks..." -ForegroundColor Cyan
try {
    $apiHealth = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET
    Write-Host "   API Gateway: $($apiHealth.status)" -ForegroundColor Green
    
    $aiHealth = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET
    Write-Host "   AI Service: $($aiHealth.status)" -ForegroundColor Green
    
    $collabHealth = Invoke-RestMethod -Uri "http://localhost:3003/health" -Method GET
    Write-Host "   Collaboration Service: $($collabHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "   Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: User authentication
Write-Host "2. Testing user authentication..." -ForegroundColor Cyan
try {
    $loginBody = '{"email":"testuser@example.com","password":"testpassword123"}'
    $authResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "   Authentication: SUCCESS" -ForegroundColor Green
    $token = $authResponse.token
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "   Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Profile update
Write-Host "3. Testing profile update..." -ForegroundColor Cyan
try {
    $profileBody = '{"preferences":{"theme":"dark","notifications":false}}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $profileResponse = Invoke-RestMethod -Uri "$API_BASE/api/profile" -Method PUT -Body $profileBody -Headers $headers
    Write-Host "   Profile update: SUCCESS" -ForegroundColor Green
    Write-Host "   Theme: $($profileResponse.preferences.theme)" -ForegroundColor Gray
} catch {
    Write-Host "   Profile update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Session creation
Write-Host "4. Testing session creation..." -ForegroundColor Cyan
try {
    $sessionBody = '{"name":"Test Session","description":"Test description","language":"javascript","isPublic":true}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $sessionResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method POST -Body $sessionBody -Headers $headers -TimeoutSec 10
    Write-Host "   Session creation: SUCCESS" -ForegroundColor Green
    Write-Host "   Session ID: $($sessionResponse._id)" -ForegroundColor Gray
    Write-Host "   Session Name: $($sessionResponse.name)" -ForegroundColor Gray
} catch {
    Write-Host "   Session creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get sessions
Write-Host "5. Testing get sessions..." -ForegroundColor Cyan
try {
    $headers = @{"Authorization" = "Bearer $token"}
    $sessionsResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method GET -Headers $headers
    Write-Host "   Get sessions: SUCCESS" -ForegroundColor Green
    Write-Host "   Total sessions: $($sessionsResponse.sessions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   Get sessions failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: AI Review
Write-Host "6. Testing AI review..." -ForegroundColor Cyan
try {
    $codeBody = '{"code":"function hello() { console.log(\"Hello World\"); }","language":"javascript","fileName":"test.js"}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $reviewResponse = Invoke-RestMethod -Uri "$API_BASE/api/ai/review" -Method POST -Body $codeBody -Headers $headers -TimeoutSec 15
    Write-Host "   AI Review: SUCCESS" -ForegroundColor Green
    Write-Host "   Overall Score: $($reviewResponse.overall_score)" -ForegroundColor Gray
    Write-Host "   Summary: $($reviewResponse.summary)" -ForegroundColor Gray
} catch {
    Write-Host "   AI Review failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ALL TESTS COMPLETED ===" -ForegroundColor Green
