import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_service import analyze_policy

app = FastAPI()

allowed_origins = os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PolicyRequest(BaseModel):
    policy_text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze(request: PolicyRequest):

    output = analyze_policy(
        request.policy_text
    )

    return {
        "output": output
    }
