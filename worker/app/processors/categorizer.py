import groq
from app.config import settings
from loguru import logger

client = groq.Client(api_key=settings.groq_api_key)

CATEGORIES = [
    "Invoice", "Legal", "Medical", "Personal", "Financial",
    "Technical", "Report", "Contract", "Other"
]

def categorize_document(text: str) -> str:
    """
    Uses Groq API to categorize the document text into one of the predefined categories.
    """
    # If text is too long, we only need the beginning (e.g. first 4000 characters) to categorize it.
    truncated_text = text[:4000]
    
    prompt = f"""
    Categorize the following document text into EXACTLY ONE of the following categories:
    {', '.join(CATEGORIES)}.
    
    Respond ONLY with the category name, nothing else. Do not include quotes or punctuation.
    If it doesn't clearly fit into any, respond with "Other".
    
    Document text:
    {truncated_text}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a highly accurate document categorization system."},
                {"role": "user", "content": prompt}
            ],
            model=settings.groq_model,
            temperature=0.0,
            max_tokens=10
        )
        
        category = response.choices[0].message.content.strip()
        
        # Validate category
        for valid_category in CATEGORIES:
            if valid_category.lower() == category.lower():
                return valid_category
                
        return "Other"
    except Exception as e:
        logger.error(f"Failed to categorize document using Groq: {e}")
        return "Other"
