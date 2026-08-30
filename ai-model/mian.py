from fastapi import FastAPI
from pydantic import BaseModel

from ai_service import generate_summary

app = FastAPI()


class PolicyRequest(BaseModel):
    policy_text: str


@app.post("/summarize")
def summarize(request: PolicyRequest):

    summaries = generate_summary(
        request.policy_text
    )

    return {
        "summaries": summaries
    }
