from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

import os

from .config import (
    STAGE1_LOCAL_DIR,
    STAGE1_MODEL_ID,
    STAGE1_MODEL_REVISION,
    STAGE1_THRESHOLDS,
)
from .limits import (
    ANALYSES_PER_HOUR,
    ANALYSES_PER_MINUTE,
    MAX_CONCURRENT_ANALYSES,
    AnalysisLimiter,
    AnalysisLimitMiddleware,
)
from .ai.text_safety import normalise_policy_text
from .ai.pipeline import analyze_policy
from .ai.stage1_classifier import load_stage1_model
from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    RateLimitError,
)

from .ai.stage2_summarizer import (
    create_stage2_client,
    Stage2OutputError,
)

import logging

from .ai.url_extractor import (
    PolicyExtractionError,
    extract_policy_from_url,
)

from .ai.pdf_extractor import (
    MAX_PDF_BYTES,
    PdfExtractionError,
    extract_policy_from_pdf_isolated,
)

logger = logging.getLogger("uvicorn.error")


app = FastAPI(
    # No interactive API docs on a public, unauthenticated-by-default service.
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# Production is same-origin through Caddy; CORS only matters for local
# development, where the Vite dev server calls this service directly.
# No credentials are ever needed (security plan A-03).
cors_origins = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGIN",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.add_middleware(
    AnalysisLimitMiddleware,
    limiter=AnalysisLimiter(
        per_minute=ANALYSES_PER_MINUTE,
        per_hour=ANALYSES_PER_HOUR,
        max_concurrent=MAX_CONCURRENT_ANALYSES,
    ),
)

stage1_model, stage1_tokenizer = load_stage1_model(
    STAGE1_MODEL_ID,
    revision=STAGE1_MODEL_REVISION,
    local_dir=STAGE1_LOCAL_DIR,
)

stage2_client = create_stage2_client()


class PolicyRequest(BaseModel):
    text: str = Field(max_length=100_000)

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        # Strip invisible characters and fold lookalike letters before
        # anything else sees the text (security plan M-03).
        value = normalise_policy_text(value).strip()

        if not value:
            raise ValueError("Policy text must not be empty.")

        return value


@app.post("/analyze")
def analyze(request: PolicyRequest):
    try:
        return analyze_policy(
            policy_text=request.text,
            stage1_model=stage1_model,
            stage1_tokenizer=stage1_tokenizer,
            stage2_client=stage2_client,
            thresholds=STAGE1_THRESHOLDS,
        )

    except Stage2OutputError as exc:
        logger.exception("Stage 2 returned invalid output.")
        raise HTTPException(
            status_code=502,
            detail="The summarisation service returned invalid output.",
        ) from exc

    except APITimeoutError as exc:
        logger.exception("NVIDIA API request timed out.")
        raise HTTPException(
            status_code=504,
            detail="The summarisation service timed out.",
        ) from exc

    except RateLimitError as exc:
        logger.exception("NVIDIA API rate limit or quota reached.")
        raise HTTPException(
            status_code=503,
            detail=(
                "The summarisation service is currently limited "
                "by its request rate or quota."
            ),
        ) from exc

    except APIConnectionError as exc:
        logger.exception("Could not connect to NVIDIA API.")
        raise HTTPException(
            status_code=503,
            detail="Could not connect to the summarisation service.",
        ) from exc

    except APIStatusError as exc:
        logger.exception(
            "NVIDIA API returned HTTP %s.",
            exc.status_code,
        )
        raise HTTPException(
            status_code=502,
            detail=(
                "The summarisation service rejected the request. "
                "Check the server logs for details."
            ),
        ) from exc



class PolicyUrlRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)

    @field_validator("url")
    @classmethod
    def validate_url_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Policy URL must not be empty.")

        return value


@app.post("/analyze-url")
def analyze_url(request: PolicyUrlRequest):
    logger.info("Policy URL extraction started.")

    try:
        extracted = extract_policy_from_url(request.url)
    except PolicyExtractionError as exc:
        logger.warning(
            "Policy URL extraction failed: status=%d",
            exc.status_code,
        )
        raise HTTPException(
            status_code=exc.status_code,
            detail=str(exc),
        ) from exc

    # Reuse the existing analysis function and its exception handling.
    policy = PolicyRequest(text=extracted["text"])
    result = analyze(policy)

    return {
        **result,
        "policy_text": policy.text,
        "source": {
            "type": "url",
            "submitted_url": extracted["source_url"],
            "final_url": extracted["final_url"],
            "character_count": extracted["character_count"],
            "extraction_seconds": extracted["extraction_seconds"],
        },
    }

@app.post("/analyze-pdf")
def analyze_pdf(file: UploadFile = File(...)):
    # Only use the basename as display metadata.
    # Never use the uploaded filename as a filesystem path.
    filename = (
        (file.filename or "uploaded.pdf")
        .replace("\\", "/")
        .rsplit("/", 1)[-1]
    )

    filename = "".join(
        character
        for character in filename
        if character.isprintable()
    )[:200] or "uploaded.pdf"

    logger.info("PDF extraction started.")

    try:
        try:
            # Read at most the configured limit plus one byte.
            pdf_bytes = file.file.read(MAX_PDF_BYTES + 1)
        except OSError as exc:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file could not be read.",
            ) from exc

        if len(pdf_bytes) > MAX_PDF_BYTES:
            raise HTTPException(
                status_code=413,
                detail="The PDF exceeds the 10 MiB file size limit.",
            )

        try:
            extracted = extract_policy_from_pdf_isolated(pdf_bytes)
        except PdfExtractionError as exc:
            logger.warning(
                "PDF extraction failed: status=%d",
                exc.status_code,
            )
            raise HTTPException(
                status_code=exc.status_code,
                detail=str(exc),
            ) from exc

    finally:
        # Close the upload's temporary file on success or failure.
        file.file.close()

    # Reuse the existing pipeline and NVIDIA error handling.
    policy = PolicyRequest(text=extracted["text"])
    result = analyze(policy)

    return {
        **result,
        "policy_text": policy.text,
        "source": {
            "type": "pdf",
            "filename": filename,
            "page_count": extracted["page_count"],
            "character_count": extracted["character_count"],
            "extraction_seconds": extracted["extraction_seconds"],
        },
    }