# Code Therapist 🩺

Code Therapist is an opinionated, clinical, and high-fidelity diagnostic platform designed to help developers identify **why** they are stuck, classify their struggle type, receive structured AI-guided learning prescriptions, and track progress over time.

Instead of just debugging code lines (like typical AI chatbots), Code Therapist treats coding roadblocks as structured learning challenges. It helps developers move from trial-and-error to systematic knowledge gap resolution.

---

## 🚀 Core Features

1. **Semantic Diagnostic Engine:** Classifies coding blockers into 8 distinct struggle categories (*Syntax Error*, *Logic Error*, *Conceptual Gap*, *Architecture Issue*, *Tooling Problem*, *Debugging Skill Gap*, *Overengineering*, and *Burnout*) using in-memory cached sentence embeddings (`all-MiniLM-L6-v2`).
2. **Gemini Clinical Prescriptions:** Generates highly structured, empathetic, and educational 4-part prescriptions (*Why Stuck*, *Immediate Action Step*, *Study Syllabus*, and *Prevention Guardrails*) via Gemini 2.5 Flash.
3. **Analytics Dashboard:** Visualizes category frequencies, technology blocker distributions, weekly diagnosis trends, and custom learning insights using responsive Recharts donut, bar, and line graphs.
4. **Reliable Hybrid Storage:** Automatically attempts to store debug sessions in a cloud MongoDB Atlas instance, falling back seamlessly to a local JSON file-based database if outbound network ports are blocked.
5. **Interactive UI Atmosphere:** Follows a strict Monochrome/Grayscale "Deep Void" dark theme built with Vite + React, Tailwind CSS, and Framer Motion spring micro-animations.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework:** React + Vite
- **Package Manager:** Bun
- **Styling:** Tailwind CSS (v4)
- **Animations:** Framer Motion
- **Visualizations:** Recharts (responsive vector charts)

### Backend
- **Framework:** FastAPI (Python 3.8+)
- **Server:** Uvicorn (live hot-reloading)
- **Vector Models:** SentenceTransformers (`all-MiniLM-L6-v2`)
- **AI Integrations:** Google Generative AI SDK (Gemini 2.5 Flash)
- **Database:** PyMongo (MongoDB Atlas client + local JSON fallback storage)

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend` directory containing:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Configuration (`frontend/.env`)
*(Optional)* Create a `.env` file inside the `frontend` directory to override the backend API URL in production:
```env
VITE_API_URL=https://your-backend-api-url.com
```
*Note: If `VITE_API_URL` is omitted, the frontend automatically defaults to `http://localhost:8000`.*

---

## 🏃 Setup & Running Locally

Ensure you have [Bun](https://bun.sh/) and [Python 3](https://www.python.org/) installed.

### 1. Run the Backend API Server
Navigate to the `backend` directory, activate the Python virtual environment, install packages, and start Uvicorn:
```bash
cd backend
# Create virtual environment if not exists
python -m venv venv
# Activate environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# Install packages
pip install fastapi uvicorn sentence-transformers pymongo google-generativeai python-dotenv certifi requests
# Run with live reload
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Run the React Frontend
Navigate to the `frontend` directory, install packages using `bun`, and launch Vite:
```bash
cd frontend
# Install dependencies
bun install
# Launch development server
bun run dev
```
Open your browser and navigate to `http://localhost:5174/`.

---

## 🧪 Testing & Validation

The project includes test scripts inside the `brain` artifacts directory to verify database and API configurations:
- **Database/CRUD test:**
  ```bash
  python "C:\Users\Harsh Mishra\.gemini\antigravity-ide\brain\bfc71363-1fcd-4a8f-96c8-996a58ddcb61\scratch\test_database.py"
  ```
- **FastAPI Endpoints test:**
  ```bash
  python "C:\Users\Harsh Mishra\.gemini\antigravity-ide\brain\bfc71363-1fcd-4a8f-96c8-996a58ddcb61\scratch\test_sessions_api.py"
  ```

---

## 🩺 Struggle Diagnostics Schema
Every session represents a clinical diagnostics record matching the following parameters:
- `goal`: Objective of the code block.
- `technology`: Programming language, library, or framework used.
- `timeStuck`: Total minutes the developer spent blocked.
- `emotion`: User's mental state (Frustrated, Confused, Overwhelmed, Anxious, Calm).
- `error`: Traceback dump or console compiler log.
- `code`: The relevant script code block causing issues.
