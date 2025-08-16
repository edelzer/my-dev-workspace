# FastAPI Professional Template - Multi-stage Docker Build
# Security-optimized production container with non-root user

# Build stage
FROM python:3.11-slim as builder

# Set build arguments
ARG BUILD_ENV=production
ARG POETRY_VERSION=1.6.1

# Set environment variables for build
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==$POETRY_VERSION

# Set work directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml ./
COPY requirements/ ./requirements/

# Configure Poetry
RUN poetry config virtualenvs.create false

# Install dependencies
RUN if [ "$BUILD_ENV" = "development" ]; then \
        poetry install --with dev; \
    else \
        poetry install --only main; \
    fi

# Production stage
FROM python:3.11-slim as production

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create directories and set permissions
RUN mkdir -p /app/logs /app/uploads /app/tmp && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/liveness || exit 1

# Expose port
EXPOSE 8000

# Set default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

# Development stage
FROM builder as development

# Install development dependencies
RUN poetry install --with dev

# Set environment for development
ENV ENVIRONMENT=development

# Create non-root user for development
RUN groupadd -r devuser && useradd -r -g devuser devuser

# Set work directory
WORKDIR /app

# Copy application code
COPY . .

# Set permissions for development
RUN chown -R devuser:devuser /app

# Switch to non-root user
USER devuser

# Expose port for development
EXPOSE 8000

# Development command with reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]