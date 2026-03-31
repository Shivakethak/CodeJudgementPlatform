const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const seedProblems = require("../data/problems");

function getDefaultDb() {
  return {
    users: [],
    submissions: [],
    problems: seedProblems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      constraints: p.constraints || [],
      examples: p.examples || [],
      hints: p.hints || [],
      statement: p.statement,
      starterCode: p.starterCode,
      tests: p.tests
    })),
    contests: [],
    discussions: []
  };
}

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(getDefaultDb(), null, 2), "utf8");
  }
}

function loadDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const parsed = JSON.parse(raw || "{}");
  const defaults = getDefaultDb();
  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    problems: Array.isArray(parsed.problems) && parsed.problems.length ? parsed.problems : defaults.problems,
    contests: Array.isArray(parsed.contests) ? parsed.contests : [],
    discussions: Array.isArray(parsed.discussions) ? parsed.discussions : []
  };
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function getUsers() {
  return loadDb().users;
}

function getSubmissions() {
  return loadDb().submissions;
}

function getProblems() {
  return loadDb().problems;
}

function getContests() {
  return loadDb().contests;
}

function getDiscussions() {
  return loadDb().discussions;
}

function addUser(user) {
  const db = loadDb();
  db.users.push(user);
  saveDb(db);
}

function updateUser(userId, updater) {
  const db = loadDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  const updated = updater(db.users[idx]);
  db.users[idx] = updated;
  saveDb(db);
  return updated;
}

function addSubmission(submission) {
  const db = loadDb();
  db.submissions.push(submission);
  saveDb(db);
}

function addProblem(problem) {
  const db = loadDb();
  db.problems.push(problem);
  saveDb(db);
}

function updateProblem(problemId, updater) {
  const db = loadDb();
  const idx = db.problems.findIndex((p) => p.id === problemId);
  if (idx === -1) return null;
  db.problems[idx] = updater(db.problems[idx]);
  saveDb(db);
  return db.problems[idx];
}

function addContest(contest) {
  const db = loadDb();
  db.contests.push(contest);
  saveDb(db);
}

function updateContest(contestId, updater) {
  const db = loadDb();
  const idx = db.contests.findIndex((c) => c.id === contestId);
  if (idx === -1) return null;
  db.contests[idx] = updater(db.contests[idx]);
  saveDb(db);
  return db.contests[idx];
}

function addDiscussion(discussion) {
  const db = loadDb();
  db.discussions.push(discussion);
  saveDb(db);
}

function updateDiscussion(discussionId, updater) {
  const db = loadDb();
  const idx = db.discussions.findIndex((d) => d.id === discussionId);
  if (idx === -1) return null;
  db.discussions[idx] = updater(db.discussions[idx]);
  saveDb(db);
  return db.discussions[idx];
}

function deleteDiscussion(discussionId) {
  const db = loadDb();
  const before = db.discussions.length;
  db.discussions = db.discussions.filter((d) => d.id !== discussionId);
  if (db.discussions.length === before) return false;
  saveDb(db);
  return true;
}

module.exports = {
  getUsers,
  getSubmissions,
  getProblems,
  getContests,
  getDiscussions,
  addUser,
  updateUser,
  addSubmission,
  addProblem,
  updateProblem,
  addContest,
  updateContest,
  addDiscussion,
  updateDiscussion,
  deleteDiscussion
};
