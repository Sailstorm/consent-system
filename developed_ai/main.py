from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from .config import STAGE1_THRESHOLDS
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

logger = logging.getLogger("uvicorn.error")


STAGE1_MODEL_ID = "Meiyao-AI-25379/consent-assistant-deberta-stage1"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stage1_model, stage1_tokenizer = load_stage1_model(
    STAGE1_MODEL_ID
)

stage2_client = create_stage2_client()


class PolicyRequest(BaseModel):
    text: str = Field(max_length=100_000)

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()

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
    result = analyze(
        PolicyRequest(text=extracted["text"])
    )

    return {
        **result,
        "source": {
            "type": "url",
            "submitted_url": extracted["source_url"],
            "final_url": extracted["final_url"],
            "character_count": extracted["character_count"],
            "extraction_seconds": extracted["extraction_seconds"],
        },
    }