# ==============================================================================
# LIBI DIAMONDS canonical-domain deployment (local Windows)
# ==============================================================================

param (
    [switch]$SkipCheck
)

$ErrorActionPreference = "Stop"

$SSH_HOST = "root@vee-app.co.il"
$SSH_DOMAIN = "vee-app.co.il"
$REMOTE_DIR = "/root/LibiDiamonds-live"
$REMOTE_STAGE_DIR = "/root/LibiDiamonds-live.next"
$REMOTE_ROLLBACK_DIR = "/root/LibiDiamonds-live.rollback"
$ARCHIVE_NAME = "libi-diamonds-live-deploy.tar.gz"

Write-Host "--- Starting LIBI DIAMONDS canonical-domain deployment ---" -ForegroundColor Cyan

if (-not $SkipCheck) {
    Write-Host "Checking server connectivity..." -ForegroundColor Gray
    if (-not (Test-Connection -ComputerName $SSH_DOMAIN -Count 1 -Quiet)) {
        Write-Host "Error: Could not ping server $SSH_DOMAIN." -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path ".git")) {
    Write-Host "Error: Run this script from the release repository root." -ForegroundColor Red
    exit 1
}

$status = git status --porcelain
if ($status) {
    Write-Host "Error: The release worktree must be clean before a canonical-domain deployment." -ForegroundColor Red
    git status --short
    exit 1
}

$archivePath = Join-Path $env:TEMP $ARCHIVE_NAME
git archive --format=tar.gz -o $archivePath HEAD
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create the live deployment archive." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Uploading the approved release archive..." -ForegroundColor Gray
scp $archivePath "${SSH_HOST}:/tmp/$ARCHIVE_NAME"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to upload the live deployment archive." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Building and activating www.libidiamonds.co.il..." -ForegroundColor Blue
$REMOTE_CMD = "set -e && if [ '$REMOTE_STAGE_DIR' != '/root/LibiDiamonds-live.next' ]; then exit 64; fi && rm -rf -- '$REMOTE_STAGE_DIR' && mkdir -p '$REMOTE_STAGE_DIR' && tar -xzf '/tmp/$ARCHIVE_NAME' -C '$REMOTE_STAGE_DIR' && cd '$REMOTE_STAGE_DIR' && sed -i 's/\r$//' deploy_live_linux.sh && chmod +x deploy_live_linux.sh && LIVE_APP_ROOT='$REMOTE_DIR' ROLLBACK_APP_ROOT='$REMOTE_ROLLBACK_DIR' bash deploy_live_linux.sh"
ssh $SSH_HOST $REMOTE_CMD

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[!] LIVE DEPLOYMENT FAILED" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "      LIBI DIAMONDS LIVE DEPLOYED" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "Public: https://www.libidiamonds.co.il" -ForegroundColor Cyan
