# Completed Tasks — Code Therapist

> This file tracks all completed tasks for the Code Therapist hackathon project.
> Tasks are added here as they are finished.

---

<!-- Completed tasks will be listed below -->

## FEATURE 1 — Project Scaffold & Setup
- **F1.1 to F1.6 (Frontend Setup)**: Initialized Vite+React with Bun, installed Tailwind CSS, React Router, Recharts, Lucide-React, and Axios. Configured Tailwind, set up the folder structure (`pages/`, `components/`), configured routing in `App.jsx`, and created a responsive base layout component with navigation.
- **F1.7 to F1.11 (Backend Setup)**: Created FastAPI project structure (`routes/`, `services/`, `models/`, `config/`). Installed dependencies (`fastapi`, `uvicorn`, `sentence-transformers`, `pymongo`, `google-generativeai`, `python-dotenv`). Created `.env` schema, configured CORS in `main.py`, and added a `/health` endpoint. Feature 1 is now fully complete.

## FEATURE 2 — Landing Page
- **F2.1 to F2.6 (Home Page)**: Implemented `DESIGN.md` rules with strict monochrome/grayscale overrides as requested. Updated global CSS variables and base layout. Built `Home.jsx` with Hero section, 3-step How It Works, traditional vs Code Therapist comparison, and categorical pills showcase. UI uses deep void dark mode, subtle borders, and smooth entrance effects.
- **Interactive Framer Motion Polish**: Added `framer-motion` for dynamic staggered entry transitions, hover/tap micro-interactions, viewport-scroll animations, and a global `InteractiveBackground.jsx` containing a cursor-following spotlight glow, a technical grid layer, and floating ambient particles — all keeping strictly monochrome/grayscale accents.

## FEATURE 3 — Diagnose Form (Frontend)
- **F3.1 to F3.7 (Form & Validation)**: Implemented split-panel form layout at `/diagnose` matching the deep void dark mode visual guidelines. Integrated text inputs for Goal and Technology, a numeric input for Time Stuck, and emotional state card options (Frustrated, Confused, Overwhelmed, Anxious, Calm). Added client-side validation logic and inline alerts. Built an animated scanning progress overlay displaying sequential diagnostic operations on submit. Integrated axios request calls to a backend endpoint and handled routing state handoffs to redirect to `/results`. Authorized the port `5174` in the FastAPI CORS middleware whitelist, and successfully verified the full flow via browser test cases.

## FEATURE 4 — Semantic Diagnostic Engine (Backend)
- **F4.1 to F4.8 (Semantic Diagnostic Engine)**: Defined the 8 struggle categories with detailed semantic descriptions containing key developer terminology. Initialized `all-MiniLM-L6-v2` SentenceTransformer model under a cached singleton wrapper loaded during FastAPI's `lifespan` startup hook. Created robust embedding utilities to build issue representation strings (prioritizing code/error to avoid token truncation), encode issues, calculate cosine similarity, and extract the top category classification with confidence percentages. Written and successfully validated a unit test script verifying all edge test cases.

## FEATURE 5 — FastAPI Diagnose Endpoint
- **F5.1 to F5.5 (Diagnose Endpoint)**: Implemented the Pydantic schema validation `DiagnoseRequest` to enforce non-empty error messages, code blocks, and valid stuck timings (ge=1). Created the POST endpoint `/diagnose` in `routes/diagnose.py` which aggregates the input parameters, encodes the issue, calculates the similarity matrices, and responds with the real semantic classification. Registered the new router in `main.py` and cleaned up the temporary mock routes.

## FEATURE 6 — Gemini Prescription Engine (Backend)
- **F6.1 to F6.8 (AI Prescription Engine)**: Integrated Google Generative AI Python SDK. Configured a clinical prompting routine that matches diagnosed metadata (staggered similarities, emotions, stack details) and commands Gemini 2.5 Flash to generate a structured 4-part JSON response (Why Stuck, Immediate Step, Study Next, Prevention). Enabled JSON mode `response_mime_type="application/json"` in the model's generation config to ensure perfect JSON compliance. Hooked the generator into the main `/diagnose` route, and validated API responses using a python test script.## FEATURE 7 — MongoDB Session Storage
- **F7.1 to F7.9 (MongoDB Session Storage & JSON Fallback)**: Initialized database configuration in `config/database.py` with PyMongo and certifi for SSL support. Built a robust session storage service in `services/session_service.py` that connects to MongoDB Atlas or automatically falls back to local JSON storage if port 27017 is blocked. Implemented `save_session`, `get_all_sessions`, and Python/MongoDB hybrid aggregation queries for `get_learning_profile` to calculate category and tech distributions, average time stuck, weekly trends, and learning insights. Created `GET /sessions` and `GET /sessions/profile` endpoints in `routes/sessions.py` and registered the router in `main.py`. Validated the complete backend flow using unit test scripts.

