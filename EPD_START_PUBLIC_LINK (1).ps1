# EPD START PUBLIC LINK HELPER
# Rulare:
#   cd "$env:USERPROFILE\Desktop\EPD_SITE_V3_BACKEND_READY"
#   powershell -ExecutionPolicy Bypass -File .\EPD_START_PUBLIC_LINK.ps1

$ErrorActionPreference = "Stop"

$Root = Get-Location
Write-Host "Folder curent: $Root"

if (!(Test-Path ".\package.json")) {
    throw "Nu ești în folderul EPD_SITE_V3_BACKEND_READY. Intră întâi în folderul aplicației."
}

# 1. Verifică dacă serverul răspunde.
$serverOk = $false
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $serverOk = $true }
} catch {
    $serverOk = $false
}

if (!$serverOk) {
    Write-Host "Serverul nu răspunde. Pornesc serverul..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$Root`"; npm start"
    Start-Sleep -Seconds 5
} else {
    Write-Host "Serverul este deja pornit pe http://localhost:3000"
}

# 2. Caută cloudflared. După winget, uneori PATH nu se actualizează până nu redeschizi PowerShell.
$cfCmd = Get-Command cloudflared -ErrorAction SilentlyContinue

$cfPath = $null
if ($cfCmd) {
    $cfPath = $cfCmd.Source
} else {
    Write-Host "cloudflared nu este în PATH. Îl caut în locațiile obișnuite..."

    $searchRoots = @(
        "$env:ProgramFiles",
        "$env:ProgramFiles(x86)",
        "$env:LOCALAPPDATA\Microsoft\WinGet\Packages",
        "$env:LOCALAPPDATA\Programs",
        "$env:USERPROFILE\AppData\Local"
    ) | Where-Object { $_ -and (Test-Path $_) }

    foreach ($rootPath in $searchRoots) {
        $found = Get-ChildItem -Path $rootPath -Filter "cloudflared.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $cfPath = $found.FullName
            break
        }
    }
}

if (!$cfPath) {
    Write-Host ""
    Write-Host "Nu am găsit cloudflared.exe, deși winget a spus că l-a instalat."
    Write-Host "Închide toate ferestrele PowerShell, deschide una nouă și încearcă:"
    Write-Host "  cloudflared --version"
    Write-Host ""
    Write-Host "Sau reinstalează:"
    Write-Host "  winget install --id Cloudflare.cloudflared -e --source winget"
    throw "cloudflared.exe negăsit."
}

Write-Host ""
Write-Host "cloudflared găsit:"
Write-Host "  $cfPath"
Write-Host ""
Write-Host "Pornesc link public temporar."
Write-Host "Copiază linkul https://....trycloudflare.com din fereastra următoare."
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "& `"$cfPath`" tunnel --url http://localhost:3000"

Write-Host "Comandă trimisă. Verifică fereastra nouă pentru linkul public."
