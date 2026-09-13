import fitz  # PyMuPDF
from typing import Dict, Any
from loguru import logger

def extract_metadata_from_pdf(file_path: str) -> Dict[str, Any]:
    """
    Extracts metadata from a PDF file using PyMuPDF.
    """
    metadata = {
        "page_count": 0,
        "doc_title": None,
        "doc_author": None,
        "doc_created_at": None,
        "doc_modified_at": None
    }
    
    try:
        doc = fitz.open(file_path)
        metadata["page_count"] = len(doc)
        
        pdf_metadata = doc.metadata
        if pdf_metadata:
            metadata["doc_title"] = pdf_metadata.get("title")
            metadata["doc_author"] = pdf_metadata.get("author")
            metadata["doc_created_at"] = pdf_metadata.get("creationDate")
            metadata["doc_modified_at"] = pdf_metadata.get("modDate")
            
        doc.close()
        return metadata
    except Exception as e:
        logger.error(f"Error extracting metadata from {file_path}: {e}")
        return metadata
