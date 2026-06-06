# EPD SITE V3 — FIX DEPENDENCIES + START SERVER + OPTIONAL PUBLIC LINK
# Rulare recomandată:
#   cd "$env:USERPROFILE\Desktop\EPD_SITE_V3_BACKEND_READY"
#   powershell -ExecutionPolicy Bypass -File .\EPD_SITE_V3_FIX_START_LINK.ps1
#
# Ce face:
# - repară package.json: @openai/openai -> openai
# - instalează dependențele
# - pornește serverul local
# - opțional pornește link public temporar cu cloudflared, dacă este instalat

$ErrorActionPreference = "Stop"

$Root = Get-Location
Write-Host "Folder curent: $Root"

if (!(Test-Path ".\package.json")) {
  throw "Nu găsesc package.json. Intră întâi în folderul EPD_SITE_V3_BACKEND_READY."
}

# 1. Repară package.json
$pkg = Get-Content ".\package.json" -Raw | ConvertFrom-Json

if ($pkg.dependencies.PSObject.Properties.Name -contains "@openai/openai") {
  $pkg.dependencies.PSObject.Properties.Remove("@openai/openai")
}

$pkg.dependencies | Add-Member -NotePropertyName "openai" -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName "cors" -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName "dotenv" -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName "express" -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName "multer" -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName "jszip" -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName "uuid" -NotePropertyValue "latest" -Force

$pkg | ConvertTo-Json -Depth 20 | Set-Content ".\package.json" -Encoding UTF8
Write-Host "package.json reparat."

# 2. Creează .env dacă lipsește
if (!(Test-Path ".\.env")) {
  if (Test-Path ".\.env.example") {
    Copy-Item ".\.env.example" ".\.env"
  } else {
@"
PORT=3000
OPENAI_API_KEY=
EPD_AI_MODEL=gpt-4.1-mini
EPD_PUBLIC_BASE_URL=http://localhost:3000
EPD_ADMIN_USER=developer
EPD_ADMIN_PASSWORD=Amodilema_99
"@ | Set-Content ".\.env" -Encoding UTF8
  }
  Write-Host ".env creat. Completează OPENAI_API_KEY dacă vrei AI Developer real."
}

# 3. Curățare instalare stricată
if (Test-Path ".\node_modules") {
  Write-Host "Șterg node_modules vechi..."
  Remove-Item ".\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path ".\package-lock.json") {
  Remove-Item ".\package-lock.json" -Force -ErrorAction SilentlyContinue
}

# 4. Instalare dependențe
Write-Host "Instalez dependențele npm..."
npm install

# 5. Test rapid health după pornire în proces separat
Write-Host ""
Write-Host "Pornesc serverul pe http://localhost:3000"
Write-Host "Login: developer / Amodilema_99"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$Root`"; npm start"

Start-Sleep -Seconds 4
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Server pornit. Site local:"
Write-Host "  http://localhost:3000"
Write-Host ""

# 6. Link public temporar, dacă există cloudflared
$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if ($cf) {
  Write-Host "cloudflared găsit. Pornesc link public temporar..."
  Write-Host "Copiază URL-ul https://....trycloudflare.com din fereastra nouă."
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel --url http://localhost:3000"
} else {
  Write-Host "cloudflared nu este instalat."
  Write-Host "Pentru link public temporar instalează Cloudflared:"
  Write-Host "  winget install --id Cloudflare.cloudflared -e"
  Write-Host "Apoi rulează:"
  Write-Host "  cloudflared tunnel --url http://localhost:3000"
}

Write-Host ""
Write-Host "Pentru domeniu propriu stabil:"
Write-Host "1. Cumperi domeniu sau folosești unul existent."
Write-Host "2. Îl pui în Cloudflare."
Write-Host "3. Creezi Cloudflare Tunnel către http://localhost:3000."
Write-Host "4. Adaugi Public Hostname: app.domeniul-tau.ro -> http://localhost:3000."
