import os
from celery import Celery
from loguru import logger
from app.config import settings
from app.database import supabase
from app.services.storage import download_file_to_temp
from app.processors.text_extractor import extract_text_from_pdf
from app.processors.metadata_parser import extract_metadata_from_pdf
from app.processors.categorizer import categorize_document

celery_app = Celery(
    "worker",
    broker=settings.redis_url,
    backend=settings.redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="process_document_task")
def process_document(document_id: str, file_path: str):
    """
    Main background task to process a document.
    """
    logger.info(f"Starting processing for document {document_id}")
    
    # 1. Update status to processing
    supabase.table("documents").update({"status": "processing"}).eq("id", document_id).execute()
    
    temp_file = None
    try:
        # 2. Download file
        logger.info(f"Downloading {file_path} from storage...")
        temp_file = download_file_to_temp(file_path)
        
        # 3. Extract metadata
        logger.info(f"Extracting metadata for {document_id}...")
        metadata = extract_metadata_from_pdf(temp_file)
        
        # 4. Extract text
        logger.info(f"Extracting text for {document_id}...")
        text = extract_text_from_pdf(temp_file)
        
        # 5. Categorize using Groq
        logger.info(f"Categorizing document {document_id}...")
        category = categorize_document(text)
        
        # 6. Update database record
        logger.info(f"Updating database for {document_id}...")
        update_data = {
            "status": "processed",
            "extracted_text": text,
            "category": category,
            "category_confidence": 1.0, 
            "page_count": metadata.get("page_count"),
            "doc_title": metadata.get("doc_title"),
            "doc_author": metadata.get("doc_author"),
            "doc_created_at": metadata.get("doc_created_at"),
            "doc_modified_at": metadata.get("doc_modified_at"),
            "processed_at": "now()"
        }
        
        supabase.table("documents").update(update_data).eq("id", document_id).execute()
        
        logger.info(f"Successfully processed document {document_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        # Mark as failed
        supabase.table("documents").update({
            "status": "failed", 
            "error_message": str(e)
        }).eq("id", document_id).execute()
        return False
        
    finally:
        # Cleanup temporary file
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)
            logger.info(f"Cleaned up temporary file {temp_file}")
