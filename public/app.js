const state = {
  token: localStorage.getItem("token") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  selectedProblemId: null,
  selectedLanguage: localStorage.getItem("selectedLanguage") || "java",
  problems: [],
  submissions: [],
  contests: [],
  problemPage: 1,
  submissionPage: 1,
  pageSize: 6,
  search: "",
  difficulty: "ALL",
  selectedContestId: null,
  contestTicker: null,
  playlists: []
};

const languageTemplates = {
  javascript: `function solve(input) {
  const { nums, target } = input;
  // Write your code here
  return [];
}`,
  python: `def solve(input_data):
    nums, target = input_data['nums'], input_data['target']
    # Write your code here
    return []`,
  java: `class Solution {
    public int[] solve(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
  cpp: `vector<int> solve(vector<int> nums, int target) {
    // Write your code here
    return {};
}`,
  c: `int* solve(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    *returnSize = 2;
    int* result = malloc(2 * sizeof(int));
    return result;
}`
};

// DOM Elements
const authBtn = document.getElementById("auth-btn");
const authModal = document.getElementById("auth-modal");
const modalClose = document.querySelector(".modal-close");
const bannerLoginBtn = document.getElementById("banner-login-btn");
const languageSelector = document.getElementById("language-selector");
const codeEditor = document.getElementById("code-editor");
const judgeResult = document.getElementById("judge-result");

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("token", token || "");
  localStorage.setItem("user", JSON.stringify(user || null));
  if (!token) {
    state.refreshToken = "";
    localStorage.setItem("refreshToken", "");
  }
  renderAuth();
}

function setRefreshToken(refreshToken) {
  state.refreshToken = refreshToken || "";
  localStorage.setItem("refreshToken", state.refreshToken);
}

function renderAuth() {
  if (state.user) {
    authBtn.textContent = `${state.user.username} (Logout)`;
    authBtn.classList.add("logged-in");
    document.getElementById("auth-banner").classList.add("hidden");
    loadProblems();
  } else {
    authBtn.textContent = "Register or log in";
    authBtn.classList.remove("logged-in");
    document.getElementById("auth-banner").classList.remove("hidden");
  }
  
  // Set language selector value
  if (languageSelector) {
    languageSelector.value = state.selectedLanguage;
  }
}

// Language selector event listener
if (languageSelector) {
  languageSelector.addEventListener("change", (e) => {
    state.selectedLanguage = e.target.value;
    localStorage.setItem("selectedLanguage", state.selectedLanguage);
    
    // Update code editor with new language template if problem is selected
    if (state.selectedProblemId) {
      const problem = state.problems.find(p => p.id === state.selectedProblemId);
      if (problem) {
        updateCodeEditor(problem);
      }
    }
  });
}

function updateCodeEditor(problem) {
  if (!codeEditor) return;
  
  // Get starter code for selected language or use template
  let starterCode = problem.starterCode;
  
  // If problem has multi-language support
  if (problem.multiLanguageStarterCode && problem.multiLanguageStarterCode[state.selectedLanguage]) {
    starterCode = problem.multiLanguageStarterCode[state.selectedLanguage];
  } else if (state.selectedLanguage !== 'javascript') {
    // Use template for non-JavaScript languages if no specific starter code
    starterCode = languageTemplates[state.selectedLanguage] || languageTemplates.javascript;
  }
  
  codeEditor.value = starterCode;
  updateLineNumbers();
}

function updateLineNumbers() {
  const lineNumbers = document.querySelector('.line-numbers');
  if (!lineNumbers || !codeEditor) return;
  
  const lines = codeEditor.value.split('\n').length;
  let numbersHTML = '';
  for (let i = 1; i <= Math.max(lines, 20); i++) {
    numbersHTML += `<span>${i}</span>`;
  }
  lineNumbers.innerHTML = numbersHTML;
}

// Modal functionality
if (authBtn) {
  authBtn.addEventListener("click", () => {
    if (state.user) {
      logout();
    } else {
      authModal.classList.remove("hidden");
    }
  });
}

if (bannerLoginBtn) {
  bannerLoginBtn.addEventListener("click", () => {
    authModal.classList.remove("hidden");
  });
}

if (modalClose) {
  modalClose.addEventListener("click", () => {
    authModal.classList.add("hidden");
  });
}

if (authModal) {
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.classList.add("hidden");
    }
  });
}

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    btn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Output tabs functionality
document.querySelectorAll('.output-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const outputName = btn.dataset.output;
    
    // Remove active class from all tabs and contents
    document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.output-panel').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    btn.classList.add('active');
    document.getElementById(`${outputName}-panel`).classList.add('active');
  });
});

// Code editor sync with line numbers
if (codeEditor) {
  codeEditor.addEventListener('input', updateLineNumbers);
  codeEditor.addEventListener('scroll', () => {
    const lineNumbers = document.querySelector('.line-numbers');
    if (lineNumbers) {
      lineNumbers.scrollTop = codeEditor.scrollTop;
    }
  });
}

async function api(path, options = {}) {
  let res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token && { Authorization: `Bearer ${state.token}` }),
      ...options.headers
    }
  });
  
  if (res.status === 401 && state.refreshToken) {
    try {
      const refresh = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: state.refreshToken })
      });
      if (refresh.ok) {
        const data = await refresh.json();
        setAuth(data.token, state.user);
        setRefreshToken(data.refreshToken);
        res = await fetch(path, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
            ...options.headers
          }
        });
      }
    } catch (_err) {
      setAuth(null, null);
    }
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth functions
const registerBtn = document.getElementById("register-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!username || !email || !password) {
      setText("auth-msg", "Username, email and password are required for registration.");
      return;
    }
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password })
      });
      document.getElementById("auth-msg").textContent = "Registered. Login now.";
    } catch (err) {
      document.getElementById("auth-msg").textContent = err.message;
    }
  });
}

const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) {
      setText("auth-msg", "Email and password are required for login.");
      return;
    }
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setAuth(data.token, data.user);
      setRefreshToken(data.refreshToken);
      authModal.classList.add("hidden");
      // Clear form
      document.getElementById("username").value = "";
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
      document.getElementById("auth-msg").textContent = "";
    } catch (err) {
      document.getElementById("auth-msg").textContent = err.message;
    }
  });
}

function logout() {
  setAuth(null, null);
  if (authModal) {
    authModal.classList.add("hidden");
  }
}

// Navigation buttons
const playBtn = document.querySelector('.play-btn');
if (playBtn) {
  playBtn.addEventListener('click', () => {
    if (!state.user) {
      if (authModal) authModal.classList.remove("hidden");
      return;
    }
    runCode();
  });
}

const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    if (!state.user) {
      if (authModal) authModal.classList.remove("hidden");
      return;
    }
    submitCode();
  });
}

async function runCode() {
  if (!state.selectedProblemId) {
    if (judgeResult) judgeResult.textContent = "Select a problem first.";
    switchToResultTab();
    return;
  }
  try {
    const code = codeEditor.value;
    const result = await api("/api/submissions/run", {
      method: "POST",
      body: JSON.stringify({
        problemId: state.selectedProblemId,
        code,
        language: state.selectedLanguage
      })
    });
    if (judgeResult) judgeResult.textContent = formatResult("Run", result);
    switchToResultTab();
  } catch (err) {
    if (judgeResult) judgeResult.textContent = err.message;
    switchToResultTab();
  }
}

async function submitCode() {
  if (!state.selectedProblemId) {
    if (judgeResult) judgeResult.textContent = "Select a problem first.";
    switchToResultTab();
    return;
  }
  try {
    const code = codeEditor.value;
    const result = await api("/api/submissions", {
      method: "POST",
      body: JSON.stringify({
        problemId: state.selectedProblemId,
        code,
        language: state.selectedLanguage
      })
    });
    if (judgeResult) judgeResult.textContent = formatResult("Submit", result);
    switchToResultTab();
  } catch (err) {
    if (judgeResult) judgeResult.textContent = err.message;
    switchToResultTab();
  }
}

function switchToResultTab() {
  const resultTab = document.querySelector('.output-tab[data-output="result"]');
  if (resultTab) resultTab.click();
}

function formatResult(label, result) {
  const lines = [`Mode: ${label}`, `Status: ${result.status}`, `Passed: ${result.passed}/${result.total}`];
  if (label === "Run") lines.push("Note: Run mode uses only visible sample tests.");
  if (label === "Submit") lines.push("Note: Submit mode uses full test suite including hidden tests.");
  lines.push("");
  if (result.details) {
    result.details.forEach((d) => {
      lines.push(`Case ${d.testCase}: ${d.status}`);
      lines.push(`Input: ${JSON.stringify(d.input)}`);
      lines.push(`Expected: ${JSON.stringify(d.expected)}`);
      lines.push(`Actual: ${JSON.stringify(d.actual)}`);
      lines.push("");
    });
  }
  return lines.join("\n");
}

async function loadProblems() {
  try {
    const data = await api("/api/problems?page=1&limit=100");
    state.problems = data.items || [];
    // Auto-select first problem for demo
    if (state.problems.length > 0 && !state.selectedProblemId) {
      selectProblem(state.problems[0].id);
    }
  } catch (err) {
    console.error("Failed to load problems:", err);
  }
}

async function selectProblem(problemId) {
  try {
    const p = await api(`/api/problems/${problemId}`);
    state.selectedProblemId = p.id;
    
    // Update problem display
    const titleElement = document.getElementById("problem-title");
    if (titleElement) titleElement.textContent = p.title;
    
    const numberElement = document.querySelector(".problem-number");
    if (numberElement) numberElement.textContent = `${p.id}.`;
    
    // Update difficulty badge
    const badge = document.getElementById("difficulty-badge");
    if (badge) {
      badge.textContent = p.difficulty;
      badge.className = `difficulty-badge ${p.difficulty.toLowerCase()}`;
    }
    
    // Update problem content
    const statementElement = document.getElementById("problem-statement");
    if (statementElement) statementElement.textContent = p.statement;
    
    // Update constraints
    const constraintsList = document.getElementById("constraints-list");
    if (constraintsList) {
      constraintsList.innerHTML = (p.constraints || []).map(c => `<li>${c}</li>`).join("");
    }
    
    // Update hints
    const hintsList = document.getElementById("hints-list");
    if (hintsList) {
      hintsList.innerHTML = (p.hints || []).map(h => `<li>${h}</li>`).join("");
    }
    
    // Update examples
    updateExamples(p.examples || []);
    
    // Update code editor
    updateCodeEditor(p);
    
    if (judgeResult) judgeResult.textContent = "";
  } catch (err) {
    if (judgeResult) judgeResult.textContent = err.message;
    switchToResultTab();
  }
}

function updateExamples(examples) {
  const examplesSection = document.getElementById("problem-examples");
  if (!examplesSection) return;
  
  if (!examples.length) {
    examplesSection.innerHTML = "";
    return;
  }
  
  let examplesHTML = "";
  examples.forEach((example, index) => {
    examplesHTML += `
      <h3>Example ${index + 1}:</h3>
      <div class="example-input">
        <strong>Input:</strong> ${example.input}
      </div>
      <div class="example-output">
        <strong>Output:</strong> ${example.output}
      </div>
      ${example.explanation ? `
        <div class="example-explanation">
          <strong>Explanation:</strong> ${example.explanation}
        </div>
      ` : ""}
    `;
  });
  
  examplesSection.innerHTML = examplesHTML;
}

// Initialize
renderAuth();
updateLineNumbers();
