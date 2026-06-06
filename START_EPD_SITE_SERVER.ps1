$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (!(Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Am creat .env din .env.example. Completează OPENAI_API_KEY dacă vrei AI Developer real."
}

if (!(Test-Path "node_modules")) {
  npm install
}

npm start
