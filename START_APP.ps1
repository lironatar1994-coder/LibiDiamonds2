$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 3001
$PortRange = 3001..3015

Set-Location $ProjectRoot

function Stop-ProjectPreviewServers {
  foreach ($candidatePort in $PortRange) {
    $processIds = netstat -ano |
      Select-String "LISTENING" |
      Select-String ":$candidatePort\s" |
      ForEach-Object {
        ($_ -split "\s+")[-1]
      } |
      Sort-Object -Unique

    foreach ($processId in $processIds) {
      $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$processId" -ErrorAction SilentlyContinue
      if ($processInfo -and $processInfo.CommandLine -like "*$ProjectRoot*") {
        Write-Host "Stopping old LIBI preview on port $candidatePort (PID $processId)..."
        Stop-Process -Id $processId -Force
      }
    }
  }
}

Write-Host ""
Write-Host "LIBI DIAMONDS 2 local dev server"
Write-Host "Project: $ProjectRoot"
Write-Host ""

Stop-ProjectPreviewServers

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm was not found. Install Node.js/npm before running this script."
}

if (-not (Test-Path (Join-Path $ProjectRoot "node_modules"))) {
  Write-Host "Installing dependencies..."
  npm install
}

Write-Host ""
Write-Host "Starting dev server on:"
Write-Host "  http://localhost:$Port"
Write-Host "  http://10.100.102.11:$Port"
Write-Host ""
Write-Host "Design workflow: keep this window open, edit files, then refresh the browser."
Write-Host "Use npm run build only for final production sanity-checks."
Write-Host "Press Ctrl+C to stop."
Write-Host ""

npx next dev --turbopack -p $Port
