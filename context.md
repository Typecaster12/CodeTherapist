# Code Therapist — Project Context

> **Tagline**: Developers know they are stuck. Code Therapist tells them why.

---

## Problem Statement

Developers and students often spend hours debugging issues not because the problem itself is difficult, but because they cannot identify the actual **reason** they are stuck.

Existing tools (ChatGPT, Copilot, Stack Overflow) provide answers and fixes — but they do **not diagnose** whether the underlying issue is:

- A conceptual misunderstanding
- A tooling problem
- Weak debugging habits
- Poor architectural decisions
- Overengineering
- Burnout
- Or another type of struggle

As a result, users repeatedly face similar blockers without improving their problem-solving process.

> **Core Problem**: Developers know they are stuck, but they don't know **WHY** they are stuck.

---

## Project Vision

Code Therapist transforms debugging from a **question-answer process** into a **diagnostic process**.

| Traditional Tools | Code Therapist |
|---|---|
| "How do I fix this?" | "Why am I stuck in the first place?" |

The system identifies the **root cause** behind the struggle and prescribes the most effective next step.

---

## Critical Design Principle

Code Therapist **MUST NOT** behave like:

```
User → Gemini → Response
```

That is simply an AI wrapper.

Instead, Code Therapist follows this architecture:

```
User Input
    ↓
Semantic Diagnostic Engine
    ↓
Classification of Developer Struggle
    ↓
Gemini Prescription Engine
    ↓
Learning Profile Storage
    ↓
Analytics Dashboard
```

> **Gemini is NOT responsible for diagnosis.**
> **Gemini is ONLY responsible for generating personalized explanations and guidance AFTER diagnosis has already occurred.**

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Recharts | Data Visualizations |

### Backend
| Tool | Purpose |
|---|---|
| FastAPI (Python) | REST API Server |

### Semantic Classification
| Tool | Purpose |
|---|---|
| Sentence Transformers | Embedding Model |
| `all-MiniLM-L6-v2` | Model Name |
| Cosine Similarity | Classification Method |

### LLM
| Tool | Purpose |
|---|---|
| Gemini 2.5 Flash | Prescription Engine |

### Database
| Tool | Purpose |
|---|---|
| MongoDB Atlas | Session & Profile Storage |

### Deployment
| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |

---

## User Flow

A developer opens Code Therapist and submits a **Diagnosis Form** containing:

- **Error Message** — The exact error they see
- **Code Snippet** — Relevant code block
- **Goal** — What they were trying to build
- **Technology / Framework** — e.g., React, Node.js, FastAPI
- **Time Spent Stuck** — In minutes
- **Emotional State** — e.g., Frustrated, Confused, Overwhelmed

### Example Input

```
Error:     "Cannot read properties of undefined"
Goal:      "Fetching todos from an API"
Technology: React
Time Stuck: 180 minutes
Emotion:   Frustrated
Code:      (code snippet)
```

---

## Backend Workflow

### Step 1 — Receive User Input

FastAPI receives a POST request with the following JSON body:

```json
{
  "error": "...",
  "code": "...",
  "goal": "...",
  "tech": "...",
  "emotion": "...",
  "timeStuck": 180
}
```

---

### Step 2 — Build Issue Context

All fields are combined into a single **issue representation string**:

```
Issue:
Error: ...
Goal: ...
Technology: ...
Emotion: ...
Time Stuck: ...
Code: ...
```

This combined text represents the developer's struggle holistically.

---

### Step 3 — Semantic Diagnostic Engine ⭐ CORE INNOVATION

The engine defines **developer struggle categories**, each with a detailed description:

| # | Category | Description |
|---|---|---|
| 1 | **Syntax Error** | The issue is a typo, missing bracket, or basic language grammar mistake |
| 2 | **Logic Error** | The code runs but produces incorrect output due to flawed reasoning |
| 3 | **Conceptual Gap** | The developer misunderstands an underlying programming concept or framework behavior |
| 4 | **Architecture Issue** | The problem stems from poor design decisions or structural flaws in the codebase |
| 5 | **Tooling Problem** | The issue stems from environment setup, dependencies, build configuration, or package management |
| 6 | **Debugging Skill Gap** | The developer lacks effective strategies to isolate and reproduce the problem |
| 7 | **Overengineering** | The developer is adding unnecessary complexity to a simple problem |
| 8 | **Burnout** | The developer is mentally exhausted, leading to poor focus and decision-making |

