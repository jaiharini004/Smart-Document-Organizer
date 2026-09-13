from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.documents import router as documents_router

app = FastAPI(
    title="Smart Document Organizer API",
    description="API for uploading, processing, and searching documents.",
    version="1.0.0"
)

# Set up CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For MVP, allow all origins. In production, restrict to frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Smart Document Organizer API! 🚀",
        "docs": "Visit /docs for the interactive API documentation."
    }
