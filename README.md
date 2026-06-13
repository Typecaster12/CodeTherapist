# Code Therapist

Code Therapist is an opinionated developer-facing tool that helps programmers diagnose coding problems, provides an empathetic, educational "clinical prescription" for fixes, and surfaces relevant reference docs. It pairs a modern React frontend with a FastAPI backend that hosts a semantic diagnostic engine and a Retrieval-Augmented-Generation (RAG) document store backed by MongoDB and Google Gemini embeddings/LMs.

Live demo: https://code-therapist.vercel.app

Table of Contents
- Project overview
- Key features
- Architecture & workflow
- Technology stack
- Environment variables
- Local development
  - Backend
  - Frontend
- Deployment notes
- Contributing
- Troubleshooting & debugging
- Security & privacy

Project overview

Code Therapist is built to help developers who are stuck on bugs, confusing errors, or conceptual issues. Users paste an error message, stack trace, failing test, or code snippet, and the system:
1. Runs a semantic diagnostic engine to classify the kind of struggle (syntax, logic, architecture, tooling, burnout, etc.).
2. Uses RAG (retrieval-augmented generation) to find relevant docs/code snippets from ingested project material.
3. Calls a generative LLM (Google Gemini via google-generativeai) to produce a short, empathetic, structured "prescription" with: whyStuck, immediateStep, studyNext, and prevention.

The system focuses on education and stepwise fixes rather than dumping large blocks of code.

Key features
- Semantic diagnosis of developer problems with predefined clinical categories.
- RAG-backed grounding: retrieves relevant files/docs before calling the LLM for more accurate suggestions.
- Structured, empathetic prescriptions in a JSON schema designed for UI rendering.
- Authentication (JWT-based) and session storage in MongoDB.
- Lightweight React + Vite frontend with charts and animated components.

Architecture & workflow

High level flow:
- User interacts with the React frontend (frontend/).
- Frontend calls FastAPI backend endpoints (backend/) to submit an issue or session data.
- Backend orchestrates the diagnostic pipeline:
  - diagnostic_engine: generates embeddings, computes similarities against stored RAG docs, classifies the problem into categories.
  - rag_service: manages the document store (ingestion, retrieval). The store is backed by MongoDB collections and lightweight embeddings (via Gemini Embeddings).
  - prescription_engine: composes a structured prompt (including RAG docs) and calls the Gemini API to generate the prescription.
- Backend persists sessions, user accounts, and metadata in MongoDB.
- Frontend displays the prescription, confidence, recommended study resources, and short-term fixes.

Component map:
- Frontend (React + Vite) — UI, routing, API client (axios), charts (recharts), animation (framer-motion) and icons (lucide-react).
- Backend (FastAPI + Uvicorn) — REST API, auth, session management, services for diagnostics, RAG, and prescriptions.
- Database (MongoDB via pymongo) — sessions, users, RAG documents.
- LLM service (Google Gemini) — embeddings and LLM calls via google-generativeai.

Technology stack

Frontend
- React 19 + React DOM
- Vite (dev server + build)
- Tailwind CSS (utility-first styling)
- axios for HTTP requests
- react-router-dom for client routing
- recharts for charts/visualizations
- framer-motion for UI animations
- lucide-react for icons
- Bun lockfile present (bun.lock) — repo remains compatible with Node/NPM/Yarn/Bun runtimes

Backend
- Python 3.11+ recommended
- FastAPI for lightweight, async REST API
- Uvicorn (ASGI server)
- pymongo for MongoDB interaction
- google-generativeai for Gemini embeddings and LM calls
- python-dotenv for .env management
- python-jose and passlib[bcrypt] / bcrypt for JWT auth and password hashing
- certifi to provide trusted CA bundle for MongoDB TLS connections

Infrastructure & deployment
- Frontend: Designed for Vercel (see frontend/vercel.json)
- Backend: Render friendly lifecycle (render.yaml present) or any container/VM running Uvicorn + FastAPI
- Database: MongoDB Atlas or any TLS-enabled MongoDB instance referenced by MONGO_URI

