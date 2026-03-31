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

## Important Notes

- This is an MVP and currently supports JavaScript submissions only.
- Data is persisted in `data/db.json` for local development.
- For full production, migrate to managed DB + isolated code execution containers.
