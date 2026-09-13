from app.database import supabase
from app.config import settings
from loguru import logger
import tempfile
import os

def download_file_to_temp(file_path: str) -> str:
    """
    Downloads a file from Supabase storage to a local temporary file and returns its path.
    """
    try:
        res = supabase.storage.from_(settings.supabase_storage_bucket).download(file_path)
        
        # Create a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        with os.fdopen(fd, 'wb') as f:
            f.write(res)
            
        return temp_path
    except Exception as e:
        logger.error(f"Failed to download file from storage: {e}")
        raise e
