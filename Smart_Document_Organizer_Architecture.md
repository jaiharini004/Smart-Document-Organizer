# 📁 Smart Document Organizer — Complete Architecture & Setup Reference

> **Version**: 1.0  
> **Last Updated**: September 2026  
> **Stack**: React · FastAPI · Supabase · PyMuPDF · Celery · Redis · Docker · Kubernetes · GitHub Actions · Groq

---

## 📌 Project Overview

**Smart Document Organizer** is a document management system that allows users to upload documents (PDFs), automatically extract text and metadata, categorize them using AI, store them securely, and search through their content — all from a clean web interface.

### 🎯 Core Goals
- Upload and store documents (PDF-first)
- Automatically extract text and metadata
- AI-powered categorization using Groq
- Full-text search across all documents
- Track processing status per document
- Monitor system activity via logs

---

## ✅ Final Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Node.js | User interface for uploading and managing documents |
| **Backend** | FastAPI (Python) | REST API for document operations |
| **Task Queue** | Celery + Redis | Async document processing between API and Worker |
| **Document Processing** | Python + PyMuPDF | Extract text and metadata from PDFs |
| **AI Categorization** | Groq API (LLaMA 3) | Intelligent document categorization |
| **Database** | Supabase PostgreSQL | Store document metadata, categories, status |
| **File Storage** | Supabase Storage | Store uploaded PDF/document files |
| **Containerization** | Docker | Containerize API, Worker, and Redis |
| **Orchestration** | Kubernetes | Deploy and manage all containers |
| **Container Registry** | GHCR | Store and version Docker images |
| **CI/CD** | GitHub Actions | Automate testing, building, and deployment |
| **Configuration** | K8s ConfigMaps & Secrets | Manage app config and credentials |
| **Monitoring** | Kubernetes Logs + Metrics | Monitor application and worker activity |
| **Version Control** | Git & GitHub | Source-code management |
| **API Testing** | Swagger UI / Postman | Test and document APIs |
| **Python Pkg Manager** | UV | Fast Python dependency management |
| **Node Pkg Manager** | npm | Frontend dependency management |

> **No authentication** — open access for MVP simplicity.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                    React Frontend (Port 3000)                        │
│         Upload │ Search │ View Documents │ Check Status             │
└─────────────────────────┬───────────────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND (Port 8000)                       │
│                                                                      │
│  POST /documents/upload    →  Accept file, store to Supabase        │
│  GET  /documents           →  List all documents                    │
│  GET  /documents/{id}      →  Get single document + metadata        │
│  GET  /documents/search    →  Full-text search                      │
│  GET  /documents/{id}/status → Check processing status             │
│  DELETE /documents/{id}    →  Delete document                       │
│                                                                      │
│  Swagger UI available at: /docs                                      │
└────────┬────────────────────────────────────┬───────────────────────┘
         │ Enqueue Task                        │ Read / Write
         ▼                                     ▼
┌──────────────────┐              ┌────────────────────────────────────┐
│  REDIS (Broker)  │              │           SUPABASE                 │
│                  │              │                                     │
│  Task Queue for  │              │  ┌─────────────────────────────┐  │
│  document        │              │  │   PostgreSQL Database        │  │
│  processing jobs │              │  │   - documents table          │  │
└────────┬─────────┘              │  │   - status tracking          │  │
         │ Dequeue Task           │  │   - extracted text           │  │
         ▼                        │  │   - categories               │  │
┌──────────────────────┐          │  └─────────────────────────────┘  │
│  CELERY WORKER       │          │  ┌─────────────────────────────┐  │
│                      │◄────────►│  │   Supabase Storage (S3)     │  │
│  1. Download file    │          │  │   - Raw PDF files           │  │
│  2. Extract text     │          │  │   - Organized by doc ID     │  │
│     (PyMuPDF)        │          │  └─────────────────────────────┘  │
│  3. Extract metadata │          └────────────────────────────────────┘
│  4. Categorize       │
│     (Groq AI)        │
│  5. Update DB record │
└──────────────────────┘

