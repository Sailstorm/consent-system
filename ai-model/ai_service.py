import os
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from groq import Groq

from prompt import build_prompt


# -------------------------
# Environment Configuration
# -------------------------

load_dotenv()


# -------------------------
# Groq API Configuration
# -------------------------

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# -------------------------
# Model Configuration
# -------------------------

GENERATION_MODEL = "qwen/qwen3.8-27b"


# -------------------------
# AI Generation
# -------------------------

CATEGORIES = [
    "data_collection",
    "purpose_of_use",
    "data_sharing",
    "data_retention",
    "user_control"
]

MAX_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 2


def _strip_markdown_fence(raw_output):
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", raw_output, re.DOTALL)
    return match.group(1) if match else raw_output


# analyze each catagory, retrying on transient failures (rate limits, bad JSON, etc.)
def analyze_category(policy_text, category):

    prompt = build_prompt(policy_text, category)

    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.chat.completions.create(
                model=GENERATION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1500
            )

            raw_output = response.choices[0].message.content
            return json.loads(_strip_markdown_fence(raw_output))
        except Exception as error:
            last_error = error
            if attempt < MAX_ATTEMPTS:
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)

    raise last_error


# integrate 5 catagories' output, run concurrently so one slow/failed
# category doesn't sink the other four or multiply the total latency
def analyze_policy(policy_text):

    output = {}

    with ThreadPoolExecutor(max_workers=len(CATEGORIES)) as executor:
        futures = {
            executor.submit(analyze_category, policy_text, category): category
            for category in CATEGORIES
        }

        for future, category in futures.items():
            try:
                output[category] = future.result()
            except Exception:
                output[category] = {
                    "status": "unavailable",
                    "summary": "This category could not be analysed due to a temporary error. Please retry.",
                }

    return output
