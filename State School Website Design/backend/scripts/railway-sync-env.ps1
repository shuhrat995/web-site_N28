param(
  [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
  throw "Railway CLI topilmadi. Avval 'npm install -g @railway/cli' bilan o'rnating."
}

$envPath = Join-Path $PSScriptRoot "..\$EnvFile"
$envPath = [System.IO.Path]::GetFullPath($envPath)

if (-not (Test-Path $envPath)) {
  throw "Env fayl topilmadi: $envPath"
}

$excludedKeys = @(
  "DATABASE_URL",
  "DB_PATH"
)

$lines = Get-Content $envPath

foreach ($line in $lines) {
  $trimmed = $line.Trim()

  if (-not $trimmed -or $trimmed.StartsWith("#")) {
    continue
  }

  $parts = $trimmed -split "=", 2
  if ($parts.Count -ne 2) {
    continue
  }

  $key = $parts[0].Trim()
  $value = $parts[1].Trim()

  if (-not $key -or $excludedKeys -contains $key) {
    continue
  }

  Write-Host "Setting $key in Railway..."
  railway variables set "$key=$value" | Out-Host
}

Write-Host "Railway env sync yakunlandi."
