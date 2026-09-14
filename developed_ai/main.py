from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator

from .config import STAGE1_THRESHOLDS
from .ai.pipeline import analyze_policy
from .ai.stage1_classifier import load_stage1_model
from .ai.stage2_summarizer import (
    load_stage2_model,
    Stage2InputTooLongError,
    Stage2OutputError,
)


STAGE1_MODEL_ID = "Meiyao-AI-25379/consent-assistant-deberta-stage1"

app = FastAPI()

stage1_model, stage1_tokenizer = load_stage1_model(
    STAGE1_MODEL_ID
)

stage2_model, stage2_tokenizer = load_stage2_model(
    "Qwen/Qwen2.5-3B-Instruct"
)


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
            stage2_model=stage2_model,
            stage2_tokenizer=stage2_tokenizer,
            thresholds=STAGE1_THRESHOLDS,
        )
    except Stage2InputTooLongError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    except Stage2OutputError as exc:
        raise HTTPException(
            status_code=500,
            detail="The model could not produce a valid summary.",
        ) from exc