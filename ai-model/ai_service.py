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

CATEGORIES = [
    "data_collection",
    "purpose_of_use",
    "data_sharing",
    "data_retention",
    "user_control"
]

# analyze each catagory
def analyze_category(policy_text, category):

    prompt = build_prompt(policy_text, category)

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

    return json.loads(raw_output)



# integrate 5 catagories' ouput
def analyze_policy(policy_text):

    output = {}

    for category in CATEGORIES:
        output[category] = analyze_category(
            policy_text,
            category
        )

    return output


    return result["summaries"]
