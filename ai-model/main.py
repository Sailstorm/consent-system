from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_service import generate_summary

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


@app.post("/summarize")
def summarize(request: PolicyRequest):

    summaries = generate_summary(
        request.policy_text
    )

    return {
        "summaries": summaries
    }