Each category description is converted into an **embedding vector** using:
- Model: `sentence-transformers/all-MiniLM-L6-v2`
- Embeddings are computed once and **cached in memory**

---

### Step 4 — Issue Embedding

The combined issue text is converted into an embedding using the same model:

```python
issue_embedding = model.encode(issue_text)
```

---

### Step 5 — Semantic Classification

Cosine similarity is computed between the `issue_embedding` and each **category embedding**:

```python
{
  "Conceptual Gap": 0.91,
  "Tooling Problem": 0.42,
  "Logic Error": 0.31,
  ...
}
```

The category with the **highest similarity** becomes the **diagnosis**.

**Example Result:**
- **Diagnosis**: Conceptual Gap
- **Confidence**: 91%

> The diagnostic engine does **NOT** use hardcoded if-else rules.
> The diagnostic engine does **NOT** use Gemini for classification.

---

### Step 6 — Gemini Prescription Engine

After diagnosis, Gemini receives:
- Original issue
- Diagnosed category
- Confidence score
- Emotion
- Technology

Gemini generates a **4-part prescription**:

| Part | Description |
|---|---|
| **Why Stuck** | Root cause explanation |
| **Immediate Next Step** | Actionable fix to try right now |
| **Concept to Study** | One topic to learn to prevent recurrence |
| **Prevention Advice** | Long-term habit or mindset shift |

The response must be:
- **Empathetic** and **educational** in tone
- Should **NOT** generate raw code unless truly necessary
- Goal is **learning and guidance**, not code generation

**Example Output:**

```
Diagnosis:     You misunderstood asynchronous rendering behavior.
Immediate Fix: Use conditional rendering.
Study Next:    React state lifecycle and useEffect.
Prevention:    Always assume asynchronous data may initially be undefined.
```

---

### Step 7 — Store Session

Each diagnosis session is stored in MongoDB Atlas:

| Field | Type | Description |
|---|---|---|
| `userId` | String | User ID (if auth exists) |
| `error` | String | Original error message |
| `goal` | String | What the user was building |
| `technology` | String | Tech/framework involved |
| `emotion` | String | User's emotional state |
| `timeStuck` | Number | Minutes spent stuck |
| `diagnosedCategory` | String | Result of semantic classification |
| `confidence` | Number | Cosine similarity score |
| `prescription` | Object | Gemini-generated prescription |
| `timestamp` | DateTime | When the session was created |

---

### Step 8 — Learning Profile

Historical sessions are aggregated to generate a **developer learning profile**:

**Top Blockers:**
- Conceptual Gap: 45%
- Tooling: 25%
- Logic Errors: 20%

**Most Problematic Technologies:**
- React, Node.js, JWT

**Recovery Trends:**
- Average struggle duration over time
- Improvement trends week-over-week

---

## Dashboard Features

Visualized using **Recharts**:

- Most common struggle categories (Pie/Bar chart)
- Technology-wise blocker distribution (Bar chart)
- Weekly diagnosis trends (Line chart)
- Learning improvement insights
- Session history table

---

## MVP Scope (Hackathon)

### ✅ Build These Features

1. Landing Page
2. Diagnose Form
3. FastAPI Backend
4. Semantic Classification Engine
5. Gemini Prescription Engine
6. Results Page
7. MongoDB Session Storage
8. Dashboard with basic analytics

### ❌ Do NOT Build

- VS Code Extension
- GitHub Integration
- Multi-agent systems
- RAG pipelines
- Fine-tuned models
- Authentication systems
- Team analytics

---

## What Makes Code Therapist Different?

Code Therapist is **NOT**:
- ChatGPT with a UI
- Copilot clone
- RAG chatbot
- Bug fixer

Code Therapist **IS**:

> A **semantic diagnostic system** for developers that identifies **WHY** they are stuck, classifies the underlying struggle, generates personalized prescriptions, and tracks learning patterns over time.

The innovation lies in **diagnosing developer struggles BEFORE prescribing solutions**.

The product transforms debugging from trial-and-error into a **structured learning experience**.
