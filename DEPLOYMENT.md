# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Port `3000` open on your machine/server

## Quick Start (Docker Compose)

1. Update secrets in `docker-compose.yml`.
2. Start:

   ```bash
   docker compose up --build -d
   ```

3. Open:

   [http://localhost:3000](http://localhost:3000)

4. Check logs:

   ```bash
   docker compose logs -f
   ```

5. Stop:

   ```bash
   docker compose down
   ```

## Data Persistence

- App data is stored in `data/db.json`.
- Compose mounts `./data` into the container so data survives restarts.

## Environment Variables

- `PORT`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN_DAYS`

## Backup and Restore

- Use admin APIs:
  - `GET /api/admin/backup`
  - `POST /api/admin/restore` (requires checksum from backup payload)

## Security Notes

- Replace all default secrets before public deployment.
- Use HTTPS and reverse proxy (Nginx/Caddy) for internet-facing deployments.
