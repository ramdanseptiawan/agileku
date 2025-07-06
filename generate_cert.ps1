# First, login to get a valid token
$loginData = @{
    username = "user"
    password = "123"
} | ConvertTo-Json

try {
    Write-Host "Logging in..."
    $loginResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/public/login' -Method POST -Body $loginData -ContentType 'application/json'
    Write-Host "Login response status: $($loginResponse.StatusCode)"
    Write-Host "Login response content: $($loginResponse.Content)"
    
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginResult.success -and $loginResult.data.token) {
        Write-Host "Login successful, token received"
        
        # Now generate certificate with the valid token
        $headers = @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $($loginResult.data.token)"
        }
        
        Write-Host "Generating certificate..."
        $certResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/protected/courses/1/certificate' -Method POST -Headers $headers
        Write-Host "Certificate Status Code: $($certResponse.StatusCode)"
        Write-Host "Certificate Response: $($certResponse.Content)"
    } else {
        Write-Host "Login failed or no token received"
        Write-Host "Login result: $($loginResult | ConvertTo-Json)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}