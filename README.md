<<<<<<< HEAD
# CodeJudge Platform

A beautiful, production-level, dockerized Online Judge Platform (LeetCode Clone).

## Architecture

* **Frontend**: React + Vite (Vanilla CSS, Monaco Editor)
* **Backend**: Node.js + Express
* **Execution Service**: Node.js + BullMQ + Docker
* **Database**: MongoDB
* **Queue / Cache**: Redis

## Setup Instructions

1. Ensure you have Docker and Docker Compose installed.
2. Run the application:

```bash
docker compose up --build
```

### Accessing the Platform

- **Frontend Interface:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## Features Included
1. Asynchronous execution using **Redis + BullMQ**.
2. **Docker-in-Docker** secure execution sandboxing for submitted user code.
3. Pre-seeded algorithms with language templates.
4. Auto-refreshing status checking (1-2s polling cadence).
5. Dark-themed dynamic layout (Glassmorphism design aesthetic).
6. Execution time metrics and standard status handling.
=======
# AlgoArena

AlgoArena is a coding judgment platform inspired by LeetCode, built with Node.js + Express and a lightweight frontend.

## Features

- User registration and login with JWT authentication
- Refresh token support with token rotation
- Rate limiting and structured request validation
- Problem catalog with difficulty and tags
- Interactive code editor and submit flow
- JavaScript code judging against hidden test cases
- Submission history for each user
- Leaderboard based on solved problems
- Admin analytics, backup/restore, contests, discussions, playlists, and notes
- Backup checksum verification for safer restores

## Tech Stack

- Backend: Express, JWT, bcryptjs
- Judge: Node `vm` sandbox with timeout
- Frontend: Vanilla HTML/CSS/JS
- Testing: Node test runner + Supertest

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npm run dev
   ```

Optional: copy `.env.example` to `.env` and update secrets.

3. Open:

   [http://localhost:3000](http://localhost:3000)

## Run with Docker

```bash
docker compose up --build -d
```

Then open [http://localhost:3000](http://localhost:3000).

Detailed instructions: see `DEPLOYMENT.md`.

## Important Notes

- This is an MVP and currently supports JavaScript submissions only.
- Data is persisted in `data/db.json` for local development.
- For full production, migrate to managed DB + isolated code execution containers.
>>>>>>> b0c9e5dcf62ac72e525d87da20e8ccc23156bb2f
