const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const vm = require("vm");
const { v4: uuidv4 } = require("uuid");
const store = require("./services/store");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10) || 20, 1), 100);
  return { page, limit };
}

function paginateArray(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;
  return {
    items: items.slice(offset, offset + limit),
    page: safePage,
    limit,
    total,
    totalPages
  };
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  const me = store.getUsers().find((u) => u.id === req.user.id);
  if (!me || !me.isAdmin) return res.status(403).json({ error: "Admin only route" });
  return next();
}

function safeEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function validateSubmissionCode(code) {
  if (typeof code !== "string" || !code.trim()) return "Code is required";
  if (code.length > 12000) return "Code size exceeds limit";
  const blockedPatterns = [
    "while (true)",
    "for (;;)",
    "require(",
    "process.",
    "globalThis",
    "Function(",
    "eval(",
    "import("
  ];
  const lowered = code.toLowerCase();
  if (blockedPatterns.some((p) => lowered.includes(p.toLowerCase()))) {
    return "Code contains restricted pattern";
  }
  return null;
}

function runUserCode(code, input) {
  const wrapped = `
    ${code}
    if (typeof solve !== "function") {
      throw new Error("You must define function solve(input)");
    }
    solve(${JSON.stringify(input)});
  `;
  const script = new vm.Script(wrapped);
  const context = vm.createContext({});
  return script.runInContext(context, { timeout: 1000 });
}

function evaluateCode(problem, code, mode) {
  const tests = Array.isArray(problem.tests) ? problem.tests : [];
  const selectedTests =
    mode === "run" ? tests.filter((t) => !t.hidden).slice(0, 3) : tests;
  const activeTests = selectedTests.length ? selectedTests : tests.slice(0, 1);
  let passed = 0;
  const details = [];
  for (let i = 0; i < activeTests.length; i += 1) {
    const test = activeTests[i];
    try {
      const actual = runUserCode(code, test.input);
      const ok = safeEqual(actual, test.expected);
      if (ok) passed += 1;
      details.push({
        testCase: i + 1,
        status: ok ? "Accepted" : "Wrong Answer",
        expected: test.expected,
        actual,
        input: test.input
      });
    } catch (err) {
      details.push({
        testCase: i + 1,
        status: "Runtime Error",
        expected: test.expected,
        actual: String(err.message || err),
        input: test.input
      });
    }
  }
  return {
    status: passed === activeTests.length ? "Accepted" : "Failed",
    passed,
    total: activeTests.length,
    details
  };
}

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email, password required" });
  }
  const users = store.getUsers();
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    username,
    email,
    passwordHash,
    solved: [],
    isAdmin: users.length === 0
  };
  store.addUser(user);
  return res.status(201).json({ message: "Registered successfully", isAdmin: user.isAdmin });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const users = store.getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, {
    expiresIn: "1d"
  });
  return res.json({ token, user: { id: user.id, username: user.username, email: user.email, isAdmin: !!user.isAdmin } });
});

app.get("/api/problems", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const search = String(req.query.search || "").trim().toLowerCase();
  const difficulty = String(req.query.difficulty || "ALL");
  const me = store.getUsers().find((u) => u.id === req.user.id);
  const solvedSet = new Set(Array.isArray(me?.solved) ? me.solved : []);
  const list = store
    .getProblems()
    .map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags,
    solved: solvedSet.has(p.id)
    }))
    .filter((p) => {
      const okSearch =
        !search || p.title.toLowerCase().includes(search) || p.tags.join(" ").toLowerCase().includes(search);
      const okDifficulty = difficulty === "ALL" || p.difficulty === difficulty;
      return okSearch && okDifficulty;
    });
  return res.json(paginateArray(list, page, limit));
});

