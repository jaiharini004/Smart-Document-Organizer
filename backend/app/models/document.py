from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    original_name: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = "application/pdf"
    
    status: str
    
    extracted_text: Optional[str] = None
    page_count: Optional[int] = None
    
    doc_title: Optional[str] = None
    doc_author: Optional[str] = None
    doc_created_at: Optional[str] = None
    doc_modified_at: Optional[str] = None
    
    category: Optional[str] = None
    category_confidence: Optional[float] = None
    
    uploaded_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentStatusResponse(BaseModel):
    id: UUID
    status: str
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    category: Optional[str] = None
