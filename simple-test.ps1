# Simple test script for API endpoints
$API_BASE = "http://localhost:3001"

Write-Host "Testing API endpoints..." -ForegroundColor Yellow

# Test user registration
Write-Host "1. Testing user registration..." -ForegroundColor Cyan
try {
    $registerBody = '{"email":"testuser@example.com","password":"testpassword123","name":"Test User"}'
    $response = Invoke-RestMethod -Uri "$API_BASE/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "   Registration successful!" -ForegroundColor Green
    $token = $response.token
} catch {
    Write-Host "   Registration failed, trying login..." -ForegroundColor Yellow
    try {
        $loginBody = '{"email":"testuser@example.com","password":"testpassword123"}'
        $response = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        Write-Host "   Login successful!" -ForegroundColor Green
        $token = $response.token
    } catch {
        Write-Host "   Both registration and login failed!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

# Test profile update
Write-Host "2. Testing profile update..." -ForegroundColor Cyan
try {
    $profileBody = '{"preferences":{"theme":"dark","notifications":false}}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "$API_BASE/api/profile" -Method PUT -Body $profileBody -Headers $headers
    Write-Host "   Profile update successful!" -ForegroundColor Green
    Write-Host "   Theme: $($response.preferences.theme)" -ForegroundColor Gray
} catch {
    Write-Host "   Profile update failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test session creation
Write-Host "3. Testing session creation..." -ForegroundColor Cyan
try {
    $sessionBody = '{"name":"Test Session","description":"Test description","language":"javascript","isPublic":true}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method POST -Body $sessionBody -Headers $headers
    Write-Host "   Session creation successful!" -ForegroundColor Green
    Write-Host "   Session ID: $($response._id)" -ForegroundColor Gray
    Write-Host "   Session Name: $($response.name)" -ForegroundColor Gray
} catch {
    Write-Host "   Session creation failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test get sessions
Write-Host "4. Testing get sessions..." -ForegroundColor Cyan
try {
    $headers = @{"Authorization" = "Bearer $token"}
    $response = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method GET -Headers $headers
    Write-Host "   Get sessions successful!" -ForegroundColor Green
    Write-Host "   Total sessions: $($response.sessions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   Get sessions failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "All tests completed!" -ForegroundColor Green
