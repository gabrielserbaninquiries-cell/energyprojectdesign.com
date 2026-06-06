# Opțional: creează link public temporar prin cloudflared, dacă ai cloudflared instalat.
# Instalare cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
# Rulează serverul în alt PowerShell cu START_EPD_SITE_SERVER.ps1, apoi rulează acest script.

$ErrorActionPreference = "Continue"
cloudflared tunnel --url http://localhost:3000