All services containerized with Docker
All containers managed by Kubernetes
Images stored in GHCR
CI/CD automated by GitHub Actions
```

---

## 📋 Application Features

### 1. 📤 Document Upload
- User selects a PDF file from the browser
- Frontend sends file to FastAPI via `multipart/form-data`
- API uploads raw file to **Supabase Storage**
- API creates a database record with status: `pending`
- API enqueues a processing task to **Celery via Redis**
- User receives a document ID and initial status

### 2. ⚙️ Automatic Document Processing (Background Worker)
The Celery Worker handles everything asynchronously:

| Step | Action | Tool |
|------|--------|------|
| 1 | Download file from Supabase Storage | Supabase Python SDK |
| 2 | Extract full text from PDF | PyMuPDF (fitz) |
| 3 | Extract metadata (title, author, pages, size, dates) | PyMuPDF |
| 4 | Categorize document (Invoice, Legal, Medical, Personal, etc.) | Groq API |
| 5 | Update database record (status: `processed`) | Supabase PostgreSQL |

### 3. 📋 Document Listing
- View all uploaded documents in a table/card layout
- Shows: filename, category, page count, upload date, status badge
- Status badges: `pending` → `processing` → `processed` / `failed`

### 4. 🔍 Document Search
- Search bar queries the PostgreSQL database
- Uses **PostgreSQL full-text search** (`tsvector/tsquery`) on extracted text
- Results show matching documents with highlighted snippets

### 5. 📄 Document Detail View
- Click any document to see full details:
  - Extracted text preview
  - All metadata (author, pages, file size, creation date)
  - AI-assigned category
  - Processing status and timestamps
  - Download link (from Supabase Storage)

### 6. 🗑️ Document Deletion
- Delete a document record from the database
- Remove the file from Supabase Storage

### 7. 📊 Processing Status Tracking
- API endpoint to poll the processing status of any document
- Frontend shows real-time status updates (polling every 3 seconds)

### 8. 📡 Monitoring & Logs
- All services emit structured JSON logs
- Kubernetes collects and surfaces logs via `kubectl logs`
- Key events logged: upload received, processing started, processing complete, errors

---

## 🗄️ Database Schema

### `documents` Table (Supabase PostgreSQL)

```sql
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename        TEXT NOT NULL,
    original_name   TEXT NOT NULL,
    file_path       TEXT NOT NULL,        -- Supabase Storage path
    file_size       BIGINT,               -- bytes
    mime_type       TEXT DEFAULT 'application/pdf',

    -- Processing Status
    status          TEXT DEFAULT 'pending',
    -- values: 'pending' | 'processing' | 'processed' | 'failed'

    -- Extracted Content
    extracted_text  TEXT,
    page_count      INTEGER,

    -- Metadata from PyMuPDF
    doc_title       TEXT,
    doc_author      TEXT,
    doc_created_at  TEXT,
    doc_modified_at TEXT,

    -- AI Categorization
    category        TEXT,
    -- values: 'Invoice' | 'Legal' | 'Medical' | 'Personal' | 'Financial' |
    --         'Technical' | 'Report' | 'Contract' | 'Other'
    category_confidence FLOAT,

    -- Full-text search vector
    search_vector   TSVECTOR,

    -- Timestamps
    uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,
    error_message   TEXT
);

-- Index for full-text search
CREATE INDEX idx_documents_search ON documents USING GIN(search_vector);

-- Index for status filtering
CREATE INDEX idx_documents_status ON documents(status);

