param(
    [string]$AzureUser = "azureuser",
    [string]$AzureHost = "158.158.2.243",
    [string]$RemotePath = "/home/azureuser/Harmony-Studio",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "== Harmony Studio: refresco Azure ==" -ForegroundColor Cyan

$remoteCommand = @"
set -e
cd $RemotePath
git fetch origin
git checkout $Branch
git pull --ff-only origin $Branch
sudo docker compose up --build -d
sudo docker compose ps
"@ -replace "`r", ""

ssh -t "$AzureUser@$AzureHost" $remoteCommand

Write-Host "Comprobando health check..."
$healthUrl = "http://$AzureHost/api/actuator/health"
$response = $null
for ($attempt = 1; $attempt -le 12; $attempt++) {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 30
        $content = $response.Content
        if ($content -is [byte[]]) {
            $content = [System.Text.Encoding]::UTF8.GetString($content)
        }
        Write-Host $content
        break
    } catch {
        if ($attempt -eq 12) {
            throw
        }
        Write-Host "Health check aun no responde, reintento $attempt/12..."
        Start-Sleep -Seconds 10
    }
}

Write-Host "Azure refrescado correctamente." -ForegroundColor Green
