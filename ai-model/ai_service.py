import os
import json
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

def analyze_policy(policy_text):

    prompt = build_prompt(policy_text)

    response = client.chat.completions.create(
        model=GENERATION_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    raw_output = response.choices[0].message.content

    result = json.loads(raw_output)

    return result


    return result["summaries"]
