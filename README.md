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