app.get("/api/problems/:id", auth, (req, res) => {
  const problem = store.getProblems().find((p) => p.id === req.params.id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  return res.json({
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    statement: problem.statement,
    constraints: problem.constraints || [],
    examples: problem.examples || [],
    hints: problem.hints || [],
    visibleTestCount: (problem.tests || []).filter((t) => !t.hidden).length,
    totalTestCount: (problem.tests || []).length,
    starterCode: problem.starterCode
  });
});

app.post("/api/submissions/run", auth, (req, res) => {
  const { problemId, code } = req.body || {};
  const problem = store.getProblems().find((p) => p.id === problemId);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  const codeErr = validateSubmissionCode(code);
  if (codeErr) return res.status(400).json({ error: codeErr });
  const result = evaluateCode(problem, code, "run");
  return res.json(result);
});

app.post("/api/submissions", auth, (req, res) => {
  const { problemId, code, contestId } = req.body || {};
  const problem = store.getProblems().find((p) => p.id === problemId);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  const codeErr = validateSubmissionCode(code);
  if (codeErr) return res.status(400).json({ error: codeErr });
  if (contestId) {
    const contest = store.getContests().find((c) => c.id === contestId);
    if (!contest) return res.status(404).json({ error: "Contest not found" });
    const now = Date.now();
    const start = new Date(contest.startTime).getTime();
    const end = new Date(contest.endTime).getTime();
    if (now < start || now > end) return res.status(403).json({ error: "Contest is not live" });
    const joined = (contest.participants || []).some((p) => p.userId === req.user.id);
    if (!joined) return res.status(403).json({ error: "Join contest before submitting" });
    if (!contest.problemIds.includes(problemId)) {
      return res.status(403).json({ error: "Problem is not part of this contest" });
    }
  }

  const result = evaluateCode(problem, code, "submit");
  const submission = {
    id: uuidv4(),
    userId: req.user.id,
    username: req.user.username,
    problemId,
    contestId: contestId || null,
    status: result.status,
    passed: result.passed,
    total: result.total,
    createdAt: new Date().toISOString(),
    details: result.details
  };
  store.addSubmission(submission);

  if (result.status === "Accepted") {
    store.updateUser(req.user.id, (user) => {
      const solved = Array.isArray(user.solved) ? user.solved : [];
      if (!solved.includes(problemId)) solved.push(problemId);
      return { ...user, solved };
    });
  }
  return res.status(201).json(submission);
});

app.get("/api/submissions/me", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const mine = store
    .getSubmissions()
    .filter((s) => s.userId === req.user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.json(paginateArray(mine, page, limit));
});

app.get("/api/leaderboard", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const board = store
    .getUsers()
    .map((u) => ({ username: u.username, solved: Array.isArray(u.solved) ? u.solved.length : 0 }))
    .sort((a, b) => b.solved - a.solved || a.username.localeCompare(b.username));
  return res.json(paginateArray(board, page, limit));
});

app.get("/api/users", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const users = store
    .getUsers()
    .map((u) => ({ username: u.username, solved: Array.isArray(u.solved) ? u.solved.length : 0 }))
    .sort((a, b) => b.solved - a.solved || a.username.localeCompare(b.username));
  return res.json(paginateArray(users, page, limit));
});

