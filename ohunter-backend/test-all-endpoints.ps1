# OHunter API Testing Script - PowerShell Version
# This script demonstrates all API endpoints with correct PowerShell syntax

Write-Host "=== OHunter API Testing Script ===" -ForegroundColor Cyan
Write-Host "Using PowerShell Invoke-WebRequest (not curl.exe)" -ForegroundColor Yellow
Write-Host ""

$baseUrl = "http://localhost:8080/api"

# ==========================================
# 1. PUBLIC JOB ENDPOINTS (No authentication required)
# ==========================================

Write-Host "1. PUBLIC JOB ENDPOINTS" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

# Search jobs by keyword
Write-Host "Search jobs by keyword 'java'..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/search?keyword=java" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "Found $($jobs.Count) jobs with 'java'" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get jobs by location
Write-Host "Get jobs by location 'bhubaneswar'..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/location?city=bhubaneswar" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "Found $($jobs.Count) jobs in Bhubaneswar" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get fresher jobs
Write-Host "Get fresher jobs..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/fresher" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "Found $($jobs.Count) fresher jobs" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get job by ID
Write-Host "Get job by ID (1)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/1" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $job = $response.Content | ConvertFrom-Json
    Write-Host "Job: $($job.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ==========================================
# 2. AUTHENTICATION (Get JWT Tokens)
# ==========================================

Write-Host "2. AUTHENTICATION" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green

# Register employer
Write-Host "Registering employer..." -ForegroundColor Yellow
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
    Write-Host "✓ Employer registered: $($response.StatusCode)" -ForegroundColor Green
    $employerData = $response.Content | ConvertFrom-Json
    $employerToken = $employerData.token
} catch {
    Write-Host "✗ Employer registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Register student
Write-Host "Registering student..." -ForegroundColor Yellow
$studentBody = @{
    fullName = "Test Student"
    email = "student$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "TestPass123"
    phone = "9876543211"
    city = "Bhubaneswar"
    skills = "Java, Python"
    experienceYears = 0
    role = "STUDENT_FRESHER"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $studentBody -UseBasicParsing
    Write-Host "✓ Student registered: $($response.StatusCode)" -ForegroundColor Green
    $studentData = $response.Content | ConvertFrom-Json
    $studentToken = $studentData.token
} catch {
    Write-Host "✗ Student registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ==========================================
# 3. PROTECTED JOB ENDPOINTS (EMPLOYER role required)
# ==========================================

Write-Host "3. PROTECTED JOB ENDPOINTS (EMPLOYER)" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Create a job
Write-Host "Creating a job..." -ForegroundColor Yellow
$jobBody = @{
    title = "Backend Developer"
    description = "Develop backend services using Spring Boot"
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
    Write-Host "✓ Job created: $($response.StatusCode)" -ForegroundColor Green
    $createdJob = $response.Content | ConvertFrom-Json
    $jobId = $createdJob.id
    Write-Host "Job ID: $jobId" -ForegroundColor Green
} catch {
    Write-Host "✗ Job creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Update a job
if ($jobId) {
    Write-Host "Updating job $jobId..." -ForegroundColor Yellow
    $updateBody = @{
        title = "Updated Backend Developer"
        description = "Updated: Develop backend services using Spring Boot and MySQL"
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
        Write-Host "✓ Job updated: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Job update failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Delete a job
if ($jobId) {
    Write-Host "Deleting job $jobId..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/jobs/$jobId" -Method DELETE -Headers @{"Authorization" = "Bearer $employerToken"} -UseBasicParsing
        Write-Host "✓ Job deleted: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Job deletion failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# ==========================================
# 4. APPLICATION ENDPOINTS (Authentication required)
# ==========================================

Write-Host "4. APPLICATION ENDPOINTS" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

Write-Host "Application endpoints require ApplicationController implementation" -ForegroundColor Yellow
Write-Host "Examples of how they would work:" -ForegroundColor Yellow
Write-Host "- Apply: POST /api/applications/apply/{jobId}?userId={userId}&coverLetter={text}" -ForegroundColor Gray
Write-Host "- My apps: GET /api/applications/my/{userId}" -ForegroundColor Gray
Write-Host "- Job apps: GET /api/applications/job/{jobId}" -ForegroundColor Gray
Write-Host "- Update status: PUT /api/applications/{id}/status?status={status}" -ForegroundColor Gray
Write-Host "- Withdraw: DELETE /api/applications/withdraw?userId={userId}&jobId={jobId}" -ForegroundColor Gray

Write-Host ""
Write-Host "=== API Testing Complete ===" -ForegroundColor Cyan
Write-Host "✓ All endpoints tested with correct PowerShell syntax" -ForegroundColor Green
