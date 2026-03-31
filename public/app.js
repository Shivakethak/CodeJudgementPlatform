const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  selectedProblemId: null,
  problems: [],
  submissions: [],
  contests: [],
  problemPage: 1,
  submissionPage: 1,
  pageSize: 6,
  search: "",
  difficulty: "ALL",
  selectedContestId: null,
  contestTicker: null
};

const authMsg = document.getElementById("auth-msg");
const userPill = document.getElementById("user-pill");
const dashboard = document.getElementById("dashboard");
const problemSearch = document.getElementById("problem-search");
const difficultyFilter = document.getElementById("difficulty-filter");
const adminPanel = document.getElementById("admin-panel");

function setAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("token", token || "");
  localStorage.setItem("user", JSON.stringify(user || null));
  renderAuth();
}

function renderAuth() {
  if (state.user) {
    userPill.textContent = `${state.user.username} logged in${state.user.isAdmin ? " (Admin)" : ""}`;
    adminPanel.classList.toggle("hidden", !state.user.isAdmin);
    dashboard.classList.remove("hidden");
    loadProblems();
    loadSubmissions();
    loadLeaderboard();
    loadProfileStats();
    loadContests();
  } else {
    userPill.textContent = "Guest";
    adminPanel.classList.add("hidden");
    dashboard.classList.add("hidden");
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: state.token ? `Bearer ${state.token}` : "",
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

document.getElementById("register-btn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    });
    authMsg.textContent = "Registered. Login now.";
  } catch (err) {
    authMsg.textContent = err.message;
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setAuth(data.token, data.user);
    authMsg.textContent = "Logged in.";
  } catch (err) {
    authMsg.textContent = err.message;
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  setAuth("", null);
  authMsg.textContent = "Logged out.";
});

async function loadProblems() {
  try {
    state.problems = await api("/api/problems");
    renderProblems();
  } catch (err) {
    document.getElementById("problems-list").innerHTML = `<li>${err.message}</li>`;
  }
}

function getFilteredProblems() {
  return state.problems.filter((p) => {
    const hitSearch =
      !state.search || p.title.toLowerCase().includes(state.search) || p.tags.join(" ").toLowerCase().includes(state.search);
    const hitDifficulty = state.difficulty === "ALL" || p.difficulty === state.difficulty;
    return hitSearch && hitDifficulty;
  });
}

function renderProblems() {
  const list = document.getElementById("problems-list");
  list.innerHTML = "";
  const filtered = getFilteredProblems();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  if (state.problemPage > totalPages) state.problemPage = totalPages;
  const start = (state.problemPage - 1) * state.pageSize;
  const pageItems = filtered.slice(start, start + state.pageSize);

  pageItems.forEach((p) => {
    const li = document.createElement("li");
    const solved = p.solved ? '<span class="status-chip status-solved">Solved</span>' : "";
    li.innerHTML = `<span class="problem-link">${p.title}</span> (${p.difficulty}) ${solved}<div class="muted">${p.tags.join(", ")}</div>`;
    li.querySelector(".problem-link").addEventListener("click", () => selectProblem(p.id));
    list.appendChild(li);
  });

  if (!pageItems.length) {
    list.innerHTML = "<li>No problems match your filters.</li>";
  }
  document.getElementById("problems-page").textContent = `Page ${state.problemPage}/${totalPages}`;
}

async function selectProblem(problemId) {
  try {
    const p = await api(`/api/problems/${problemId}`);
    state.selectedProblemId = p.id;
    document.getElementById("problem-title").textContent = p.title;
    document.getElementById("problem-meta").textContent = `${p.difficulty} | ${p.tags.join(", ")}`;
    document.getElementById("problem-statement").textContent = p.statement;
    renderProblemMetaBlocks(p);
    document.getElementById("code-editor").value = p.starterCode;
    document.getElementById("judge-result").textContent = "";
    loadDiscussions();
  } catch (err) {
    document.getElementById("judge-result").textContent = err.message;
  }
}

function formatResult(label, result) {
  const lines = [`Mode: ${label}`, `Status: ${result.status}`, `Passed: ${result.passed}/${result.total}`];
  if (label === "Run") lines.push("Note: Run mode uses only visible sample tests.");
  if (label === "Submit") lines.push("Note: Submit mode uses full test suite including hidden tests.");
  lines.push("");
  result.details.forEach((d) => {
    lines.push(`Case ${d.testCase}: ${d.status}`);
    lines.push(`Input: ${JSON.stringify(d.input)}`);
    lines.push(`Expected: ${JSON.stringify(d.expected)}`);
    lines.push(`Actual: ${JSON.stringify(d.actual)}`);
    lines.push("");
  });
  return lines.join("\n");
}

function renderProblemMetaBlocks(problem) {
  const examples = document.getElementById("problem-examples");
  const constraints = document.getElementById("problem-constraints");
  const hints = document.getElementById("problem-hints");

  examples.innerHTML = `<div class="meta-block-title">Examples</div>${(problem.examples || [])
    .map(
      (ex) =>
        `<div>Input: ${ex.input}<br/>Output: ${ex.output}${ex.explanation ? `<br/>Explanation: ${ex.explanation}` : ""}</div>`
    )
    .join("<hr/>")}`;

  constraints.innerHTML = `<div class="meta-block-title">Constraints</div><ul>${(problem.constraints || [])
    .map((c) => `<li>${c}</li>`)
    .join("")}</ul>`;

  hints.innerHTML = `<div class="meta-block-title">Hints</div><ul>${(problem.hints || [])
    .map((h) => `<li>${h}</li>`)
    .join("")}</ul>`;
}

async function runOrSubmit(isSubmit) {
  if (!state.selectedProblemId) {
    document.getElementById("judge-result").textContent = "Select a problem first.";
    return;
  }
  try {
    const code = document.getElementById("code-editor").value;
    const result = await api(isSubmit ? "/api/submissions" : "/api/submissions/run", {
      method: "POST",
      body: JSON.stringify({
        problemId: state.selectedProblemId,
        code,
        contestId: state.selectedContestId || null
      })
    });
    document.getElementById("judge-result").textContent = formatResult(isSubmit ? "Submit" : "Run", result);
    if (isSubmit) {
      loadSubmissions();
      loadLeaderboard();
      loadProblems();
      loadProfileStats();
    }
  } catch (err) {
    document.getElementById("judge-result").textContent = err.message;
  }
}

document.getElementById("run-btn").addEventListener("click", () => runOrSubmit(false));
document.getElementById("submit-btn").addEventListener("click", () => runOrSubmit(true));

async function loadSubmissions() {
  try {
    state.submissions = await api("/api/submissions/me");
    renderSubmissions();
  } catch (err) {
    document.getElementById("submissions-list").innerHTML = `<li>${err.message}</li>`;
  }
}

function renderSubmissions() {
  const list = document.getElementById("submissions-list");
  list.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(state.submissions.length / state.pageSize));
  if (state.submissionPage > totalPages) state.submissionPage = totalPages;
  const start = (state.submissionPage - 1) * state.pageSize;
  const pageItems = state.submissions.slice(start, start + state.pageSize);
  pageItems.forEach((s) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="problem-link">${s.problemId}</span>: ${s.status} (${s.passed}/${s.total})<div class="muted">${new Date(
      s.createdAt
    ).toLocaleString()}</div>`;
    li.querySelector(".problem-link").addEventListener("click", () => showSubmissionDetail(s));
    list.appendChild(li);
  });
  if (!pageItems.length) list.innerHTML = "<li>No submissions yet.</li>";
  document.getElementById("subs-page").textContent = `Page ${state.submissionPage}/${totalPages}`;
}

function showSubmissionDetail(submission) {
  const lines = [
    `Submission: ${submission.id}`,
    `Problem: ${submission.problemId}`,
    `Status: ${submission.status}`,
    `Score: ${submission.passed}/${submission.total}`,
    ""
  ];
  submission.details.forEach((d) => {
    lines.push(`Case ${d.testCase}: ${d.status}`);
    lines.push(`Input: ${JSON.stringify(d.input)}`);
    lines.push(`Expected: ${JSON.stringify(d.expected)}`);
    lines.push(`Actual: ${JSON.stringify(d.actual)}`);
    lines.push("");
  });
  document.getElementById("submission-detail").textContent = lines.join("\n");
}

async function loadLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";
  try {
    const data = await api("/api/leaderboard");
    data.forEach((entry, idx) => {
      const li = document.createElement("li");
      li.textContent = `#${idx + 1} ${entry.username} - solved ${entry.solved}`;
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li>${err.message}</li>`;
  }
}

async function loadDiscussions() {
  const list = document.getElementById("discussion-list");
  list.innerHTML = "";
  if (!state.selectedProblemId) {
    list.innerHTML = "<li>Select a problem to view discussions.</li>";
    return;
  }
  try {
    const rows = await api(`/api/problems/${state.selectedProblemId}/discussions`);
    rows.forEach((row) => {
      const li = document.createElement("li");
      const pin = row.pinned ? " [PINNED]" : "";
      const controls = state.user?.isAdmin
        ? `<button data-pin="${row.id}" class="ghost">Pin/Unpin</button> <button data-del="${row.id}" class="ghost">Delete</button>`
        : "";
      li.innerHTML = `<strong>${row.username}${pin}:</strong> ${row.text}<div class="muted">${new Date(
        row.createdAt
      ).toLocaleString()}</div><div>${controls}</div>`;
      list.appendChild(li);
    });
    if (state.user?.isAdmin) {
      list.querySelectorAll("[data-pin]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await api(`/api/discussions/${btn.getAttribute("data-pin")}/pin`, { method: "PATCH" });
          loadDiscussions();
        });
      });
      list.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await api(`/api/discussions/${btn.getAttribute("data-del")}`, { method: "DELETE" });
          loadDiscussions();
        });
      });
    }
    if (!rows.length) list.innerHTML = "<li>No discussions yet.</li>";
  } catch (err) {
    list.innerHTML = `<li>${err.message}</li>`;
  }
}

document.getElementById("discussion-post-btn").addEventListener("click", async () => {
  if (!state.selectedProblemId) {
    document.getElementById("judge-result").textContent = "Select a problem first.";
    return;
  }
  const input = document.getElementById("discussion-input");
  const text = String(input.value || "").trim();
  if (!text) return;
  try {
    await api(`/api/problems/${state.selectedProblemId}/discussions`, {
      method: "POST",
      body: JSON.stringify({ text })
    });
    input.value = "";
    loadDiscussions();
  } catch (err) {
    document.getElementById("judge-result").textContent = err.message;
  }
});

async function loadContests() {
  const list = document.getElementById("contests-list");
  list.innerHTML = "";
  try {
    state.contests = await api("/api/contests");
    state.contests.forEach((contest) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="problem-link">${contest.title}</span> (${contest.status})<div class="muted">${contest.participantCount} participants</div>`;
      li.querySelector(".problem-link").addEventListener("click", async () => {
        state.selectedContestId = contest.id;
        try {
          await api(`/api/contests/${contest.id}/join`, { method: "POST" });
        } catch (_err) {
          // Ignore duplicate joins.
        }
        loadContestLeaderboard(contest.id);
        document.getElementById("judge-result").textContent = `Joined contest: ${contest.title}`;
      });
      list.appendChild(li);
    });
    if (!state.contests.length) list.innerHTML = "<li>No contests available.</li>";
    startContestTicker();
  } catch (err) {
    list.innerHTML = `<li>${err.message}</li>`;
  }
}

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function startContestTicker() {
  if (state.contestTicker) clearInterval(state.contestTicker);
  state.contestTicker = setInterval(async () => {
    try {
      state.contests = await api("/api/contests");
      const active = state.contests.find((c) => c.status === "live");
      const text = active
        ? `Live: ${active.title} | Ends in ${formatMs(active.msToEnd)}`
        : "No live contest right now.";
      document.getElementById("contest-active").textContent = text;
    } catch (_err) {
      document.getElementById("contest-active").textContent = "Contest status unavailable.";
    }
  }, 1000);
}

