const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const vm = require("vm");
const { v4: uuidv4 } = require("uuid");
const problems = require("./data/problems");
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
  const user = { id: uuidv4(), username, email, passwordHash, solved: [] };
  store.addUser(user);
  return res.status(201).json({ message: "Registered successfully" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const users = store.getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, {
    expiresIn: "1d"
  });
  return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

app.get("/api/problems", auth, (_req, res) => {
  const list = problems.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags
  }));
  return res.json(list);
});

app.get("/api/problems/:id", auth, (req, res) => {
  const problem = problems.find((p) => p.id === req.params.id);
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
  const problem = problems.find((p) => p.id === problemId);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code is required" });
  const result = evaluateCode(problem, code);
  return res.json(result);
});

app.post("/api/submissions", auth, (req, res) => {
  const { problemId, code } = req.body || {};
  const problem = problems.find((p) => p.id === problemId);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code is required" });

  const result = evaluateCode(problem, code);
  const submission = {
    id: uuidv4(),
    userId: req.user.id,
    username: req.user.username,
    problemId,
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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "AlgoArena" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AlgoArena API running at http://localhost:${PORT}`);
});
