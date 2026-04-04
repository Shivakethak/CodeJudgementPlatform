# AlgoArena / CodeJudge Platform

A full-stack coding practice and contest platform: ~**1000** seeded problems, multi-language submissions judged in **Docker**, **9** timed contests, study plans, discuss threads, JWT auth, and real-time contest updates — similar in spirit to LeetCode and Codeforces.

- **Product label on the problemset:** **AlgoArena** (hero eyebrow on `/` and `/problems`).
- **Repository folder name:** `CodeJudgePlatform` (clone path unchanged).

---

## Complete changelog & implemented changes

The following behaviors and UI updates are in the current codebase:

### Branding & problemset home

| Change | Location |
|--------|-----------|
| Hero eyebrow reads **AlgoArena** instead of “CodeJudge” | `frontend/src/pages/ProblemList.jsx` |
| Removed the long marketing line about Docker IDE / leaderboards / study plans from the hero (cleaner hero: title + CTAs + stats card) | `ProblemList.jsx` (no `lc-hero__sub` block) |
| Shortcut deck card to contests titled **Contest** (was “JavaScript & polyglot contest”) | `ProblemList.jsx` → links to `/challenges` |

### Problems: examples & hints

| Change | Details |
|--------|---------|
| **2–3 examples** per problem where possible | `ensureExamplesAndHints()` in `backend/src/data/canonicalBulk.js` merges authored examples with judge **visible** tests, then **all** tests if needed, up to 3 distinct I/O rows |
| **Up to 3 hints** per problem | Built from explicit `hints`, else `solution.explanation` + generic tips (SQL vs algorithm wording) |
| Applied on seed | `problemsList.forEach(ensureExamplesAndHints)` in `backend/src/data/seeder.js`; also inside `buildClone()` and `buildSqlProblem()` for catalog clones and SQL bank |
| **Workspace UI** | Description tab lists examples and an ordered **Hints** list when `hints.length > 0` | `frontend/src/pages/Workspace.jsx` |
| **Schema** | `hints: [String]` on `Problem` | `backend/src/models/Problem.js`, mirrored on `execution-worker/src/models/Problem.js` |

### Contests

| Change | Details |
|--------|---------|
| **9** contests seeded via `WeeklyChallenge.insertMany` | `backend/src/data/seeder.js` — windows computed with `day(offset)` from seed time |
| Includes a flagship row titled **Contest** (`slug: contest`) aligned with the problemset card | Multi-language copy in description |
| Mix of **weekly** and **contest** kinds, live / upcoming / past (archive) windows | See table below |
| API unchanged | `GET /api/challenges` returns full list with `isLive`, `participantCount`, `problemCount` |

### Illustrations (removed)

| Note |
|------|
| Topic SVG figures under `/figures/*.svg` and `illustrationKey` on problems were **removed** per product decision. The UI no longer renders images on the problem description; schemas do not define `illustrationKey`. |

### Documentation

| Change |
|--------|
| This **README** documents Docker workflow, seeding, contests, API, routes, troubleshooting, and the items above. |

---

## Features (overview)

| Area | What you get |
|------|----------------|
| **Problemset** | Search, difficulty bubbles, topic/company filters, favorites, solved indicators (when logged in) |
| **Workspace** | Full-width IDE layout on `/problem/:id`, Monaco editor, draggable splitters, languages: Python, JavaScript, Java, C++, C, SQL |
| **Statements** | Markdown-style description, **2–3 examples**, **hints**, constraints, visible test cases, solution tab |
| **Judging** | Backend enqueues work; **execution-worker** runs code via Docker |
| **Contests** | Hub + room, join, problem links with `?contest=` query |
| **Real-time** | Redis + Socket.IO (contest timer / status) |
| **Study plans** | Top Interview 150, LC 75, SQL 50 (seeded) |
| **Discuss** | Sample posts (seeded) |
| **Auth** | Register / login, JWT, profile |

---

## Data model (Problem)

Relevant fields for the UI and judge:

- `title`, `description`, `difficulty`, `constraints[]`, `topics[]`, `companies[]`
- `examples[]` — `{ input, output, explanation? }`
- `hints[]` — strings
- `testCases[]` — `{ input, output, isHidden }` (hidden stripped in problem detail API)
- `templates` / `solution` — per-language starter and editorial
- `stats`, `isPremium`

---

## Tech stack

- **Frontend:** React 19, Vite, Monaco Editor, Lucide icons, global CSS (`frontend/src/index.css`) — **not** Tailwind for the main app
- **Backend:** Node.js 20, Express 5, Mongoose, BullMQ, Socket.IO, Redis caching
- **Worker:** Node + Docker CLI for isolated runs
- **Data:** MongoDB 6, Redis 7
- **Ops:** Docker Compose; nginx serves the production build on port **3000**

---

## Repository layout

```
CodeJudgePlatform/
├── frontend/                 # Vite + React SPA
├── backend/                  # REST API, sockets, queues, seed data
│   └── src/data/
│       ├── seeder.js         # Orchestrates seed (problems, contests, plans, discuss)
│       ├── canonicalBulk.js  # Catalog clones, SQL bank, ensureExamplesAndHints
│       ├── canonicalExtras.js
│       └── testCaseGenerators.js
├── execution-worker/         # Job consumer + Docker runs
├── scripts/                  # Misc helpers
├── docker-compose.yml
└── README.md
```

