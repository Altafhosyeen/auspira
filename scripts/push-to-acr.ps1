# ============================================================
# push-to-acr.ps1 — Manual image build & push to Azure ACR
# Usage:
#   .\scripts\push-to-acr.ps1                              # uses Azure CLI login
#   .\scripts\push-to-acr.ps1 -Tag "v1.0.0"               # custom tag
#   .\scripts\push-to-acr.ps1 -Username "user" -Password "pass"  # direct login (no az cli)
# ============================================================

param(
    [string]$Tag      = "latest",
    [string]$Username = "",   # ACR admin username (Azure Portal → ACR → Access keys)
    [string]$Password = ""    # ACR admin password
)

$ACR         = "auspiradevacr.azurecr.io"
$IMAGE       = "auspira-frontend"
$BACKEND_URL = "https://auspira-dev-contaiber-be.jollypond-463e3e8f.uksouth.azurecontainerapps.io"

$FullImage   = "${ACR}/${IMAGE}:${Tag}"

Write-Host ""
Write-Host "=== Auspira Frontend — ACR Push ===" -ForegroundColor Cyan
Write-Host "Registry : $ACR"
Write-Host "Image    : $FullImage"
Write-Host ""

# ── Step 1: Login to ACR ────────────────────────────────────
Write-Host "[1/4] Logging in to ACR..." -ForegroundColor Yellow

$azAvailable = Get-Command az -ErrorAction SilentlyContinue

if ($Username -and $Password) {
    # Direct docker login — no Azure CLI needed
    # Get credentials from: Azure Portal → Container Registry → Settings → Access keys
    $Password | docker login $ACR --username $Username --password-stdin
    if ($LASTEXITCODE -ne 0) { Write-Error "Docker login failed"; exit 1 }
} elseif ($azAvailable) {
    az acr login --name auspiradevacr
    if ($LASTEXITCODE -ne 0) { Write-Error "ACR login failed"; exit 1 }
} else {
    Write-Host ""
    Write-Host "Azure CLI not found. Two options:" -ForegroundColor Red
    Write-Host ""
    Write-Host "OPTION A — Install Azure CLI (recommended):" -ForegroundColor Yellow
    Write-Host "  winget install Microsoft.AzureCLI"
    Write-Host "  Then reopen terminal and re-run this script."
    Write-Host ""
    Write-Host "OPTION B — Use ACR admin credentials (no Azure CLI needed):" -ForegroundColor Yellow
    Write-Host "  1. Azure Portal → Container Registries → auspiradevacr"
    Write-Host "  2. Settings → Access keys → Enable Admin user"
    Write-Host "  3. Copy Username and Password"
    Write-Host "  4. Run:"
    Write-Host '  .\scripts\push-to-acr.ps1 -Username "<username>" -Password "<password>"'
    Write-Host ""
    exit 1
}

# ── Step 2: Build the Docker image ──────────────────────────
Write-Host "[2/4] Building Docker image..." -ForegroundColor Yellow
docker build `
    --build-arg NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL" `
    -t "${IMAGE}:${Tag}" `
    -f Dockerfile `
    .
if ($LASTEXITCODE -ne 0) { Write-Error "Docker build failed"; exit 1 }

# ── Step 3: Tag for ACR ─────────────────────────────────────
Write-Host "[3/4] Tagging image for ACR..." -ForegroundColor Yellow
docker tag "${IMAGE}:${Tag}" $FullImage
if ($LASTEXITCODE -ne 0) { Write-Error "Docker tag failed"; exit 1 }

if ($Tag -ne "latest") {
    docker tag "${IMAGE}:${Tag}" "${ACR}/${IMAGE}:latest"
}

# ── Step 4: Push to ACR ─────────────────────────────────────
Write-Host "[4/4] Pushing to ACR..." -ForegroundColor Yellow
docker push $FullImage
if ($LASTEXITCODE -ne 0) { Write-Error "Docker push failed"; exit 1 }

if ($Tag -ne "latest") {
    docker push "${ACR}/${IMAGE}:latest"
    if ($LASTEXITCODE -ne 0) { Write-Error "Docker push (latest) failed"; exit 1 }
}

Write-Host ""
Write-Host "Done! Image pushed: $FullImage" -ForegroundColor Green
Write-Host ""
Write-Host "Verify in ACR:" -ForegroundColor Cyan
Write-Host "  az acr repository show-tags --name auspiradevacr --repository $IMAGE --output table"
