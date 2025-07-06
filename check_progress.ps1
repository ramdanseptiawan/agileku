# Check user progress for course 1
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6InVzZXIiLCJyb2xlIjoidXNlciIsImlzcyI6Imxtcy1iYWNrZW5kIiwiZXhwIjoxNzUxODY3NzQyLCJpYXQiOjE3NTE3ODEzNDJ9.T3xNUELtelDvAvOo4kOA82XvwceRy4yIN7vXv-_BCr4"

try {
    Write-Host "Checking user progress for course 1..."
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/protected/courses/1/progress' -Method GET -Headers $headers
    
    Write-Host "Progress response:"
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "Error checking progress: $($_.Exception.Message)"
    Write-Host "Response Body: $($_.Exception.Response)"
}