app.get("/api/users/:username", auth, (req, res) => {
  const user = store.getUsers().find((u) => u.username.toLowerCase() === String(req.params.username).toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found" });
  const submissions = store.getSubmissions().filter((s) => s.userId === user.id);
  const accepted = submissions.filter((s) => s.status === "Accepted").length;
  return res.json({
    username: user.username,
    solvedCount: Array.isArray(user.solved) ? user.solved.length : 0,
    totalAttempts: submissions.length,
    accepted,
    acceptanceRate: submissions.length ? Math.round((accepted / submissions.length) * 100) : 0,
    recentSubmissions: submissions.slice(-10).reverse()
  });
});

app.get("/api/daily-challenge", auth, (_req, res) => {
  const problems = store.getProblems();
  if (!problems.length) return res.status(404).json({ error: "No problems available" });
  const today = new Date();
  const key = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
  const idx = hash % problems.length;
  const p = problems[idx];
  return res.json({
    date: key,
    problemId: p.id,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags
  });
});

app.get("/api/recommendations", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const me = store.getUsers().find((u) => u.id === req.user.id);
  if (!me) return res.status(404).json({ error: "User not found" });
  const solved = new Set(Array.isArray(me.solved) ? me.solved : []);
  const candidates = store.getProblems().filter((p) => !solved.has(p.id));
  const scored = candidates.map((p) => {
    let score = 0;
    if (p.difficulty === "Easy") score += 3;
    if (p.difficulty === "Medium") score += 2;
    if (p.difficulty === "Hard") score += 1;
    score += Math.min((p.tags || []).length, 3);
    return { ...p, score };
  });
  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const result = scored.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags
    }));
  return res.json(paginateArray(result, page, limit));
});

app.get("/api/me/stats", auth, (req, res) => {
  const users = store.getUsers();
  const me = users.find((u) => u.id === req.user.id);
  if (!me) return res.status(404).json({ error: "User not found" });
  const solvedCount = Array.isArray(me.solved) ? me.solved.length : 0;
  const totalProblems = store.getProblems().length;
  const attempts = store.getSubmissions().filter((s) => s.userId === req.user.id).length;
  return res.json({
    username: me.username,
    solvedCount,
    totalProblems,
    attempts,
    acceptanceRate: attempts ? Math.round((solvedCount / attempts) * 100) : 0
  });
});

