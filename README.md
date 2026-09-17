# Multi-Tenant Agentic RAG Platform

A production-grade, multi-tenant AI Chatbot SaaS platform built from scratch. The system enables individual tenants to authenticate, manage knowledge bases with isolated vector storage via PostgreSQL (`pgvector`), generate scoped API keys, orchestrate conversational agents via LangChain and LangGraph, and embed an isolated chat widget into external sites using a custom React web component.

---

## Architecture Overview

```
                        ┌─────────────────────────────────────────┐
                        │            Client / Visitor             │
                        └───────────────────┬─────────────────────┘
                                            │ (Embed Script / Widget)
                                            ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│     Tenant Admin        │     │         Web Component           │
│   (React + Vite SPA)    │     │   (React Shadow DOM / Widget)   │
└────────────┬────────────┘     └─────────────────┬───────────────┘
             │                                    │
             │ REST (Admin JWT)                   │ SSE / Stream (Tenant API Key)
             ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Service                      │
│                                                                 │
│  ┌─────────────────────────┐       ┌─────────────────────────┐  │
│  │  Tenant & Auth Service  │       │  RAG Engine & LangGraph │  │
│  │ (API Keys, Quotas, Org) │       │ (Retrieval, Fallbacks)  │  │
│  └────────────┬────────────┘       └────────────┬────────────┘  │
└───────────────┼─────────────────────────────────┼───────────────┘
                │                                 │
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PostgreSQL Database + pgvector                  │
│                                                                 │
│  • Public Schema: Tenants, Users, API Keys, Audit Logs         │
│  • Vector Store: Multi-Tenant Partitioned Embeddings (HNSW/IVF) │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

The repository is structured as a monorepo consisting of three primary workspaces:

```
.
├── backend/            # FastAPI + LangChain + LangGraph + pgvector backend
├── user-panel/         # React + Vite tenant dashboard for document & key management
├── webcomponent/       # Lightweight, isolated React embeddable chat widget
├── docker-compose.yml  # Local multi-service infrastructure (Postgres, Backend, Frontend)
└── README.md
```

---

### 1. `backend/` (Core RAG & API Service)

Powers tenant management, document ingestion, vector retrieval, and conversational AI orchestration.

* **Framework:** FastAPI (Python 3.11+)
* **Orchestration:** LangChain & LangGraph (agentic routing, state management, citation tracking)
* **Storage & Vectors:** PostgreSQL with the `pgvector` extension. Multi-tenancy is enforced via row-level security (RLS) and strict tenant foreign-key scoping on vector collection tables.
* **Authentication:**
  * JWT auth for tenant dashboard access.
  * Hashed API key validation (`Bearer pk_live_...`) for client web-component queries.

**Key Endpoints:**
* `POST /api/v1/auth/register` & `POST /api/v1/auth/login`: Admin onboarding.
* `POST /api/v1/keys`: Generate and revoke tenant public API keys.
* `POST /api/v1/documents/upload`: Parse, chunk, and embed documents into tenant-scoped vector spaces.
* `POST /api/v1/chat/completions`: Streaming agentic endpoint (SSE) handling conversational RAG queries.

---

### 2. `user-panel/` (Admin Dashboard)

The administrative client portal where registered tenants control their AI configuration and data.

* **Tech Stack:** React 18, Vite, Tailwind CSS, TanStack Query, Lucide Icons.
* **Features:**
  * **API Key Management:** Generate, copy, and restrict public embed keys.
  * **Knowledge Base Manager:** Upload PDFs, markdown, and text files; monitor embedding job progress.
  * **System Prompt & Agent Tuner:** Adjust LLM temperature, system prompts, retrieval top-k parameters, and fallback behaviors.
  * **Analytics & Usage:** Real-time token usage, query counts, and conversation inspection.
  * **Widget Customizer:** Live preview to configure colors, bot title, avatar, and positioning for the embed script.

---

### 3. `webcomponent/` (Embeddable Chat Widget)

A self-contained client package engineered to run on any website without CSS leakage or namespace collisions.

* **Tech Stack:** React, Tailwind CSS (scoped), Custom Elements API / Shadow DOM.
* **Integration Modes:**
  * **Script Tag (CDN):** Single `<script>` inclusion that mounts the custom element `<ai-chat-widget>`.
  * **React Component Package:** Direct NPM dependency for React/Next.js client applications.
* **Features:**
  * Encapsulated Shadow DOM preventing host stylesheet conflicts.
  * Streaming responses via Server-Sent Events (SSE) with markdown and code block rendering.
  * Tenant identification through public API key header (`x-tenant-key`).
  * Responsive drawer/popup UI with local session persistence.

---

## Getting Started

### Prerequisites

* Docker & Docker Compose
* Python 3.11+
* Node.js 20+ and pnpm / npm
* OpenAI API Key (or alternative LLM API key)

### Local Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/multi-tenant-rag-platform.git
   cd multi-tenant-rag-platform
   ```

2. **Configure Environment Variables:**

   Create `.env` files in each workspace:

   * **`backend/.env`:**
     ```env
     DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/rag_platform
     SECRET_KEY=your_jwt_secret_key
     OPENAI_API_KEY=your_openai_api_key
     EMBEDDING_MODEL=text-embedding-3-small
     CHAT_MODEL=gpt-4o
     ```

   * **`user-panel/.env`:**
     ```env
     VITE_BACKEND_API_URL=http://localhost:8000
     ```

   * **`webcomponent/.env`:**
     ```env
     VITE_CHAT_API_URL=http://localhost:8000/api/v1/chat/completions
     ```

3. **Spin up PostgreSQL with pgvector (via Docker):**
   ```bash
   docker compose up -d postgres
   ```

4. **Run Database Migrations:**
   ```bash
   cd backend
   poetry install # or pip install -r requirements.txt
   alembic upgrade head
   ```

5. **Start Services:**

   * **Backend:**
     ```bash
     cd apps/backend
     uvicorn app.main:app --reload --port 8000
     ```
   * **User Panel:**
     ```bash
     cd apps/web
     npm install && npm run dev
     ```
   * **Web Component (Development Preview):**
     ```bash
     cd apps/webcomponent
     npm install && npm run dev
     ```

---

## Embedding the Widget on External Sites

Once an API key is generated in the Admin Panel, place this snippet before the closing `</body>` tag on any HTML page:

```html
<!-- Load the widget bundle -->
<script src="https://cdn.codernex.dev/widget.js" defer></script>

<!-- Render the widget with your tenant key -->
<ai-chat-widget
  tenant-key="pk_live_your_tenant_api_key_here"
  theme-color="#10b981"
  bot-name="Support Assistant"
  position="bottom-right">
</ai-chat-widget>
```

---

## Roadmap

- [] Multi-tenant PostgreSQL `pgvector` isolation & HNSW indexing
- [] LangGraph agent loop with retrieval fallback and web search tools
- [] React + Vite Admin dashboard for document ingestion & API key control
- [] Shadow DOM isolated web component widget with SSE streaming
- [ ] Role-Based Access Control (RBAC) inside individual tenant workspaces
- [ ] Hybrid Search (BM25 sparse vectors + pgvector dense embeddings)
- [ ] Enterprise rate-limiting & tenant token quota enforcement

---