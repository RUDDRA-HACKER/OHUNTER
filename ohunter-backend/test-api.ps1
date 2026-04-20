# PowerShell script to test OHunter API endpoints
# Run this in PowerShell after the server is running

Write-Host "===== OHunter API Test Script =====" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:8080/api"

# Colors for output
$success = "Green"
$error = "Red"
$info = "Cyan"

# Test 1: Get all jobs (public endpoint)
Write-Host "TEST 1: Get All Jobs (Public)" -ForegroundColor $info
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs" -Method GET
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "Found $($jobs.Count) jobs" -ForegroundColor $success
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor $error
}

# Test 2: Search jobs (public endpoint)
Write-Host "TEST 2: Search Jobs by Keyword" -ForegroundColor $info
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/search?keyword=java" -Method GET
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "Found $($jobs.Count) jobs with 'java'" -ForegroundColor $success
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor $error
}

# Test 3: Register a new user
Write-Host "TEST 3: Register Student (Fresher)" -ForegroundColor $info
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    fullName = "John Student $timestamp"
    email = "student$timestamp@example.com"
    password = "TestPass123"
    phone = "9876543210"
    city = "Bhubaneswar"
    skills = "Java, Python"
    experienceYears = 0
    role = "STUDENT_FRESHER"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerBody
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
    $data = $response.Content | ConvertFrom-Json
    $studentToken = $data.token
    Write-Host "✓ Student token obtained" -ForegroundColor $success
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor $error
}

# Test 4: Register an employer
Write-Host "TEST 4: Register Employer" -ForegroundColor $info
$registerBody = @{
    fullName = "Jane Employer $timestamp"
    email = "employer$timestamp@example.com"
    password = "TestPass123"
    phone = "9876543211"
    city = "Bangalore"
    role = "EMPLOYER"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerBody
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
    $data = $response.Content | ConvertFrom-Json
    $employerToken = $data.token
    Write-Host "✓ Employer token obtained" -ForegroundColor $success
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor $error
}

# Test 5: Create a job (requires EMPLOYER token)
Write-Host "TEST 5: Create Job (EMPLOYER only)" -ForegroundColor $info
$jobBody = @{
    title = "Senior Java Developer"
    description = "5+ years experience with Spring Boot"
    location = "Remote"
    jobType = "FULL_TIME"
    minSalary = 800000
    maxSalary = 1200000
    requiredSkills = "Java, Spring Boot, MySQL"
    minExperience = 5
    maxExperience = 10
    qualification = "B.Tech/MCA"
    openings = 2
    deadline = "2026-05-31"
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $employerToken"
        } `
        -Body $jobBody
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
    $job = $response.Content | ConvertFrom-Json
    $jobId = $job.id
    Write-Host "✓ Job created with ID: $jobId" -ForegroundColor $success
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor $error
}

# Test 6: Get jobs by location
Write-Host "TEST 6: Get Jobs by Location" -ForegroundColor $info
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/location?city=Remote" -Method GET
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "Found $($jobs.Count) remote jobs" -ForegroundColor $success
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor $error
}

# Test 7: Get fresher jobs
Write-Host "TEST 7: Get Fresher Jobs" -ForegroundColor $info
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs/fresher" -Method GET
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "Found $($jobs.Count) fresher jobs" -ForegroundColor $success
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor $error
}

# Test 8: Get specific job details
if ($jobId) {
    Write-Host "TEST 8: Get Specific Job Details" -ForegroundColor $info
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/jobs/$jobId" -Method GET
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor $success
        $job = $response.Content | ConvertFrom-Json
        Write-Host "Job: $($job.title)" -ForegroundColor $success
        Write-Host "Salary: ₹$($job.minSalary) - ₹$($job.maxSalary)" -ForegroundColor $success
        Write-Host ""
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor $error
    }
}

Write-Host "===== Test Complete =====" -ForegroundColor Cyan