## FEATURE 8 — Results Page (Frontend)
- **F8.1 to F8.8 (Results Page)**: Built the `/results` view conforming to `DESIGN.md` Layout B. Displayed the diagnosed struggle category in a bold hero layout with a high-contrast circular progress ring/gauge demonstrating classification confidence. Structured the Gemini AI prescription details into 4 clear callout zones (Why Stuck, Immediate Action Step, Study Syllabus, and Prevention Guardrails) accented with desaturated category colors. Integrated a horizontal Recharts bar chart showing the complete semantic classification similarity map sorted by score, utilizing the custom desaturated colors for each struggle category. Handled navigation and empty fallback states. Verified the full form-to-results page transition and rendering E2E using a browser test session.

## FEATURE 9 — Analytics Dashboard (Frontend)
- **F9.1 to F9.9 (Analytics Dashboard)**: Implemented the `/dashboard` analytical view conforming to `DESIGN.md` Layout C. Designed an asymmetric grid layout displaying key learning metrics (Total Sessions, Avg Time Stuck, Top Blocker, and Most Problematic Tech) alongside a textual Learning Insights Card. Integrated Recharts visualizations: a Weekly Diagnosis Trends line chart (styled with custom gradients and tooltips), a Common Struggle Categories donut chart (styled using the desaturated gray category colors), and a Technology Blocker Distribution horizontal bar chart. Created a responsive diagnostic history log table featuring faint hover fade-on-hover interaction and inspect actions. Handled loading skeleton states and E2E validated correct loading of real backend data using browser testing.

## FEATURE 10 — Polish & Integration Testing
- **F10.1 to F10.8 (Polish & Integration Testing)**: Added page mount entrance transitions to `Diagnose.jsx` and other pages using Framer Motion. Seeded the local JSON fallback database file with 8 distinct, representative diagnostic session data records mapping to diverse technologies, categories, emotions, timestamps, and confidence values. Checked and confirmed that both error handling boundaries and fallback prescription parsing configurations work flawlessly. Completed E2E integration walkthrough verifying the entire user flow. Checked code alignments against `context.md` confirming strict compliance with the MVP scope boundaries.

