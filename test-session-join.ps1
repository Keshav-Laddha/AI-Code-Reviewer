# Test script to verify session join functionality
$API_BASE = "http://localhost:3001"

Write-Host "=== TESTING SESSION JOIN FUNCTIONALITY ===" -ForegroundColor Yellow

# Step 1: Create a test user and login
Write-Host "1. Creating test user and logging in..." -ForegroundColor Cyan
try {
    $loginBody = '{"email":"testuser@example.com","password":"testpassword123"}'
    $authResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $authResponse.token
    Write-Host "   Login successful!" -ForegroundColor Green
} catch {
    Write-Host "   Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create a public session
Write-Host "2. Creating a public session..." -ForegroundColor Cyan
try {
    $sessionBody = '{"name":"Test Public Session","description":"Test session for joining","language":"javascript","isPublic":true}'
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $sessionResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method POST -Body $sessionBody -Headers $headers
    Write-Host "   Session created successfully!" -ForegroundColor Green
    Write-Host "   Session ID: $($sessionResponse._id)" -ForegroundColor Gray
    Write-Host "   Session Name: $($sessionResponse.name)" -ForegroundColor Gray
    Write-Host "   Is Public: $($sessionResponse.isPublic)" -ForegroundColor Gray
    $sessionId = $sessionResponse._id
} catch {
    Write-Host "   Session creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create a second user to test joining
Write-Host "3. Creating second test user..." -ForegroundColor Cyan
try {
    $registerBody = '{"email":"testuser2@example.com","password":"testpassword123","name":"Test User 2"}'
    $registerResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token2 = $registerResponse.token
    Write-Host "   Second user created and logged in!" -ForegroundColor Green
} catch {
    Write-Host "   Second user creation failed, trying login..." -ForegroundColor Yellow
    try {
        $loginBody2 = '{"email":"testuser2@example.com","password":"testpassword123"}'
        $authResponse2 = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginBody2 -ContentType "application/json"
        $token2 = $authResponse2.token
        Write-Host "   Second user login successful!" -ForegroundColor Green
    } catch {
        Write-Host "   Second user authentication failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Test joining the session with second user
Write-Host "4. Testing session join with second user..." -ForegroundColor Cyan
try {
    $headers2 = @{"Authorization" = "Bearer $token2"; "Content-Type" = "application/json"}
    $joinResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions/$sessionId/join" -Method POST -Headers $headers2
    Write-Host "   Session join successful!" -ForegroundColor Green
    Write-Host "   Message: $($joinResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "   Session join failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Verify the session has both users
Write-Host "5. Verifying session participants..." -ForegroundColor Cyan
try {
    $headers = @{"Authorization" = "Bearer $token"}
    $sessionDetails = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions/$sessionId" -Method GET -Headers $headers
    Write-Host "   Session verification successful!" -ForegroundColor Green
    Write-Host "   Participants: $($sessionDetails.participants.Count)" -ForegroundColor Gray
    Write-Host "   Owner: $($sessionDetails.owner)" -ForegroundColor Gray
} catch {
    Write-Host "   Session verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Test getting all sessions (should show the session for both users)
Write-Host "6. Testing session listing..." -ForegroundColor Cyan
try {
    $headers2 = @{"Authorization" = "Bearer $token2"}
    $sessionsResponse = Invoke-RestMethod -Uri "$API_BASE/api/collaboration/sessions" -Method GET -Headers $headers2
    Write-Host "   Session listing successful!" -ForegroundColor Green
    Write-Host "   Total sessions visible to second user: $($sessionsResponse.sessions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   Session listing failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== SESSION JOIN FUNCTIONALITY TEST COMPLETED ===" -ForegroundColor Green
Write-Host "Session ID for manual testing: $sessionId" -ForegroundColor Cyan
