# Test script for API endpoints

$API_BASE = "http://localhost:3001"

# Test 1: Register user
Write-Host "Testing user registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        email = "testuser@example.com"
        password = "testpassword123"
        name = "Test User"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "Registration successful" -ForegroundColor Green
    $token = $registerResponse.token
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "Registration failed, trying login..." -ForegroundColor Red
    try {
        $loginBody = @{
            email = "testuser@example.com"
            password = "testpassword123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        Write-Host "Login successful" -ForegroundColor Green
        $token = $loginResponse.token
        Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    } catch {
        Write-Host "Both registration and login failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Profile update
Write-Host "`nTesting profile update..." -ForegroundColor Yellow
try {
    $profileBody = @{
        preferences = @{
            theme = "dark"
            notifications = $false
        }
    } | ConvertTo-Json -Depth 3
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "$API_BASE/api/profile" -Method PUT -Body $profileBody -Headers $headers
    Write-Host "✓ Profile update successful" -ForegroundColor Green
    Write-Host "Theme: $($profileResponse.preferences.theme)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Profile update failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Session creation
Write-Host "`nTesting session creation..." -ForegroundColor Yellow
try {
    $sessionBody = @{
        name = "Test Session"
        description = "Test description"
        language = "javascript"
        isPublic = $true
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $sessionResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method POST -Body $sessionBody -Headers $headers
    Write-Host "✓ Session creation successful" -ForegroundColor Green
    Write-Host "Session ID: $($sessionResponse._id)" -ForegroundColor Cyan
    Write-Host "Session Name: $($sessionResponse.name)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Session creation failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get sessions
Write-Host "`nTesting get sessions..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $sessionsResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method GET -Headers $headers
    Write-Host "✓ Get sessions successful" -ForegroundColor Green
    Write-Host "Total sessions: $($sessionsResponse.sessions.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Get sessions failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAll tests completed!" -ForegroundColor Green
