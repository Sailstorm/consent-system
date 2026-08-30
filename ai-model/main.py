from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_service import analyze_policy

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PolicyRequest(BaseModel):
    policy_text: str


@app.post("/analyze")
def analyze(request: PolicyRequest):

    output = analyze_policy(
        request.policy_text
    )

    return {
        "output": output
    }
