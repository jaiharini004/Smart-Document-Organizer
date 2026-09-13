
# 📚 Smart Document Organizer

**Smart Document Organizer** is a cloud-ready document management system designed to help users efficiently store, organize, and find personal documents from a centralized platform. 
The application allows users to upload PDF documents, automatically extract text and metadata, categorize files using AI, store document information, and search through their documents via a modern, glassmorphic UI.

## 🚀 Key Features

- **Document Upload**: Securely upload PDF documents directly to cloud storage.
- **AI Categorization**: Automatically categorizes documents (e.g., Invoice, Legal, Medical, Personal) using the Groq LLaMA3 API.
- **Automated Processing**: Background Celery worker extracts full text and technical metadata (pages, author, creation date) without blocking the UI.
- **Full-Text Search**: Search through document content and metadata using PostgreSQL text vectors.
- **Real-Time Polling**: The frontend dashboard automatically polls the status of processing documents and updates seamlessly.
- **Premium UI**: Dark mode, glassmorphic interface built with React and native CSS.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React, Vite, Node.js, Axios, React Router, Lucide React |
| **Backend API** | FastAPI (Python), Uvicorn |
| **Worker Queue** | Celery, Redis |
| **Document Processing** | PyMuPDF (fitz) |
| **AI Services** | Groq API (LLaMA3) |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage (S3 compatible) |
| **Package Managers**| UV (Python), npm (Node.js) |

## 📂 Project Structure

```text
smart-document-organizer/
├── frontend/             # React Application (UI)
├── backend/              # FastAPI Application (API)
├── worker/               # Celery Processing Worker
├── k8s/                  # Kubernetes Deployment Manifests
├── .github/workflows/    # CI/CD GitHub Actions
├── docker-compose.yml    # Local container orchestration
└── .env                  # Environment configurations
```

## ⚙️ Getting Started (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) & `npm`
- [Python 3.11+](https://www.python.org/) & [UV Package Manager](https://github.com/astral-sh/uv)
- Redis Server (Local or Docker)
- Supabase Account & Project
- Groq API Key

### 2. Environment Configuration
Duplicate the `.env.example` file and rename it to `.env` in the root directory. Fill in your credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_STORAGE_BUCKET=documents
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.1-8b-instant
VITE_API_URL=http://localhost:8000
```

### 3. Database Setup (Supabase)
Run the SQL script found in `Smart_Document_Organizer_Architecture.md` within your Supabase SQL editor to create the `documents` table and search triggers.

### 4. Running the Application

You will need to open **three separate terminals** to run the local stack:

**Terminal 1: Start the Backend API**
```bash
cd backend
uv run uvicorn app.main:app --reload
```

**Terminal 2: Start the Processing Worker**
```bash
cd worker
uv run celery -A app.main.celery_app worker --loglevel=info --pool=solo
```

**Terminal 3: Start the Frontend UI**
```bash
cd frontend
npm run dev
```

The React frontend will be available at `http://localhost:5173/` and the FastAPI Swagger docs at `http://localhost:8000/docs`.

## 📜 Architecture Reference
For detailed information regarding the database schema, API contracts, deployment strategies (Docker/Kubernetes), and CI/CD pipelines, please refer to the `Smart_Document_Organizer_Architecture.md` file included in this directory.

## License
This project is open-source and available under the [MIT License](LICENSE). Copyright (c) 2026 [Jai Harini](JAI HARINI K S)
