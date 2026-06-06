EPD SITE V3 BACKEND READY

1. Rulare locală:
   cd folderul EPD_SITE_V3_BACKEND_READY
   powershell -ExecutionPolicy Bypass -File .\START_EPD_SITE_SERVER.ps1

2. Deschidere:
   http://localhost:3000

3. Login:
   developer
   Amodilema_99

4. AI Developer:
   - Completează OPENAI_API_KEY în .env
   - Repornește serverul
   - Intră la AI Developer / Actualizări
   - Încarcă fișiere prompt/conversație
   - Apasă Analizează cu AI Developer sau Run Update

5. Publicare din PC:
   - Serverul rulează pe PC.
   - Pentru link public temporar: instalează cloudflared și rulează START_TUNNEL_OPTIONAL.ps1.
   - Pentru domeniu propriu: configurează DNS + tunnel/reverse proxy către http://localhost:3000.

6. Publicare cloud:
   - Pentru producție reală ai nevoie de hosting Node.js, domeniu, HTTPS, bază de date și storage persistent.