app.get("/api/submissions/me/export", auth, (req, res) => {
  const rows = store
    .getSubmissions()
    .filter((s) => s.userId === req.user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const header = "submissionId,problemId,status,passed,total,createdAt";
  const body = rows.map((r) => `${r.id},${r.problemId},${r.status},${r.passed},${r.total},${r.createdAt}`).join("\n");
  const csv = `${header}\n${body}`;
  res.setHeader("Content-Type", "text/csv");
  return res.send(csv);
});

app.get("/api/problems/:id/note", auth, (req, res) => {
  const note = store.getNotes().find((n) => n.userId === req.user.id && n.problemId === req.params.id);
  return res.json(note || { problemId: req.params.id, text: "" });
});

app.put("/api/problems/:id/note", auth, (req, res) => {
  const text = String(req.body?.text || "");
  const note = {
    id: `${req.user.id}:${req.params.id}`,
    userId: req.user.id,
    problemId: req.params.id,
    text,
    updatedAt: new Date().toISOString()
  };
  store.upsertNote(note);
  return res.json(note);
});

app.get("/api/playlists", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const mine = store
    .getPlaylists()
    .filter((p) => p.userId === req.user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.json(paginateArray(mine, page, limit));
});

app.post("/api/playlists", auth, (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Playlist name is required" });
  const playlist = {
    id: uuidv4(),
    userId: req.user.id,
    name,
    problemIds: [],
    createdAt: new Date().toISOString()
  };
  store.addPlaylist(playlist);
  return res.status(201).json(playlist);
});

app.post("/api/playlists/:id/problems", auth, (req, res) => {
  const problemId = String(req.body?.problemId || "");
  if (!problemId) return res.status(400).json({ error: "problemId required" });
  if (!store.getProblems().find((p) => p.id === problemId)) return res.status(404).json({ error: "Problem not found" });
  const updated = store.updatePlaylist(req.params.id, (p) => {
    if (p.userId !== req.user.id) return p;
    const problemIds = Array.isArray(p.problemIds) ? p.problemIds : [];
    if (!problemIds.includes(problemId)) problemIds.push(problemId);
    return { ...p, problemIds };
  });
  if (!updated || updated.userId !== req.user.id) return res.status(404).json({ error: "Playlist not found" });
  return res.json(updated);
});

app.post("/api/admin/problems", auth, adminOnly, (req, res) => {
  const payload = req.body || {};
  if (!payload.title || !payload.statement || !payload.starterCode || !Array.isArray(payload.tests)) {
    return res.status(400).json({ error: "title, statement, starterCode, tests are required" });
  }
  const problem = {
    id: payload.id || String(payload.title).toLowerCase().replace(/\s+/g, "-"),
    title: payload.title,
    difficulty: payload.difficulty || "Easy",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    constraints: Array.isArray(payload.constraints) ? payload.constraints : [],
    examples: Array.isArray(payload.examples) ? payload.examples : [],
    hints: Array.isArray(payload.hints) ? payload.hints : [],
    statement: payload.statement,
    starterCode: payload.starterCode,
    tests: payload.tests
  };
  if (store.getProblems().find((p) => p.id === problem.id)) {
    return res.status(409).json({ error: "Problem id already exists" });
  }
  store.addProblem(problem);
  return res.status(201).json(problem);
});

app.put("/api/admin/problems/:id", auth, adminOnly, (req, res) => {
  const update = req.body || {};
  const updated = store.updateProblem(req.params.id, (problem) => ({ ...problem, ...update }));
  if (!updated) return res.status(404).json({ error: "Problem not found" });
  return res.json(updated);
});

app.post("/api/contests", auth, adminOnly, (req, res) => {
  const { title, description, startTime, endTime, problemIds } = req.body || {};
  if (!title || !startTime || !endTime || !Array.isArray(problemIds) || !problemIds.length) {
    return res.status(400).json({ error: "title, startTime, endTime, problemIds required" });
  }
  const availableProblemIds = new Set(store.getProblems().map((p) => p.id));
  for (const pid of problemIds) {
    if (!availableProblemIds.has(pid)) return res.status(400).json({ error: `Invalid problem id: ${pid}` });
  }
  const contest = {
    id: uuidv4(),
    title,
    description: description || "",
    startTime,
    endTime,
    problemIds,
    createdBy: req.user.id,
    participants: []
  };
  store.addContest(contest);
  return res.status(201).json(contest);
});

app.get("/api/contests", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const now = Date.now();
  const contests = store.getContests().map((contest) => {
    const start = new Date(contest.startTime).getTime();
    const end = new Date(contest.endTime).getTime();
    let status = "upcoming";
    if (now >= start && now <= end) status = "live";
    if (now > end) status = "ended";
    return {
      ...contest,
      status,
      participantCount: Array.isArray(contest.participants) ? contest.participants.length : 0,
      msToStart: Math.max(0, start - now),
      msToEnd: Math.max(0, end - now)
    };
  });
  return res.json(paginateArray(contests, page, limit));
});

app.post("/api/contests/:id/join", auth, (req, res) => {
  const contest = store.updateContest(req.params.id, (c) => {
    const participants = Array.isArray(c.participants) ? c.participants : [];
    if (!participants.find((p) => p.userId === req.user.id)) {
      participants.push({ userId: req.user.id, username: req.user.username, joinedAt: new Date().toISOString() });
    }
    return { ...c, participants };
  });
  if (!contest) return res.status(404).json({ error: "Contest not found" });
  return res.json({ message: "Joined contest", contestId: contest.id });
});

app.get("/api/contests/:id/leaderboard", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const contest = store.getContests().find((c) => c.id === req.params.id);
  if (!contest) return res.status(404).json({ error: "Contest not found" });
  const start = new Date(contest.startTime).getTime();
  const end = new Date(contest.endTime).getTime();
  const allowed = new Set(contest.problemIds);
  const scoreMap = new Map();

  store.getSubmissions().forEach((s) => {
    const time = new Date(s.createdAt).getTime();
    if (s.status !== "Accepted") return;
    if (!allowed.has(s.problemId)) return;
    if (time < start || time > end) return;
    const key = s.userId;
    if (!scoreMap.has(key)) scoreMap.set(key, { username: s.username, solvedSet: new Set(), penalties: 0 });
    const row = scoreMap.get(key);
    row.solvedSet.add(s.problemId);
    row.penalties += 1;
  });

  const board = [...scoreMap.entries()]
    .map(([_userId, value]) => ({
      username: value.username,
      solved: value.solvedSet.size,
      penalties: value.penalties
    }))
    .sort((a, b) => b.solved - a.solved || a.penalties - b.penalties || a.username.localeCompare(b.username));

  return res.json(paginateArray(board, page, limit));
});

