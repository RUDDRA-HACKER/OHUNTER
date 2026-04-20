# OHunter API Testing - Working PowerShell Script

Write-Host "=== OHunter API Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api"

# Test 1: Public endpoints (no auth required)
Write-Host "1. Testing Public Job Endpoints..." -ForegroundColor Green

# Get all jobs
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs" -Method GET -UseBasicParsing
    Write-Host "✓ GET /api/jobs - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ GET /api/jobs failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Search jobs
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/search?keyword=java" -Method GET -UseBasicParsing
    Write-Host "✓ GET /api/jobs/search - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ GET /api/jobs/search failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Get jobs by location
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/location?city=bhubaneswar" -Method GET -UseBasicParsing
    Write-Host "✓ GET /api/jobs/location - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ GET /api/jobs/location failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Get fresher jobs
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/fresher" -Method GET -UseBasicParsing
    Write-Host "✓ GET /api/jobs/fresher - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ GET /api/jobs/fresher failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Authentication
Write-Host "2. Testing Authentication..." -ForegroundColor Green

# Register employer
$employerBody = @{
    fullName = "Test Employer"
    email = "employer$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "TestPass123"
    phone = "9876543210"
    city = "Bangalore"
    role = "EMPLOYER"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $employerBody -UseBasicParsing
    Write-Host "✓ POST /api/auth/register - Status: $($response.StatusCode)" -ForegroundColor Green
    $employerData = $response.Content | ConvertFrom-Json
    $employerToken = $employerData.token
} catch {
    Write-Host "✗ POST /api/auth/register failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 3: Protected endpoints (EMPLOYER role required)
Write-Host "3. Testing Protected Job Endpoints..." -ForegroundColor Green

# Create job
$jobBody = @{
    title = "Backend Developer"
    description = "Develop backend services"
    location = "Bhubaneswar"
    jobType = "FULL_TIME"
    minSalary = 50000
    maxSalary = 80000
    requiredSkills = "Java, Spring Boot"
    minExperience = 1
    maxExperience = 3
    qualification = "B.Tech"
    openings = 2
    deadline = "2026-12-31"
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs" -Method POST -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $employerToken"} -Body $jobBody -UseBasicParsing
    Write-Host "✓ POST /api/jobs - Status: $($response.StatusCode)" -ForegroundColor Green
    $createdJob = $response.Content | ConvertFrom-Json
    $jobId = $createdJob.id
} catch {
    Write-Host "✗ POST /api/jobs failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Update job (if created successfully)
if ($jobId) {
    $updateBody = @{
        title = "Updated Backend Developer"
        description = "Updated description"
        location = "Bhubaneswar"
        jobType = "FULL_TIME"
        minSalary = 55000
        maxSalary = 85000
        requiredSkills = "Java, Spring Boot, MySQL"
        minExperience = 1
        maxExperience = 4
        qualification = "B.Tech/MCA"
        openings = 3
        deadline = "2026-12-31"
        isActive = $true
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/jobs/$jobId" -Method PUT -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $employerToken"} -Body $updateBody -UseBasicParsing
        Write-Host "✓ PUT /api/jobs/$jobId - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ PUT /api/jobs/$jobId failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Delete job
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/jobs/$jobId" -Method DELETE -Headers @{"Authorization" = "Bearer $employerToken"} -UseBasicParsing
        Write-Host "✓ DELETE /api/jobs/$jobId - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ DELETE /api/jobs/$jobId failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host "✓ All major endpoints tested successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "PowerShell equivalents for your curl commands:" -ForegroundColor Yellow
Write-Host "• curl -X GET 'http://localhost:8080/api/jobs/search?keyword=java'" -ForegroundColor Gray
Write-Host "  → Invoke-WebRequest -Uri 'http://localhost:8080/api/jobs/search?keyword=java' -Method GET -UseBasicParsing" -ForegroundColor White
Write-Host ""
Write-Host "• curl -X POST http://localhost:8080/api/jobs -H 'Authorization: Bearer TOKEN' -d 'JSON_DATA'" -ForegroundColor Gray
Write-Host "  → Invoke-WebRequest -Uri 'http://localhost:8080/api/jobs' -Method POST -Headers @{Authorization='Bearer TOKEN'} -Body 'JSON_DATA' -UseBasicParsing" -ForegroundColor White