---

## Seeding (what runs and what it wipes)

Command (Docker):

```bash
docker compose exec backend npm run seed
```

Local:

```bash
cd backend && npm run seed
```

**Clears and recreates:** `StudyPlan`, `DiscussPost`, `WeeklyChallenge`, and **all** `Problem` documents.

**Inserts:**

| Item | Count / note |
|------|----------------|
| Hero problems | 6 (e.g. Two Sum, Palindrome, …) |
| Algorithm clones | `BULK_CLONE_COUNT` = **944** (from `canonicalBulk` rotation) |
| SQL drills | **50** |
| **Total problems** | **1000** |
| Weekly challenges / contests | **9** |
| Study plans | 3 (Top 150, LC 75, SQL 50) |
| Discuss posts | Sample threads |

Log line ends with contest count, e.g. `Contests: 9`.

---

## Seeded contests (after `npm run seed`)

| # | Title | Kind | Notes |
|---|-------|------|--------|
| 1 | Weekly Master Challenge #1 | weekly | Primary weekly-style window |
| 2 | **Contest** | contest | Flagship multi-language round; matches problemset **Contest** card |
| 3 | Data Structures Cup | contest | Six problems |
| 4 | String & Hash Sprint | weekly | Later overlapping window |
| 5 | Binary Search Bonanza | contest | Short sprint |
| 6 | Graph & Tree Special | contest | Seven problems |
| 7 | SQL Showdown | contest | Algorithm + SQLite mix |
| 8 | Grand Sprint Contest | contest | Future four-day window |
| 9 | Archive: Winter Warmup (ended) | weekly | Past window for history |

Start/end dates are **relative to the calendar day you run the seeder** (`day()` helper in `seeder.js`).

---

## Quick start (Docker — recommended)

```bash
docker compose build
docker compose up -d
docker compose exec backend npm run seed
```

- **Frontend:** http://localhost:3000  
- **API:** http://localhost:5000 — `GET /health`

### Rebuild after code changes

```bash
docker compose up -d --build
```

Redis caches some list payloads; if data looks stale after re-seeding, restart Redis or wait for TTL.

---

## Local development (no Docker for Node)

**Prerequisites:** Node 20+, MongoDB, Redis, Docker (for the worker to execute code).

Copy `.env.example` → `.env` in `backend/`, `frontend/`, `execution-worker/`.

**Backend:** `MONGO_URI`, `REDIS_URL`, `WORKER_URL`, `JWT_SECRET`, `SOCKET_ORIGIN`, `INTERNAL_API_KEY`  
**Frontend:** `VITE_API_URL`, `VITE_SOCKET_URL`

Four processes: `backend` (`npm start`), `execution-worker` (`npm start`), `frontend` (`npm run dev`), then `backend` `npm run seed` once.

---

## API highlights

- `GET /api/problems` — paginated list; omits heavy fields (`-testCases -templates -solution`)
- `GET /api/problems/:id` — full statement; hidden tests removed
- `GET /api/challenges` — contests with `isLive`, `participantCount`, `problemCount`
- `GET /api/challenges/:id` — detail + populated problems
- `POST /api/challenges/:id/join` — authenticated join

Routes under `backend/src/routes/`.

---

## UI routes (`frontend/src/App.jsx`)

| Path | Page |
|------|------|
| `/`, `/problems` | Problemset + AlgoArena hero |
| `/problem/:id` | Workspace (full-width IDE shell) |
| `/challenges` | Contest hub |
| `/challenges/:id` | Contest room |
| `/explore`, `/discuss`, `/interview`, `/study`, `/study/:slug`, `/mock-interview`, `/favorites`, `/profile`, `/store` | As implemented |
| `/login` | Auth (layout without sidebars) |

---

## Key files reference

| Topic | File(s) |
|-------|---------|
| Examples & hints logic | `backend/src/data/canonicalBulk.js` (`ensureExamplesAndHints`, `pushExampleFromTest`) |
| Seed orchestration | `backend/src/data/seeder.js` |
| Problem schema | `backend/src/models/Problem.js`, `execution-worker/src/models/Problem.js` |
| Problem list / hero | `frontend/src/pages/ProblemList.jsx` |
| Workspace | `frontend/src/pages/Workspace.jsx` |
| Contests list / room | `frontend/src/pages/Contests.jsx`, `ContestRoom.jsx` |
| Contest API | `backend/src/controllers/challengeController.js` |
| Weekly challenge schema | `backend/src/models/WeeklyChallenge.js` |

---

## Troubleshooting

- **Submissions stuck / wrong verdict:** Worker up? `WORKER_URL` and `INTERNAL_API_KEY` match? Docker socket mounted for worker container?
- **Empty problems:** Run seed; check `MONGO_URI` matches API.
- **Old problem text after seed:** New IDs assigned; clear browser cache. Redis: restart or wait for cache expiry.
- **Frontend can’t reach API in Docker:** `VITE_API_URL` / `VITE_SOCKET_URL` are baked at **image build**; rebuild frontend after changing them.

---

## Contributors

Add your names / course team here.

---

## License

Educational / academic use unless otherwise specified.

---

## Acknowledgements

Inspired by LeetCode, HackerRank, Codeforces, and similar platforms.
