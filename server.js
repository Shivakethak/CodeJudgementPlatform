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

function evaluateCode(problem, code) {
  let passed = 0;
  const details = [];
  for (let i = 0; i < problem.tests.length; i += 1) {
    const test = problem.tests[i];
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
    status: passed === problem.tests.length ? "Accepted" : "Failed",
    passed,
    total: problem.tests.length,
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
  const me = store.getUsers().find((u) => u.id === req.user.id);
  const solvedSet = new Set(Array.isArray(me?.solved) ? me.solved : []);
  const list = store.getProblems().map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags,
    solved: solvedSet.has(p.id)
  }));
  return res.json(list);
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
    starterCode: problem.starterCode
  });
});

app.post("/api/submissions/run", auth, (req, res) => {
  const { problemId, code } = req.body || {};
  const problem = store.getProblems().find((p) => p.id === problemId);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code is required" });
  const result = evaluateCode(problem, code);
  return res.json(result);
});

app.post("/api/submissions", auth, (req, res) => {
  const { problemId, code, contestId } = req.body || {};
  const problem = store.getProblems().find((p) => p.id === problemId);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code is required" });

  const result = evaluateCode(problem, code);
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
  const mine = store
    .getSubmissions()
    .filter((s) => s.userId === req.user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.json(mine);
});

app.get("/api/leaderboard", auth, (_req, res) => {
  const board = store
    .getUsers()
    .map((u) => ({ username: u.username, solved: Array.isArray(u.solved) ? u.solved.length : 0 }))
    .sort((a, b) => b.solved - a.solved || a.username.localeCompare(b.username));
  return res.json(board);
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

app.get("/api/contests", auth, (_req, res) => {
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
      participantCount: Array.isArray(contest.participants) ? contest.participants.length : 0
    };
  });
  return res.json(contests);
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

  return res.json(board);
});

app.get("/api/problems/:id/discussions", auth, (req, res) => {
  const items = store
    .getDiscussions()
    .filter((d) => d.problemId === req.params.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.json(items);
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
    createdAt: new Date().toISOString()
  };
  store.addDiscussion(item);
  return res.status(201).json(item);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "AlgoArena" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AlgoArena API running at http://localhost:${PORT}`);
});
