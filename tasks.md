# Tasks — Code Therapist

> This file breaks the entire project into small, atomic tasks grouped by feature.
> Development follows Rule 2: one feature at a time, test before moving on.
> After each task is done, update `completedTasks.md`.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| `[ ]` | Not started |
| `[/]` | In progress |
| `[x]` | Done & tested |

---

---

## FEATURE 1 — Project Scaffold & Setup

### Frontend (React + Vite + Tailwind + Bun)

- [x] F1.1 — Initialize Vite + React project using `bun`
- [x] F1.2 — Install and configure Tailwind CSS
- [x] F1.3 — Install Recharts
- [x] F1.4 — Set up folder structure: `pages/`, `components/`, `hooks/`, `services/`, `assets/`
- [x] F1.5 — Configure React Router for routes: `/`, `/diagnose`, `/results`, `/dashboard`
- [x] F1.6 — Create base layout component with nav

### Backend (FastAPI + Python)

- [x] F1.7 — Initialize FastAPI project structure: `main.py`, `routes/`, `services/`, `models/`, `config/`
- [x] F1.8 — Install dependencies: `fastapi`, `uvicorn`, `sentence-transformers`, `pymongo`, `google-generativeai`, `python-dotenv`
- [x] F1.9 — Create `.env` file schema: `MONGO_URI`, `GEMINI_API_KEY`
- [x] F1.10 — Set up CORS middleware in FastAPI
- [x] F1.11 — Create health check endpoint `GET /health`

**✅ Test**: Frontend runs on `bun run dev`. Backend runs on `uvicorn`. `/health` returns `{ status: "ok" }`.

---

---

## FEATURE 2 — Landing Page

- [x] F2.1 — Design and build hero section (tagline, CTA button → `/diagnose`)
- [x] F2.2 — Add "How It Works" section (3-step visual: Input → Diagnose → Prescribe)
- [x] F2.3 — Add "What Makes It Different" section (Code Therapist vs traditional tools)
- [x] F2.4 — Add struggle category showcase (cards for all 8 categories)
- [x] F2.5 — Make page fully responsive (mobile + desktop)
- [x] F2.6 — Add smooth scroll animations / entrance effects

**✅ Test**: Landing page renders correctly on desktop and mobile. CTA navigates to `/diagnose`.

---

---

---

---

## FEATURE 3 — Diagnose Form (Frontend) [Anuj]

- [x] F3.1 — Build the Diagnose Form page at `/diagnose`
- [x] F3.2 — Form fields: Error Message (textarea), Code Snippet (code textarea), Goal (text), Technology (text/select), Time Stuck (number input, in minutes), Emotional State (select: Frustrated / Confused / Overwhelmed / Anxious / Calm)
- [x] F3.3 — Add client-side validation (required fields, min length)
- [x] F3.4 — Add loading state on form submit
- [x] F3.5 — On submit, POST to backend `/diagnose` endpoint
- [x] F3.6 — On success, navigate to `/results` with diagnosis data
- [x] F3.7 — On error, show user-friendly error message

**✅ Test**: Form submits correctly, validation works, loading state shows, navigation to results happens on success.

---

---

## FEATURE 4 — Semantic Diagnostic Engine (Backend) [Harsh]

- [x] F4.1 — Define the 8 struggle categories with detailed descriptions in `services/diagnostic_engine.py`
- [x] F4.2 — Load `all-MiniLM-L6-v2` model using `sentence-transformers` on startup
- [x] F4.3 — Pre-compute and cache category embeddings in memory at startup
- [x] F4.4 — Write function `build_issue_text(payload)` to combine all form fields into one string
- [x] F4.5 — Write function `encode_issue(issue_text)` to compute issue embedding
- [x] F4.6 — Write function `classify_issue(issue_embedding)` to compute cosine similarity against all category embeddings
- [x] F4.7 — Return top category + confidence score + full similarity map
- [x] F4.8 — Write unit test: submit a test issue, verify correct top category is returned

**✅ Test**: Call diagnostic engine directly with a sample payload, verify it returns correct `diagnosis` and `confidence` without using Gemini or hardcoded rules.

---

---

## FEATURE 5 — FastAPI Diagnose Endpoint [Anuj]

- [ ] F5.1 — Create `POST /diagnose` endpoint in `routes/diagnose.py`
- [ ] F5.2 — Define `DiagnoseRequest` Pydantic model (error, code, goal, tech, emotion, timeStuck)
- [ ] F5.3 — Call `build_issue_text()` → `classify_issue()` inside the route
- [ ] F5.4 — Return diagnosis response: `{ category, confidence, similarityMap, issueText }`
- [ ] F5.5 — Add proper error handling and HTTP status codes

**✅ Test**: POST to `/diagnose` with a sample payload returns correct `category` and `confidence`. Test via curl or Postman.

---

---

## FEATURE 6 — Gemini Prescription Engine (Backend) [Harsh]

- [ ] F6.1 — Create `services/prescription_engine.py`
- [ ] F6.2 — Configure Gemini 2.5 Flash client using `GEMINI_API_KEY`
- [ ] F6.3 — Write `build_prompt(issue_text, category, confidence, emotion, tech)` that constructs a structured prompt
- [ ] F6.4 — Prompt must instruct Gemini to return: Why Stuck, Immediate Next Step, Concept to Study, Prevention Advice
- [ ] F6.5 — Prompt must enforce: empathetic tone, no raw code generation (unless necessary), educational focus
- [ ] F6.6 — Parse Gemini response into structured JSON: `{ whyStuck, immediateStep, studyNext, prevention }`
- [ ] F6.7 — Integrate prescription engine into `POST /diagnose` route (after classification)
- [ ] F6.8 — Full response: `{ category, confidence, prescription: { whyStuck, immediateStep, studyNext, prevention } }`

