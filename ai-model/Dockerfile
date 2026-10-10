# Retired service (README: no longer built or deployed). Kept non-root so
# it isn't a hazard if anyone does build it (security plan N-02).
FROM python:3.12-slim

RUN useradd --create-home --uid 10001 app

WORKDIR /app

COPY requirement.txt ./
RUN pip install --no-cache-dir -r requirement.txt

COPY . .

USER app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
