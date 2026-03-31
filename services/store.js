const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], submissions: [] }, null, 2), "utf8");
  }
}

function loadDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const parsed = JSON.parse(raw || "{}");
  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    submissions: Array.isArray(parsed.submissions) ? parsed.submissions : []
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

module.exports = {
  getUsers,
  getSubmissions,
  addUser,
  updateUser,
  addSubmission
};
