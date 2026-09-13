FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN uv venv && uv pip install -r requirements.txt

# Copy worker code
COPY worker/app ./app

# Run the Celery worker (Linux supports standard prefork)
CMD ["/app/.venv/bin/celery", "-A", "app.main.celery_app", "worker", "--loglevel=info"]
