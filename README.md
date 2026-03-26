# Empower Access Hub

A smart, AI-powered portal for **Persons with Disabilities (PWD) in India** — helping users discover jobs, government schemes, courses, mentors, and community support.

---

## 📁our Project Structure

The project is split into two independent parts:
abc
```
Job-Portal/
├── frontend/               ← React + Vite app (the UI)
│   ├── src/
│   │   ├── pages/          ← Route-level page components
│   │   ├── components/     ← Reusable UI components
│   │   ├── contexts/       ← React contexts (AuthContext, etc.)
│   │   ├── hooks/          ← Custom hooks
│   │   ├── integrations/   ← Firebase client (auth + Firestore)
│   │   └── test/           ← Unit tests
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig*.json
│   ├── tailwind.config.ts
│   ├── .env                ← Firebase + AI URL config
│   └── .env.example
├── backend/                ← Express.js AI API server
│   ├── src/
│   │   ├── index.js        ← Server entry point (port 3001)
│   │   └── routes/
│   │       └── aiAssistant.js  ← POST /ai-assistant endpoint
│   ├── package.json
│   ├── .env                ← NVIDIA_API_KEY, PORT, CORS_ORIGIN
│   └── .env.example
├── setup.sh                ← One-command setup for both parts
└── README.md
```

---

## 🚀 Our Project Tech Stack

| Part | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, shadcn-ui, Tailwind CSS, Framer Motion |
| **Database / Auth** | Firebase (Firestore + Authentication) |
| **Backend** | Node.js 18+, Express.js |
| **AI** | Express route → NVIDIA NIM API (google/gemma-3n-e4b-it) |
| Routing | React Router v6 |
| State | TanStack Query v5 |
| Testing | Vitest, Testing Library |

---

## ✅ Prerequisites

| Tool | Version | Install Link |
|---|---|---|
| **Node.js** | v18 or higher | https://nodejs.org or use [nvm](https://github.com/nvm-sh/nvm) |
| **npm** | v9+ (comes with Node.js) | — |
| **Git** | any recent version | https://git-scm.com |

> **Quick Node.js install via nvm:**
> ```sh
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
> nvm install 20 && nvm use 20
> ```

---

## ⚡ Quickstart

### Option A — Automated setup (recommended)

```sh
git clone https://github.com/adityawargade90/Job-Portal.git
cd Job-Portal
bash setup.sh
```

The script installs dependencies for both parts and prints the commands to start them.

### Option B — Manual setup

```sh
git clone https://github.com/adityawargade90/Job-Portal.git
cd Job-Portal

# 1. Set up the frontend
cd frontend
cp .env.example .env       # then edit .env with your Firebase credentials
npm install

# 2. Set up the backend
cd ../backend
cp .env.example .env       # then edit .env with your NVIDIA_API_KEY
npm install
```

---

## ▶️ How to Run the Project

You need **two terminal windows** — one for each part.

### Terminal 1 — Backend (AI API server)

```sh
cd backend
npm run dev
```

The backend will start at **http://localhost:3001**

Available endpoints:
| Method | Path | Description |
|---|---|---|
| `GET`  | `/health` | Health check |
| `POST` | `/ai-assistant` | AI chat / analysis (streams SSE) |

### Terminal 2 — Frontend (React app)

```sh
cd frontend
npm run dev
```

Open **http://localhost:8080** in your browser.

---

## 🔑 Environment Variables

### `frontend/.env`

```env
# Firebase credentials (from Firebase Console → Project Settings → General → Your apps)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Points to the backend AI server (keep as-is for local development)
VITE_AI_ASSISTANT_URL=http://localhost:3001/ai-assistant
```

**Firebase Setup:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → create a project.
2. Enable **Email/Password** authentication (Authentication → Sign-in method).
3. Create a **Firestore** database (Firestore Database → Create database).
4. Go to Project Settings → General → Your apps → Web app → copy the SDK config values.

### `backend/.env`

```env
# Port the Express server listens on
PORT=3001

# NVIDIA NIM API key (https://build.nvidia.com)
NVIDIA_API_KEY=your-nvidia-api-key-here

# Allowed frontend origin for CORS
CORS_ORIGIN=http://localhost:8080
```

---

## 🗄️ Firebase Collections

The app reads/writes these Firestore collections:

| Collection | Description |
|---|---|
| `profiles` | User profiles (document ID = Firebase Auth UID) |
| `jobs` | Job listings |
| `schemes` | Government schemes |
| `courses` | Educational courses |
| `mentor_profiles` | Mentor information |
| `mentor_requests` | Mentee requests to mentors |
| `forum_posts` | Community forum posts |
| `forum_replies` | Forum post replies |
| `user_achievements` | Gamification achievements |
| `user_points` | User points & level (document ID = UID) |
| `user_roles` | Role-based access control |

---

## 🛠️ Available Scripts

### Frontend (`cd frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:8081 |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on all source files |
| `npm run test` | Run all unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

### Backend (`cd backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start server with hot-reload (nodemon) at port 3001 |
| `npm start` | Start server without hot-reload (production) |

---

## 🌐 AI Features

All AI calls go through the backend's `/ai-assistant` endpoint, which forwards requests to the DivyangAI AI Gateway.

| Feature | Page | Request `type` |
|---|---|---|
| Smart Recommendations | Dashboard | `smart-recommendations` |
| Skill Gap Analyzer | Dashboard | `skill-gap` |
| AI Job Matching | Jobs | `job-match` |
| AI Scheme Advisor | Schemes | `scheme-check` |
| AI Profile Analyzer | Profile | `resume` |
| AI Chat Assistant | All pages (floating button) | *(no type — general chat)* |

---

## 🔒 Authentication

- Sign up / Sign in at `/auth`
- Firebase Authentication handles email + password
- A Firestore profile document is created automatically on first sign-up
- All pages except `/auth` require login (`ProtectedRoute`)

---

## 🚢 Deployment

### Frontend → Vercel / Netlify

```sh
cd frontend && npm run build
# deploy the dist/ folder or connect your GitHub repo
```

Set these env vars in your hosting dashboard:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_AI_ASSISTANT_URL   # set to your deployed backend URL
```

### Backend → Railway / Render / Fly.io

```sh
cd backend
# Deploy the backend/ folder to your platform of choice
# Set PORT, NVIDIA_API_KEY, and CORS_ORIGIN env vars on the platform
```

After deploying, update `VITE_AI_ASSISTANT_URL` in the frontend to your backend's public URL.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and run tests: `cd frontend && npm run test`
4. Push and open a Pull Request

---

## 📜 License

This project is open source. See [LICENSE](LICENSE) for details.
