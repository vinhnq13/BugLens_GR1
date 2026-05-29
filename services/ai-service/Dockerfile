# ─────────────────────────────────────────────────────────────────────────────
# BugLens AI Service — Dockerfile
# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage build is not needed here because the service has no heavy
# build step — we just install pip packages and copy Python files.
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency list first so Docker can cache the pip install layer.
# The layer is only re-built when requirements.txt changes.
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the source code
COPY . .

# Expose the port uvicorn will listen on
EXPOSE 8000

# Start the FastAPI app with uvicorn.
# --host 0.0.0.0 makes it reachable from outside the container.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