async function loadContestLeaderboard(contestId) {
  const list = document.getElementById("contest-leaderboard");
  list.innerHTML = "";
  try {
    const board = await api(`/api/contests/${contestId}/leaderboard`);
    board.forEach((row, idx) => {
      const li = document.createElement("li");
      li.textContent = `#${idx + 1} ${row.username} - solved ${row.solved} (penalty ${row.penalties})`;
      list.appendChild(li);
    });
    if (!board.length) list.innerHTML = "<li>No scoreboard data yet.</li>";
  } catch (err) {
    list.innerHTML = `<li>${err.message}</li>`;
  }
}

async function loadProfileStats() {
  const list = document.getElementById("profile-stats");
  list.innerHTML = "";
  try {
    const stats = await api("/api/me/stats");
    const entries = [
      `Username: ${stats.username}`,
      `Solved: ${stats.solvedCount}/${stats.totalProblems}`,
      `Total Attempts: ${stats.attempts}`,
      `Acceptance Rate: ${stats.acceptanceRate}%`
    ];
    entries.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li>${err.message}</li>`;
  }
}

document.getElementById("profile-load-btn").addEventListener("click", async () => {
  const username = document.getElementById("profile-search-username").value.trim();
  if (!username) return;
  const view = document.getElementById("public-profile-view");
  try {
    const profile = await api(`/api/users/${encodeURIComponent(username)}`);
    const lines = [
      `Username: ${profile.username}`,
      `Solved: ${profile.solvedCount}`,
      `Attempts: ${profile.totalAttempts}`,
      `Accepted: ${profile.accepted}`,
      `Acceptance Rate: ${profile.acceptanceRate}%`,
      "",
      "Recent Submissions:"
    ];
    profile.recentSubmissions.forEach((s) => {
      lines.push(`- ${s.problemId}: ${s.status} (${s.passed}/${s.total})`);
    });
    view.textContent = lines.join("\n");
  } catch (err) {
    view.textContent = err.message;
  }
});

problemSearch.addEventListener("input", (e) => {
  state.search = String(e.target.value || "").trim().toLowerCase();
  state.problemPage = 1;
  renderProblems();
});

difficultyFilter.addEventListener("change", (e) => {
  state.difficulty = e.target.value;
  state.problemPage = 1;
  renderProblems();
});

document.getElementById("problems-prev").addEventListener("click", () => {
  if (state.problemPage > 1) {
    state.problemPage -= 1;
    renderProblems();
  }
});
document.getElementById("problems-next").addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredProblems().length / state.pageSize));
  if (state.problemPage < totalPages) {
    state.problemPage += 1;
    renderProblems();
  }
});

document.getElementById("subs-prev").addEventListener("click", () => {
  if (state.submissionPage > 1) {
    state.submissionPage -= 1;
    renderSubmissions();
  }
});
document.getElementById("subs-next").addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(state.submissions.length / state.pageSize));
  if (state.submissionPage < totalPages) {
    state.submissionPage += 1;
    renderSubmissions();
  }
});

document.getElementById("admin-create-problem-btn").addEventListener("click", async () => {
  const adminMsg = document.getElementById("admin-msg");
  try {
    const title = document.getElementById("admin-problem-title").value.trim();
    const difficulty = document.getElementById("admin-problem-difficulty").value;
    const tags = document
      .getElementById("admin-problem-tags")
      .value.split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const statement = document.getElementById("admin-problem-statement").value.trim();
    const starterCode = document.getElementById("admin-problem-code").value;
    const tests = JSON.parse(document.getElementById("admin-problem-tests").value || "[]");
    await api("/api/admin/problems", {
      method: "POST",
      body: JSON.stringify({ title, difficulty, tags, statement, starterCode, tests })
    });
    adminMsg.textContent = "Problem created.";
    loadProblems();
  } catch (err) {
    adminMsg.textContent = err.message;
  }
});

document.getElementById("admin-create-contest-btn").addEventListener("click", async () => {
  const adminMsg = document.getElementById("admin-msg");
  try {
    const title = document.getElementById("admin-contest-title").value.trim();
    const description = document.getElementById("admin-contest-description").value.trim();
    const startTime = document.getElementById("admin-contest-start").value.trim();
    const endTime = document.getElementById("admin-contest-end").value.trim();
    const problemIds = document
      .getElementById("admin-contest-problems")
      .value.split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    await api("/api/contests", {
      method: "POST",
      body: JSON.stringify({ title, description, startTime, endTime, problemIds })
    });
    adminMsg.textContent = "Contest created.";
    loadContests();
  } catch (err) {
    adminMsg.textContent = err.message;
  }
});

renderAuth();