**✅ Test**: POST to `/diagnose` now returns both diagnosis AND Gemini prescription. Verify tone is empathetic and structured.

---

---

## FEATURE 7 — MongoDB Session Storage [Anuj]

- [ ] F7.1 — Set up MongoDB Atlas cluster and get connection URI
- [ ] F7.2 — Create `config/database.py` to initialize `pymongo` client using `MONGO_URI`
- [ ] F7.3 — Define session document schema (see `context.md` Step 7)
- [ ] F7.4 — Write `save_session(session_data)` function in `services/session_service.py`
- [ ] F7.5 — Call `save_session()` inside `POST /diagnose` after prescription is generated
- [ ] F7.6 — Create `GET /sessions` endpoint to retrieve all stored sessions (for dashboard)
- [ ] F7.7 — Create `GET /sessions/profile` endpoint to return aggregated learning profile stats

**✅ Test**: Run a diagnosis, verify the session document appears in MongoDB Atlas UI. Call `/sessions` and verify data returns.

---

---

## FEATURE 8 — Results Page (Frontend) [Anuj]

- [ ] F8.1 — Build `/results` page
- [ ] F8.2 — Display diagnosed category with confidence percentage (badge/pill style)
- [ ] F8.3 — Display full Gemini prescription in 4 cards: Why Stuck / Immediate Step / Study Next / Prevention
- [ ] F8.4 — Show similarity map as a bar visualization (all 8 categories with their scores)
- [ ] F8.5 — Add "Diagnose Again" button → navigates back to `/diagnose`
- [ ] F8.6 — Add "View Dashboard" button → navigates to `/dashboard`
- [ ] F8.7 — Handle loading state while fetching (if results are fetched from backend)
- [ ] F8.8 — Handle error state (if diagnosis failed)

**✅ Test**: After form submission, results page correctly displays category, confidence, and all 4 prescription sections.

---

---

## FEATURE 9 — Analytics Dashboard (Frontend) [Harsh]

- [ ] F9.1 — Build `/dashboard` page layout
- [ ] F9.2 — Fetch data from `GET /sessions` and `GET /sessions/profile`
- [ ] F9.3 — Build **Struggle Category Distribution** — Pie chart (Recharts) showing category frequency
- [ ] F9.4 — Build **Technology-wise Blocker Distribution** — Bar chart (Recharts) per tech stack
- [ ] F9.5 — Build **Weekly Diagnosis Trends** — Line chart (Recharts) of sessions over time
- [ ] F9.6 — Build **Session History Table** — List of all past diagnosis sessions with timestamp, category, and confidence
- [ ] F9.7 — Build **Learning Insights Card** — Top 3 blockers + most problematic technology
- [ ] F9.8 — Add loading skeleton states for all charts
- [ ] F9.9 — Make dashboard fully responsive

**✅ Test**: Dashboard loads all charts with real MongoDB data. Charts render without errors.

---

---

## FEATURE 10 — Polish & Integration Testing [Harsh & Anuj]

- [ ] F10.1 [Harsh] — Full end-to-end flow test: Landing → Form → Results → Dashboard
- [ ] F10.2 [Harsh] — Check all API error cases are handled gracefully on frontend
- [ ] F10.3 [Anuj] — Ensure consistent design language across all pages (colors, fonts, spacing)
- [ ] F10.4 [Harsh] — Add page transitions / loading animations
- [ ] F10.5 [Anuj] — Test on mobile viewport
- [ ] F10.6 [Anuj] — Verify MongoDB has at least 5 sample sessions for dashboard demo
- [ ] F10.7 [Harsh] — Verify Gemini responses are always structured (add fallback parsing if needed)
- [ ] F10.8 [Harsh & Anuj] — Final review against `context.md` — verify no MVP boundary was crossed

**✅ Test**: Complete walkthrough of the app works flawlessly. Ready for demo.

---

---

## FEATURE 11 — Deployment [Harsh & Anuj]

- [ ] F11.1 [Anuj] — Deploy FastAPI backend to **Render** (set env vars: `MONGO_URI`, `GEMINI_API_KEY`)
- [ ] F11.2 [Anuj] — Deploy React frontend to **Vercel** (set env var: `VITE_API_URL` → Render backend URL)
- [ ] F11.3 [Anuj] — Update frontend API base URL to use env variable
- [ ] F11.4 [Harsh & Anuj] — Smoke test deployed URLs end-to-end
- [ ] F11.5 [Anuj] — Add `README.md` with project description, setup instructions, and demo link

**✅ Test**: Live URL works. Form → diagnosis → results → dashboard flow works on production.

---

## Task Summary

| Feature | Area | Tasks |
|---|---|---|
| F1 | Scaffold & Setup | 11 tasks |
| F2 | Landing Page | 6 tasks |
| F3 | Diagnose Form (Frontend) | 7 tasks |
| F4 | Semantic Diagnostic Engine | 8 tasks |
| F5 | FastAPI Diagnose Endpoint | 5 tasks |
| F6 | Gemini Prescription Engine | 8 tasks |
| F7 | MongoDB Session Storage | 7 tasks |
| F8 | Results Page (Frontend) | 8 tasks |
| F9 | Analytics Dashboard (Frontend) | 9 tasks |
| F10 | Polish & Integration Testing | 8 tasks |
| F11 | Deployment | 5 tasks |
| **Total** | | **82 tasks** |
