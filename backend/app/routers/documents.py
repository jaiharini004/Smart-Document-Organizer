from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List
from uuid import uuid4
from loguru import logger

from app.database import supabase
from app.models.document import DocumentResponse, DocumentStatusResponse
from app.services.storage import upload_file, delete_file
from app.services.queue import enqueue_process_document

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentStatusResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    document_id = str(uuid4())
    file_path = f"{document_id}.pdf"
    
    file_bytes = await file.read()
    
    # Upload to storage
    if not upload_file(file_bytes, file_path, file.content_type):
        raise HTTPException(status_code=500, detail="Failed to upload document to storage.")
        
    # Create DB record
    try:
        data = {
            "id": document_id,
            "filename": file.filename,
            "original_name": file.filename,
            "file_path": file_path,
            "file_size": len(file_bytes),
            "mime_type": file.content_type,
            "status": "pending"
        }
        res = supabase.table("documents").insert(data).execute()
        if not res.data:
            raise Exception("No data returned from insert.")
    except Exception as e:
        logger.error(f"Failed to create DB record: {e}")
        # Try to clean up storage
        delete_file(file_path)
        raise HTTPException(status_code=500, detail="Failed to create document record.")
        
    # Enqueue processing task
    try:
        enqueue_process_document(document_id, file_path)
    except Exception as e:
        logger.error(f"Failed to enqueue processing task: {e}")
        # We don't fail the upload if enqueueing fails, but log it and mark status as failed.
        supabase.table("documents").update({"status": "failed", "error_message": "Failed to enqueue task"}).eq("id", document_id).execute()
        
    return DocumentStatusResponse(id=document_id, status="pending")

@router.get("", response_model=List[DocumentResponse])
def get_documents(limit: int = 50, offset: int = 0):
    try:
        res = supabase.table("documents").select("*").order("uploaded_at", desc=True).range(offset, offset + limit - 1).execute()
        return res.data
    except Exception as e:
        logger.error(f"Failed to fetch documents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")

@router.get("/search", response_model=List[DocumentResponse])
def search_documents(q: str = Query(..., description="Search query")):
    try:
        res = supabase.table("documents").select("*").text_search("search_vector", f"'{q}'").execute()
        return res.data
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@router.get("/{id}", response_model=DocumentResponse)
def get_document(id: str):
    try:
        res = supabase.table("documents").select("*").eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch document {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch document")

@router.get("/{id}/status", response_model=DocumentStatusResponse)
def get_document_status(id: str):
    try:
        res = supabase.table("documents").select("id, status, processed_at, error_message, category").eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch document status {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch document status")

@router.delete("/{id}")
def delete_document(id: str):
    try:
        # Get file path
        res = supabase.table("documents").select("file_path").eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Document not found")
            
        file_path = res.data[0]["file_path"]
        
        # Delete from DB
        supabase.table("documents").delete().eq("id", id).execute()
        
        # Delete from storage
        delete_file(file_path)
        
        return {"message": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document")
