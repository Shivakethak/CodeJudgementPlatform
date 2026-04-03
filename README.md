# 🚀 CodeJudge Platform

A production-ready **LeetCode-like Online Judge Platform** built using modern full-stack technologies.
It allows users to solve coding problems, run code in multiple languages, participate in challenges, and prepare for technical interviews.

---

## 🌟 Features

### 💻 Code Execution Engine

* Multi-language support:

  * Python
  * Java
  * C
  * C++
  * JavaScript
* Secure execution using Docker containers
* Resource limits (CPU, memory, timeout)
* Output validation with whitespace handling

---

### 🧠 Problem Solving

* 500+ algorithmic problems
* Difficulty levels: Easy, Medium, Hard
* Categories: Arrays, Strings, Graphs, DP, Trees
* Search and filtering system

---

### 📊 Study Plans

* Top Interview 150
* LeetCode 75
* SQL 50
* Progress tracking with resume functionality

---

### 🏆 Weekly Challenges

* Join weekly contests
* Solve problems to earn points
* Leaderboard system
* Countdown timer

---

### 🎯 Mock Interview

* Real interview simulation
* Timed assessments
* Mixed difficulty problems
* Score and performance analysis

---

### 🏢 Interview Preparation

* Company-wise problem sets:

  * Google
  * Amazon
  * Meta
  * Microsoft
* Topic-based filtering

---

### ⭐ Additional Features

* Favorites system
* User profile with submission history
* Calendar + streak tracking
* Modern dark UI (LeetCode-inspired)
* Responsive design

---

## 🏗️ Architecture

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | React + Vite + Monaco Editor |
| Backend          | Node.js + Express            |
| Execution Worker | Node.js + BullMQ             |
| Database         | MongoDB                      |
| Queue            | Redis                        |
| Execution        | Docker containers            |

---

## ⚙️ Setup Instructions

### 🔹 Prerequisites

Make sure you have installed:

* Docker Desktop
* Git

---

### 🔹 Clone Repository

```bash
git clone https://github.com/Shivakethak/CodeJudgementPlatform.git
cd CodeJudgementPlatform
```

---

### 🔹 Run the Application

```bash
docker compose up --build
```

---

### 🌐 Access the Platform

* Frontend: http://localhost:3000
* Backend API: http://localhost:5000

---

## 📁 Project Structure

```
CodeJudgementPlatform/
│
├── frontend/            # React frontend
├── backend/             # Express backend
├── execution-worker/    # Code execution worker
├── docker-compose.yml
├── README.md
```

---

## 🔐 Security Features

* Code is NOT stored permanently in database
* Execution inside isolated Docker containers
* No external network access inside containers
* Strict CPU and memory limits
* Timeout handling for infinite loops

---

## 📌 Important Notes

* Do NOT commit node_modules
* Ensure Docker is running before starting
* First run may take time due to Docker build

---

## 👨‍💻 Authors

**Nithin Kumar**
**Shiva Kethak**
**Buvan**

---

## 🚀 Future Improvements

* Cloud deployment (AWS / Render)
* Real-time collaboration
* Contest mode with rankings
* AI-based code suggestions

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
