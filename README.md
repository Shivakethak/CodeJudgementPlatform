# 🚀 CodeJudge Platform

A full-stack web application for practicing coding problems, participating in contests, and improving problem-solving skills — inspired by platforms like LeetCode and HackerRank.

---

## 📌 Features

* 🧠 Solve coding problems with multiple test cases
* ⚡ Real-time code execution using execution worker
* 🏆 Participate in contests and challenges
* 📊 Track submissions and performance
* 👤 User authentication and profiles
* 💬 Discussion and community features
* 📚 Study plans and mock interviews

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Other Tools

* Docker
* Redis (for caching and queues)
* WebSockets (real-time features)

---

## 📂 Project Structure

```
CodeJudgePlatform/
│
├── frontend/             # React frontend
├── backend/              # Node.js backend
├── execution-worker/     # Code execution service
├── scripts/              # Utility scripts
├── docker-compose.yml    # Docker configuration
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone the repository

```bash
git clone https://github.com/Shivakethak/CodeJudgementPlatform.git
cd CodeJudgePlatform
```

---

### 🔹 2. Setup environment variables

Create `.env` files in:

* `backend/`
* `frontend/`
* `execution-worker/`

Use `.env.example` as reference.

---

### 🔹 3. Run using Docker (Recommended)

```bash
docker-compose up --build
```

---

### 🔹 4. Run manually (optional)

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Execution Worker

```bash
cd execution-worker
npm install
npm start
```

---

## 🌐 Application Flow

1. User logs in / registers
2. Selects problems or contests
3. Writes and submits code
4. Code is sent to execution worker
5. Results are returned and displayed

---

## 📸 Screens

* Problem solving interface
* Contest room
* User dashboard
* Discussion forum

---

## 🤝 Contributors

* Your Friend (Repo Owner)
* Nithin Kumar (Contributor)

---

## 📄 License

This project is for educational purposes.

---

## ⭐ Acknowledgements

Inspired by platforms like:

* LeetCode
* HackerRank
* Codeforces

---
