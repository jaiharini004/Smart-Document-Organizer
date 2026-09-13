from app.database import supabase
from app.config import settings
from loguru import logger

def upload_file(file_bytes: bytes, file_path: str, content_type: str = "application/pdf") -> bool:
    try:
        supabase.storage.from_(settings.supabase_storage_bucket).upload(
            file_path,
            file_bytes,
            {"content-type": content_type}
        )
        return True
    except Exception as e:
        logger.error(f"Failed to upload file to storage: {e}")
        return False

def delete_file(file_path: str) -> bool:
    try:
        supabase.storage.from_(settings.supabase_storage_bucket).remove([file_path])
        return True
    except Exception as e:
        logger.error(f"Failed to delete file from storage: {e}")
        return False
