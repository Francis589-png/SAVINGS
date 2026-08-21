# JUSU RUSH multiplayer server

Standalone WebSocket server for JUSU RUSH. It does not use Firebase.

## Run locally

```bash
npm install
npm start
```

The server listens on `PORT` (default `8080`).

## Deploy

Deploy this directory as a Node/Docker service. After deployment, set the web app environment variable:

`NEXT_PUBLIC_JUSU_RUSH_WS_URL=wss://YOUR-SERVER-HOST`

Use `wss://` in production and `ws://` only for local development.