Environment variables

At minimum, set these in a .env file or your host environment:
- MONGO_URI — MongoDB connection string (required for persistent store)
- GEMINI_API_KEY — Google Gemini API key for embeddings and generation (strongly recommended for real LLM responses)
- JWT_SECRET — HMAC secret for signing JWTs (change from default)
- JWT_ALGORITHM — e.g. HS256 (defaults to HS256)
- ACCESS_TOKEN_EXPIRE_MINUTES — token expiration (default: 30)
- REFRESH_TOKEN_EXPIRE_DAYS — default: 7
- ALLOWED_ORIGINS — comma-separated origins to extend CORS beyond defaults

Local development

Prerequisites
- Node 18+ or Bun (for frontend)
- Python 3.11+ and pip
- MongoDB instance (local or Atlas)
- (Optional) Google Gemini API key for realistic embeddings/generation

Backend (local)
1. Create a virtual environment and install requirements:

   python -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt

2. Create a .env in the project root (or backend/). Required variables: MONGO_URI, GEMINI_API_KEY (optional for fallback), JWT_SECRET. Example:

   MONGO_URI="your_mongodb_uri"
   GEMINI_API_KEY="your_gemini_api_key"
   JWT_SECRET="a_strong_secret"

3. Run the backend development server:

   uvicorn backend.main:app --reload --port 8000

4. Health check: GET http://localhost:8000/health

Frontend (local)
1. Install dependencies in the frontend folder (npm/pnpm/bun supported):

   cd frontend
   npm install
   npm run dev

2. Open http://localhost:5173 (or the port printed by Vite).

Deployment notes

- Frontend: Vercel is configured (frontend/vercel.json). The site currently points to https://code-therapist.vercel.app.
- Backend: Render configuration is included (render.yaml). Ensure MONGO_URI and GEMINI_API_KEY are set in your Render/host environment variables.
- Use a TLS-enabled MongoDB (MongoDB Atlas recommended) and rotate JWT_SECRET in production.

API surface (selected)
- GET /health — health check
- /auth/* — authentication endpoints (signup/login/refresh)
- /diagnose/* — submit issues and request diagnoses/prescriptions
- /sessions/* — session persistence and history
- /vpi/* — (internal) visual programming / instrumentation endpoints (see routes/vpi.py)

Contributing

Contributions welcome. Suggested workflow:
- Fork the repo
- Create a feature branch (feat/..., fix/..., chore/...)
- Open a Pull Request against main with a clear description and testing notes

Before opening PRs:
- Run frontend linting (npm run lint)
- Run any backend unit tests you add; keep changes focused

Troubleshooting & debugging

- If MongoDB fails to connect, verify MONGO_URI and that your host IP is allowed by Atlas.
- If GEMINI_API_KEY is missing, the code provides sensible fallbacks (embedding vectors of zeros, local warnings) but results will be low-quality.
- Check logs in the backend — the FastAPI app logs under logger "code_therapist" and main.py runs heavy initialization in a background task to avoid port-binding timeouts on platforms like Render.
- CORS: tweak ALLOWED_ORIGINS if your frontend is served from a different host.

Security & privacy

- Treat GEMINI_API_KEY and JWT_SECRET as secrets. Never commit them.
- User input (error messages, code snippets) may contain sensitive data; consider redacting secrets before sending to LLMs in a production deployment.
- For production, enable strict rate-limiting and usage monitoring for LLM API calls to control cost and abuse.

Contact / Maintainers
- Repository: https://github.com/Typecaster12/CodeTherapist
- Author: Typecaster12

License
- No license specified in the repository. Add a LICENSE file (MIT, Apache-2.0, etc.) if you intend to permit reuse.

Acknowledgements
- Built using FastAPI, React, Vite, and Google Gemini.

----

If you want, I can also:
- Add examples of typical API requests/responses (JSON payloads for diagnose endpoint).
- Add launch scripts / docker-compose to simplify local setup.
- Create a CONTRIBUTING.md or expand the existing README with screenshots and sample sessions.
