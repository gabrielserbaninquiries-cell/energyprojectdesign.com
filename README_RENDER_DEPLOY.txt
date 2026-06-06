EPD SITE V3 - RENDER READY

Ce s-a pregatit:
- server.js asculta pe 0.0.0.0
- package.json reparat
- .gitignore creat
- render.yaml creat
- Dockerfile creat

Deploy simplu:
1. Urca folderul acesta intr-un repository GitHub privat/public.
2. In Render: New -> Blueprint sau Web Service -> conectezi repository-ul.
3. Environment variables:
   OPENAI_API_KEY = cheia ta
   EPD_PUBLIC_BASE_URL = linkul onrender primit dupa deploy
4. Linkul permanent gratuit va fi de forma:
   https://epd-site-v3.onrender.com

Local:
npm install
npm start
http://localhost:3000
