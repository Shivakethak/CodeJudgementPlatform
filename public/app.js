const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  selectedProblemId: null
};

const authMsg = document.getElementById("auth-msg");
const userPill = document.getElementById("user-pill");
const dashboard = document.getElementById("dashboard");

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
  const list = document.getElementById("problems-list");
  list.innerHTML = "";
  try {
    const problems = await api("/api/problems");
    problems.forEach((p) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="problem-link">${p.title}</span> (${p.difficulty})`;
      li.querySelector(".problem-link").addEventListener("click", () => selectProblem(p.id));
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li>${err.message}</li>`;
  }
}

async function selectProblem(problemId) {
  try {
    const p = await api(`/api/problems/${problemId}`);
    state.selectedProblemId = p.id;
    document.getElementById("problem-title").textContent = p.title;
    document.getElementById("problem-meta").textContent = `${p.difficulty} | ${p.tags.join(", ")}`;
    document.getElementById("problem-statement").textContent = p.statement;
    document.getElementById("code-editor").value = p.starterCode;
    document.getElementById("judge-result").textContent = "";
  } catch (err) {
    document.getElementById("judge-result").textContent = err.message;
  }
}

document.getElementById("submit-btn").addEventListener("click", async () => {
  if (!state.selectedProblemId) {
    document.getElementById("judge-result").textContent = "Select a problem first.";
    return;
  }
  try {
    const code = document.getElementById("code-editor").value;
    const result = await api("/api/submissions", {
      method: "POST",
      body: JSON.stringify({ problemId: state.selectedProblemId, code })
    });
    const lines = [`Status: ${result.status}`, `Passed: ${result.passed}/${result.total}`, ""];
    result.details.forEach((d) => lines.push(`Case ${d.testCase}: ${d.status}`));
    document.getElementById("judge-result").textContent = lines.join("\n");
    loadSubmissions();
    loadLeaderboard();
  } catch (err) {
    document.getElementById("judge-result").textContent = err.message;
  }
});

async function loadSubmissions() {
  const list = document.getElementById("submissions-list");
  list.innerHTML = "";
  try {
    const data = await api("/api/submissions/me");
    data.slice(0, 12).forEach((s) => {
      const li = document.createElement("li");
      li.textContent = `${s.problemId}: ${s.status} (${s.passed}/${s.total})`;
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li>${err.message}</li>`;
  }
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

renderAuth();
