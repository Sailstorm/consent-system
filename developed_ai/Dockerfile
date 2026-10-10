# Build from the repository root (see docker-compose.yml: context: ., dockerfile:
# developed_ai/Dockerfile) because developed_ai/main.py uses relative imports
# (`from .config import ...`) and must be importable as the `developed_ai` package.
FROM python:3.12-slim

# Unprivileged runtime user (security plan N-02). Created up front so the
# model directory below can be owned by it.
RUN useradd --create-home --uid 10001 app

WORKDIR /app

COPY developed_ai/requirements.txt developed_ai/requirements.txt

# Install torch from the CPU-only wheel index as its own step, with
# --index-url (not --extra-index-url): this makes pip see *only* that
# index for this command, so there's no ambiguity about whether it might
# resolve the default PyPI build (which bundles CUDA runtime libs that
# are dead weight, and a much bigger/slower download, on this GPU-less
# host). requirements.txt's own --extra-index-url line is then redundant
# here (torch>=2.5,<3 is already satisfied) but still helps a bare
# `pip install -r requirements.txt` outside Docker.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch \
 && pip install --no-cache-dir -r developed_ai/requirements.txt

# Download the pinned Stage 1 model once, at build time, and fail the build
# if the weights' SHA-256 doesn't match (security plan M-07). Copied before
# the rest of the code so code changes don't re-download 700 MB.
COPY developed_ai/config.py developed_ai/config.py
COPY developed_ai/scripts developed_ai/scripts
RUN python developed_ai/scripts/fetch_stage1_model.py \
 && chown -R app:app /app/models

COPY developed_ai developed_ai

# The model is already on disk: never contact Hugging Face at runtime (M-08).
ENV HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1 \
    PYTHONDONTWRITEBYTECODE=1

USER app

EXPOSE 8000

CMD ["uvicorn", "developed_ai.main:app", "--host", "0.0.0.0", "--port", "8000"]