app.get("/api/contests/:id/problems", auth, (req, res) => {
  const contest = store.getContests().find((c) => c.id === req.params.id);
  if (!contest) return res.status(404).json({ error: "Contest not found" });
  const now = Date.now();
  const start = new Date(contest.startTime).getTime();
  const end = new Date(contest.endTime).getTime();
  const joined = (contest.participants || []).some((p) => p.userId === req.user.id);
  const unlocked = joined && now >= start && now <= end;
  const byId = new Map(store.getProblems().map((p) => [p.id, p]));
  const items = contest.problemIds.map((id) => {
    const p = byId.get(id);
    if (!p) return { id, locked: true };
    return {
      id: p.id,
      title: unlocked ? p.title : "Locked Problem",
      difficulty: unlocked ? p.difficulty : "Locked",
      tags: unlocked ? p.tags : [],
      locked: !unlocked
    };
  });
  return res.json({ contestId: contest.id, unlocked, items });
});

app.get("/api/problems/:id/discussions", auth, (req, res) => {
  const { page, limit } = parsePagination(req);
  const items = store
    .getDiscussions()
    .filter((d) => d.problemId === req.params.id)
    .sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  return res.json(paginateArray(items, page, limit));
});

app.get("/api/admin/analytics", auth, adminOnly, (_req, res) => {
  const users = store.getUsers();
  const submissions = store.getSubmissions();
  const problems = store.getProblems();
  const contests = store.getContests();
  const discussions = store.getDiscussions();
  const acceptedCount = submissions.filter((s) => s.status === "Accepted").length;
  const difficultyBreakdown = problems.reduce(
    (acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    },
    { Easy: 0, Medium: 0, Hard: 0 }
  );
  const topProblemAttempts = [...problems]
    .map((p) => ({
      problemId: p.id,
      attempts: submissions.filter((s) => s.problemId === p.id).length
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 5);
  return res.json({
    totals: {
      users: users.length,
      submissions: submissions.length,
      problems: problems.length,
      contests: contests.length,
      discussions: discussions.length
    },
    acceptanceRate: submissions.length ? Math.round((acceptedCount / submissions.length) * 100) : 0,
    difficultyBreakdown,
    topProblemAttempts
  });
});

app.post("/api/problems/:id/discussions", auth, (req, res) => {
  const { text } = req.body || {};
  if (!text || !String(text).trim()) return res.status(400).json({ error: "text is required" });
  const problem = store.getProblems().find((p) => p.id === req.params.id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  const item = {
    id: uuidv4(),
    problemId: req.params.id,
    userId: req.user.id,
    username: req.user.username,
    text: String(text).trim(),
    createdAt: new Date().toISOString(),
    pinned: false
  };
  store.addDiscussion(item);
  return res.status(201).json(item);
});

app.patch("/api/discussions/:id/pin", auth, adminOnly, (req, res) => {
  const updated = store.updateDiscussion(req.params.id, (d) => ({ ...d, pinned: !d.pinned }));
  if (!updated) return res.status(404).json({ error: "Discussion not found" });
  return res.json(updated);
});

app.delete("/api/discussions/:id", auth, adminOnly, (req, res) => {
  const ok = store.deleteDiscussion(req.params.id);
  if (!ok) return res.status(404).json({ error: "Discussion not found" });
  return res.json({ message: "Deleted" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "AlgoArena" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`AlgoArena API running at http://localhost:${PORT}`);
  });
}

module.exports = app;
