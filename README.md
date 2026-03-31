# AlgoArena

AlgoArena is a coding judgment platform inspired by LeetCode, built with Node.js + Express and a lightweight frontend.

## Features

- User registration and login with JWT authentication
- Problem catalog with difficulty and tags
- Interactive code editor and submit flow
- JavaScript code judging against hidden test cases
- Submission history for each user
- Leaderboard based on solved problems

## Tech Stack

- Backend: Express, JWT, bcryptjs
- Judge: Node `vm` sandbox with timeout
- Frontend: Vanilla HTML/CSS/JS

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npm run dev
   ```

3. Open:

   [http://localhost:3000](http://localhost:3000)

## Important Notes

- This is an MVP and currently supports JavaScript submissions only.
- Data is in memory; restarting the server resets users/submissions.
- For production, replace in-memory storage with a database and isolate code execution in containers.
