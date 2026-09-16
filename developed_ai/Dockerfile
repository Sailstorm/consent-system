# Build from the repository root (see docker-compose.yml: context: ., dockerfile:
# developed_ai/Dockerfile) because developed_ai/main.py uses relative imports
# (`from .config import ...`) and must be importable as the `developed_ai` package.
FROM python:3.12-slim

WORKDIR /app

COPY developed_ai/requirements.txt developed_ai/requirements.txt

# CPU-only torch build first: the default PyPI torch wheel bundles CUDA
# runtime libs that are dead weight (and much larger) on this CPU-only host.
# Installing it before requirements.txt lets pip see the version constraint
# there (torch>=2.5,<3) already satisfied and skip reinstalling from PyPI.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch \
 && pip install --no-cache-dir -r developed_ai/requirements.txt

COPY developed_ai developed_ai

EXPOSE 8000

CMD ["uvicorn", "developed_ai.main:app", "--host", "0.0.0.0", "--port", "8000"]