-- Auto-update search vector when text changes
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector('english',
            COALESCE(NEW.original_name, '') || ' ' ||
            COALESCE(NEW.doc_title, '') || ' ' ||
            COALESCE(NEW.doc_author, '') || ' ' ||
            COALESCE(NEW.category, '') || ' ' ||
            COALESCE(NEW.extracted_text, '')
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vector
BEFORE INSERT OR UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:8000`
### Swagger UI: `http://localhost:8000/docs`

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `POST` | `/documents/upload` | Upload a PDF document | `multipart/form-data` (file) | `{id, filename, status}` |
| `GET` | `/documents` | List all documents | Query: `?limit&offset` | `[{id, name, category, status, ...}]` |
| `GET` | `/documents/{id}` | Get document details | Path: `id` | Full document object |
| `GET` | `/documents/{id}/status` | Get processing status | Path: `id` | `{status, processed_at}` |
| `GET` | `/documents/search` | Search documents | Query: `?q=invoice` | `[{id, name, snippet, ...}]` |
| `DELETE` | `/documents/{id}` | Delete a document | Path: `id` | `{message: "deleted"}` |
| `GET` | `/health` | Health check | — | `{status: "ok"}` |

---

## 📁 Project Structure

```
smart-document-organizer/
│
├── frontend/                          # React Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentUpload.jsx     # Upload form
│   │   │   ├── DocumentList.jsx       # Document table/cards
│   │   │   ├── DocumentDetail.jsx     # Single document view
│   │   │   ├── SearchBar.jsx          # Search input
│   │   │   └── StatusBadge.jsx        # Status indicator
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Main dashboard
│   │   │   ├── DocumentView.jsx       # Document detail page
│   │   │   └── SearchResults.jsx      # Search results page
│   │   ├── services/
│   │   │   └── api.js                 # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend/                           # FastAPI Application
│   ├── app/
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── config.py                  # Settings from env vars
│   │   ├── database.py                # Supabase client setup
│   │   ├── routers/
│   │   │   └── documents.py           # All document endpoints
│   │   ├── models/
│   │   │   └── document.py            # Pydantic schemas
│   │   └── services/
│   │       ├── storage.py             # Supabase Storage operations
│   │       └── queue.py               # Celery task enqueueing
│   ├── pyproject.toml                 # UV managed dependencies
│   ├── uv.lock
│   └── Dockerfile
│
├── worker/                            # Celery Processing Worker
│   ├── app/
│   │   ├── main.py                    # Celery app + task definitions
│   │   ├── config.py                  # Settings
│   │   ├── database.py                # Supabase client setup
│   │   ├── processors/
│   │   │   ├── text_extractor.py      # PyMuPDF text extraction
│   │   │   ├── metadata_parser.py     # PDF metadata parsing
│   │   │   └── categorizer.py         # Groq AI categorization
│   │   └── services/
│   │       └── storage.py             # Download file from Supabase
│   ├── pyproject.toml                 # UV managed dependencies
│   ├── uv.lock
│   └── Dockerfile
│
├── k8s/                               # Kubernetes Manifests
│   ├── namespace.yaml
│   ├── configmap.yaml                 # Non-sensitive config
│   ├── secret.yaml                    # Supabase keys, Groq key
│   ├── redis/
│   │   ├── redis-deployment.yaml
│   │   └── redis-service.yaml
│   ├── backend/
│   │   ├── api-deployment.yaml
│   │   └── api-service.yaml
│   ├── worker/
│   │   └── worker-deployment.yaml
│   └── frontend/
│       ├── frontend-deployment.yaml
│       └── frontend-service.yaml
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Test + Lint on PR
│       └── deploy.yml                 # Build → Push GHCR → Deploy K8s
│
├── docker-compose.yml                 # Local development stack
├── .env.example                       # Environment variable template
└── README.md
```

---

## 🔄 Data Flow — End to End

```
Step 1: UPLOAD
  User → React UI
       → POST /documents/upload (FastAPI)
       → File saved to Supabase Storage
       → DB record created (status: pending)
       → Task enqueued to Redis
       → Response: {id, status: "pending"}

Step 2: PROCESSING (Background)
  Celery Worker ← Dequeues task from Redis
               → Downloads file from Supabase Storage
               → Updates DB (status: processing)
               → PyMuPDF extracts text + metadata
               → Groq API categorizes document
               → Updates DB (status: processed, + all data)

Step 3: DISPLAY
  User → React polls GET /documents/{id}/status
       → Status becomes "processed"
       → React fetches GET /documents/{id}
       → Shows extracted text, metadata, category

Step 4: SEARCH
  User → Types query in search bar
       → GET /documents/search?q=invoice
       → FastAPI runs PostgreSQL full-text search
       → Returns matching documents with snippets
```

---

## 🐳 Docker Setup

### `docker-compose.yml` (Local Development)

```yaml
version: '3.9'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
    volumes:
      - ./backend:/app

  worker:
    build: ./worker
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - REDIS_URL=redis://redis:6379/0
      - GROQ_API_KEY=${GROQ_API_KEY}
    depends_on:
      - redis
    volumes:
      - ./worker:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
```

---

## ☸️ Kubernetes Architecture

```
Kubernetes Cluster (Namespace: smart-doc-organizer)
│
├── Deployments
│   ├── frontend-deployment     (1 replica)   → React app served via Nginx
│   ├── api-deployment          (2 replicas)   → FastAPI + Uvicorn
│   ├── worker-deployment       (1-3 replicas) → Celery Worker (scalable)
│   └── redis-deployment        (1 replica)    → Redis broker
│
├── Services
│   ├── frontend-service        → ClusterIP / NodePort
│   ├── api-service             → ClusterIP (internal) / LoadBalancer (external)
│   └── redis-service           → ClusterIP (internal only)
│
├── ConfigMaps
│   └── app-config              → REDIS_URL, API_URL, LOG_LEVEL
│
└── Secrets
    └── app-secrets             → SUPABASE_URL, SUPABASE_KEY, GROQ_API_KEY
```

---

## 🔁 CI/CD Pipeline (GitHub Actions)

### Workflow 1: `ci.yml` — On every Pull Request
```
PR Opened/Updated
  │
  ├─ Lint Python (ruff)
  ├─ Lint JavaScript (eslint)
  ├─ Run Backend Tests (pytest)
  └─ Build Docker Images (verify they build)
```

### Workflow 2: `deploy.yml` — On push to `main`
```
Push to main
  │
  ├─ Run all tests
  ├─ Build Docker image: backend  → ghcr.io/{user}/sdo-backend:latest
  ├─ Build Docker image: worker   → ghcr.io/{user}/sdo-worker:latest
  ├─ Build Docker image: frontend → ghcr.io/{user}/sdo-frontend:latest
  ├─ Push all images to GHCR
  └─ Apply Kubernetes manifests (kubectl apply -f k8s/)
```

---

## ⚙️ Environment Variables

Create a `.env` file from `.env.example`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_STORAGE_BUCKET=documents

# Redis
REDIS_URL=redis://localhost:6379/0

# Groq AI
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama3-8b-8192

# App
LOG_LEVEL=INFO

# Frontend (Vite prefix required)
VITE_API_URL=http://localhost:8000
```

---

## 📦 Key Dependencies

### Backend (UV — `backend/pyproject.toml`)
```toml
[project]
dependencies = [
    "fastapi>=0.111.0",
    "uvicorn[standard]>=0.30.0",
    "supabase>=2.0.0",
    "celery[redis]>=5.3.0",
    "python-multipart>=0.0.9",
    "pydantic-settings>=2.0.0",
    "loguru>=0.7.0",
    "httpx>=0.27.0",
]
```

### Worker (UV — `worker/pyproject.toml`)
```toml
[project]
dependencies = [
    "celery[redis]>=5.3.0",
    "PyMuPDF>=1.24.0",
    "supabase>=2.0.0",
    "groq>=0.9.0",
    "loguru>=0.7.0",
    "pydantic-settings>=2.0.0",
]
```

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

---

## 🗺️ Development Phases

### Phase 1 — Foundation
- [ ] Set up Supabase project (PostgreSQL + Storage)
- [ ] Create `documents` table with schema above
- [ ] Set up GitHub repository + branch strategy
- [ ] Configure `.env` and secrets

### Phase 2 — Backend API
- [ ] Scaffold FastAPI project with UV
- [ ] Implement all 7 API endpoints
- [ ] Connect Supabase PostgreSQL + Storage
- [ ] Set up Celery + Redis task queue
- [ ] Write pytest tests for all endpoints
- [ ] Swagger UI verification

### Phase 3 — Document Processing Worker
- [ ] Scaffold Celery worker project with UV
- [ ] Implement PyMuPDF text + metadata extraction
- [ ] Implement Groq AI categorization
- [ ] Full processing pipeline test

### Phase 4 — Frontend
- [ ] Scaffold React app with Vite + npm
- [ ] Build Upload, List, Detail, Search UI components
- [ ] Connect to FastAPI via Axios
- [ ] Status polling for processing updates

### Phase 5 — Containerization
- [ ] Write Dockerfiles for backend, worker, frontend
- [ ] Test with `docker-compose up`
- [ ] Optimize with multi-stage builds

### Phase 6 — Kubernetes & CI/CD
- [ ] Write all Kubernetes YAML manifests
- [ ] Set up Minikube locally, test deployment
- [ ] Set up GHCR in GitHub repository
- [ ] Write GitHub Actions CI workflow
- [ ] Write GitHub Actions Deploy workflow
- [ ] End-to-end deployment test

### Phase 7 — Monitoring & Polish
- [ ] Add structured logging to all services
- [ ] Kubernetes health checks (liveness + readiness probes)
- [ ] Error handling and retry logic in worker
- [ ] README and documentation

---

## 🔮 Future Enhancements (Post-MVP)

| Feature | Technology |
|---------|-----------|
| Semantic search | pgvector (Supabase extension) |
| RAG Q&A over documents | Groq + pgvector |
| Multi-format support | python-docx, python-pptx |
| Document thumbnails | pdf2image |
| Batch upload | Frontend queue + Worker parallelism |
| Export to CSV/JSON | FastAPI streaming response |

---

## 📊 Monitoring Reference

### Key Log Events to Track

| Event | Level | Service |
|-------|-------|---------|
| Document uploaded | INFO | Backend |
| Processing task enqueued | INFO | Backend |
| Worker task started | INFO | Worker |
| Text extraction complete | INFO | Worker |
| Groq categorization complete | INFO | Worker |
| Processing complete | INFO | Worker |
| Processing failed | ERROR | Worker |
| API request received | DEBUG | Backend |

### Useful Kubernetes Commands
```bash
# View all pods
kubectl get pods -n smart-doc-organizer

# Stream backend logs
kubectl logs -f deployment/api-deployment -n smart-doc-organizer

# Stream worker logs
kubectl logs -f deployment/worker-deployment -n smart-doc-organizer

# Scale worker up/down
kubectl scale deployment worker-deployment --replicas=3 -n smart-doc-organizer

# Describe a failing pod
kubectl describe pod <pod-name> -n smart-doc-organizer
```

---

*This document serves as the single source of truth for the Smart Document Organizer system design and development plan.*
