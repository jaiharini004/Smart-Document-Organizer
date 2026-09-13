@echo off
set "PROJECT_ROOT=e:\Smart Document Organizer"
cd /d "%PROJECT_ROOT%"

echo Creating folder structure...
mkdir backend\app\routers 2>nul
mkdir backend\app\models 2>nul
mkdir backend\app\services 2>nul
mkdir worker\app\processors 2>nul
mkdir worker\app\services 2>nul
mkdir k8s\redis 2>nul
mkdir k8s\backend 2>nul
mkdir k8s\worker 2>nul
mkdir k8s\frontend 2>nul
mkdir .github\workflows 2>nul

echo Initializing React frontend...
call npm create vite@latest frontend -- --template react

echo Setting up Python virtual environments and dependencies with UV...
mkdir backend 2>nul
cd backend
call uv venv
call uv init --no-workspace --app
call uv add fastapi uvicorn[standard] supabase celery[redis] python-multipart pydantic-settings loguru httpx
cd ..

mkdir worker 2>nul
cd worker
call uv venv
call uv init --no-workspace --app
call uv add celery[redis] PyMuPDF supabase groq loguru pydantic-settings
cd ..

echo Creating empty files...
type nul > backend\app\main.py
type nul > backend\app\config.py
type nul > backend\app\database.py
type nul > backend\app\routers\documents.py
type nul > backend\app\models\document.py
type nul > backend\app\services\storage.py
type nul > backend\app\services\queue.py
type nul > backend\Dockerfile

type nul > worker\app\main.py
type nul > worker\app\config.py
type nul > worker\app\database.py
type nul > worker\app\processors\text_extractor.py
type nul > worker\app\processors\metadata_parser.py
type nul > worker\app\processors\categorizer.py
type nul > worker\app\services\storage.py
type nul > worker\Dockerfile

type nul > k8s\namespace.yaml
type nul > k8s\configmap.yaml
type nul > k8s\secret.yaml
type nul > k8s\redis\redis-deployment.yaml
type nul > k8s\redis\redis-service.yaml
type nul > k8s\backend\api-deployment.yaml
type nul > k8s\backend\api-service.yaml
type nul > k8s\worker\worker-deployment.yaml
type nul > k8s\frontend\frontend-deployment.yaml
type nul > k8s\frontend\frontend-service.yaml

type nul > .github\workflows\ci.yml
type nul > .github\workflows\deploy.yml

type nul > docker-compose.yml

echo Creating .env.example...
(
echo # Supabase
echo SUPABASE_URL=https://your-project.supabase.co
echo SUPABASE_KEY=your-supabase-anon-key
echo SUPABASE_STORAGE_BUCKET=documents
echo.
echo # Redis
echo REDIS_URL=redis://localhost:6379/0
echo.
echo # Groq AI
echo GROQ_API_KEY=your-groq-api-key
echo GROQ_MODEL=llama3-8b-8192
echo.
echo # App
echo LOG_LEVEL=INFO
echo.
echo # Frontend ^(Vite prefix required^)
echo VITE_API_URL=http://localhost:8000
) > .env.example

copy /y .env.example .env

echo Project setup complete!
