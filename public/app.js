const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  selectedProblemId: null,
  problems: [],
  submissions: [],
  problemPage: 1,
  submissionPage: 1,
  pageSize: 6,
  search: "",
  difficulty: "ALL"
};

const authMsg = document.getElementById("auth-msg");
const userPill = document.getElementById("user-pill");
const dashboard = document.getElementById("dashboard");
const problemSearch = document.getElementById("problem-search");
const difficultyFilter = document.getElementById("difficulty-filter");

function setAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("token", token || "");
  localStorage.setItem("user", JSON.stringify(user || null));
  renderAuth();
}

function renderAuth() {
  if (state.user) {
    userPill.textContent = `${state.user.username} logged in`;
    dashboard.classList.remove("hidden");
    loadProblems();
    loadSubmissions();
    loadLeaderboard();
    loadProfileStats();
  } else {
    userPill.textContent = "Guest";
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
  } catch (err) {
    document.getElementById("judge-result").textContent = err.message;
  }
}

function formatResult(label, result) {
  const lines = [`Mode: ${label}`, `Status: ${result.status}`, `Passed: ${result.passed}/${result.total}`, ""];
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
      body: JSON.stringify({ problemId: state.selectedProblemId, code })
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

renderAuth();