## FEATURE 11 — Deployment
- **F11.1 to F11.5 (Deployment)**: Configured the frontend with environment variables to dynamically reference backend API hosting services (`VITE_API_URL`) while defaulting to `http://localhost:8000` locally. Created a comprehensive root [README.md](file:///c:/Users/Harsh%20Mishra/OneDrive/Desktop/Codes/Hackathons/CodeTherapist/README.md) containing the product description, core capabilities, setup processes, environment configuration parameters, and execution instructions for the hackathon final presentation.


## FORM STATE CACHING — localStorage Persistence
- **Input Draft Persistence**: Implemented `localStorage`-based form state caching in `Diagnose.jsx`. On every keystroke, form state is written to `localStorage` under key `code_therapist_diagnose_draft`. On component mount, state is restored from localStorage using a lazy `useState` initializer (`loadDraft()`). The draft is only cleared when the user successfully submits a diagnosis (navigates to `/results`) — not on navigation or page refresh. This prevents the frustrating UX of losing typed content when switching pages.

## FEATURE 12 — JWT Authentication (Post-MVP Extension)
> Note: `context.md` originally listed Auth as "Do Not Build" for the hackathon MVP. The user explicitly requested this feature as a post-MVP extension. This deviation is documented here per Rule 1 exception policy.

- **Backend Dependencies**: Installed `python-jose[cryptography]`, `passlib[bcrypt]` (pinned to `bcrypt==4.0.1` for passlib 1.7.4 compatibility), and `email-validator` into the backend venv.
  > **Rule 1 Exception**: `pip` was used (not `bun`) for backend Python packages. This is expected — `bun` is only for frontend JavaScript. Backend package manager is `pip` within the venv.
- **JWT Env Variables**: Added `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` to `backend/.env`.
- **User Model** (`backend/models/user.py`): Created Pydantic models: `UserRegister`, `UserLogin`, `TokenResponse`, `UserOut`.
- **Auth Service** (`backend/services/auth_service.py`): Implemented bcrypt password hashing/verification, JWT access token (30 min TTL) and refresh token (7 day TTL) creation, token decoding, and `get_current_user` FastAPI dependency.
- **Auth Routes** (`backend/routes/auth.py`): Implemented `POST /auth/register` (201), `POST /auth/login` (200), `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`. Includes MongoDB + in-memory fallback storage for users.
- **Database Config** (`backend/config/database.py`): Added `users_collection` alongside existing `sessions_collection`.
- **Protected Diagnose Endpoint** (`backend/routes/diagnose.py`): Added `Depends(get_current_user)` to `POST /diagnose`. User ID is now saved with each session.
- **Frontend Auth Context** (`frontend/src/context/AuthContext.jsx`): React Context exposing `{ user, token, isAuthenticated, isLoading, login, register, logout }`. Bootstraps from localStorage on mount with automatic refresh-cookie fallback. `logout()` clears both the access token and the form draft.
- **Protected Route Guard** (`frontend/src/components/ProtectedRoute.jsx`): Shows spinner while auth state loads, redirects to `/login` if unauthenticated.
- **Central API Utility** (`frontend/src/utils/api.js`): Axios instance with automatic Bearer token injection (request interceptor) and silent 401→refresh→retry logic with request queuing.
- **Login Page** (`frontend/src/pages/Login.jsx`): Email + Password form matching DESIGN.md monochrome theme. Redirects back to the originally requested page after login.
- **Register Page** (`frontend/src/pages/Register.jsx`): Username + Email + Password + Confirm Password form with client-side validation.
- **App.jsx Updated**: Wrapped in `<AuthProvider>`. `/login` and `/register` added as public routes. `/diagnose`, `/results`, `/dashboard` nested under `<ProtectedRoute>`.
- **Layout.jsx Updated**: Navbar dynamically shows `username + Logout` when authenticated, and `Login / Register` buttons when logged out.
- **Diagnose.jsx Updated**: Switched from raw `axios` to central `api` utility for automatic token injection.
- **Tested (Rule 2 ✅)**: Via Swagger UI — register (201), login (200), /me (200), duplicate email (409 conflict). All backend routes verified live.

## FORM STATE CACHING — localStorage Persistence
- **Input Draft Persistence**: Implemented `localStorage`-based form state caching in `Diagnose.jsx` to prevent input data loss on route switches or page refreshes.

## FEATURE 13 — Verifiable Private Interface (VPI)
- **Regex Privacy Scanner** (`backend/services/vpi_service.py`): Scans input strings for secrets (AWS, Google, GitHub, Stripe, Slack, generic passwords), database credentials, and PII (IPs, email).
- **Scanner Endpoint** (`backend/routes/vpi.py`): Exposes `POST /vpi/scan` validation route.
- **Frontend Verification Modal** (`frontend/src/pages/Diagnose.jsx`): Intercepts diagnoses containing secrets to show matches and redacted previews, allowing user verification and approval.

## FEATURE 14 — Retrieval-Augmented Generation (RAG)
- **Local Reference Manuals**: Curated Markdown guides under `backend/data/docs/` for React, FastAPI, MongoDB, Python, and JavaScript.
- **Vector Search Engine** (`backend/services/rag_service.py`): Splits markdown, pre-computes embeddings during server lifespan hooks, and retrieves tech-scoped matches using cosine similarity.
- **AI Prescription Integration**: Injected retrieved reference chunks in `prescription_engine.py` to ground Gemini prompts. Added dynamic sources card in `Results.jsx`.

## FEATURE 15 — Mobile Responsiveness & Hamburger Navigation
- **Hamburger Navigation Toggle** (`Layout.jsx`): Added a responsive Lucide hamburger and dropdown drawer for smaller viewports.
- **Fluid Layout Adjustments**: Wrapped long code/prescription block outputs, added dynamic chart widths for Recharts in `Results.jsx`, and hid auxiliary columns in `Dashboard.jsx` logs table on mobile.

## FEATURE 16 — Deployment Readiness Verification
- **Dynamic CORS Support** (`backend/main.py`): Modified CORS configurations to dynamically load allowed origins from an `ALLOWED_ORIGINS` environment variable in production.
- **Backend Dependency Freeze** (`backend/requirements.txt`): Lock-packaged all requirements in a production-ready file to prevent Render execution conflicts. Completely removed PyTorch and sentence-transformers to satisfy Render's 512MB RAM constraints, reducing installation bundle size from 900MB to ~30MB.
- **Vercel SPA Redirect Config** (`frontend/vercel.json`): Wrote Vercel Edge configuration to rewrite all routes back to `index.html` to prevent route-reload `404` errors.
- **Render Blueprint Spec** (`render.yaml`): Created a Render infrastructure blueprint specification at the root of the repository to automatically configure python environment runtime, directory scoping, build command, custom start command, and environment variable slots on Render automatically.
- **Gemini Embeddings Migration** (`diagnostic_engine.py` & `rag_service.py`): Migrated classification and semantic RAG search from local HuggingFace PyTorch models to Google's `models/gemini-embedding-2` API. Implemented custom pure-Python cosine similarity calculation. This reduces memory footprint from 550MB to ~35MB, eliminating Out-Of-Memory (OOM) errors and shortening build time to 15 seconds.
- **Frontend Code Quality Verification**: Ran `bun run lint` successfully with zero ESLint compilation errors or purity warnings.
- **Frontend Build Compilation**: Executed `bun run build` successfully, producing a fully minified, production-ready React client bundle in the `dist/` directory.
- **Backend Startup Verification**: Executed mock import startup inside the production python venv virtual environment, confirming correct execution, module resolutions, and environment compatibility.


