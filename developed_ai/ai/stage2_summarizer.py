import json
import os
from openai import OpenAI


class Stage2OutputError(RuntimeError):
    pass

def create_stage2_client():
    api_key = os.environ.get("NVIDIA_API_KEY")

    if not api_key:
        raise RuntimeError("NVIDIA_API_KEY is not configured.")

    return OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
        timeout=120.0,
        max_retries=1,
    )

CATEGORY_FIELDS = {
    "data_collection": [
        "what_data_is_collected",
        "how_it_is_collected",
        "when_collection_happens",
        "required_or_optional",
        "what_is_not_confirmed",
        "why_this_matters",
    ],

    "purpose_of_use": [
        "why_data_is_used",
        "data_and_purpose",
        "unspecified_purposes",
        "additional_uses",
        "why_this_matters",
    ],

    "data_sharing": [
        "who_data_may_be_shared_with",
        "why_sharing_may_happen",
        "named_organisations",
        "what_data_is_shared",
        "user_control",
        "why_this_matters",
    ],

    "data_retention": [
        "what_is_retained",
        "how_long_data_is_kept",
        "why_data_is_retained",
        "deletion_condition",
        "why_this_matters",
    ],

    "user_control": [
        "what_you_can_control",
        "how_to_use_these_controls",
        "access_and_correction",
        "deletion",
        "consent_or_opt_out",
        "limitations",
        "why_this_matters",
    ],
}

# standardise format
def format_evidence(evidence):
    blocks = []

    for i, item in enumerate(evidence, start=1):
        lines = [
            f"[Evidence {i} | segment_id={item['segment_id']}]"
        ]

        heading = item.get("heading")

        if heading:
            lines.append(f"Section: {heading}")

        lines.append(item["text"])
        blocks.append("\n".join(lines))

    return "\n\n".join(blocks)

def parse_stage2_response(response, category):
    try:
        result = json.loads(response)
    except json.JSONDecodeError as exc:
        raise Stage2OutputError(
            f"{category}: model output is not valid JSON."
        ) from exc

    if not isinstance(result, dict):
        raise Stage2OutputError(
            f"{category}: output must be a JSON object."
        )

    if set(result) != {"summary", "detailed_explanation"}:
        raise Stage2OutputError(
            f"{category}: unexpected top-level fields."
        )

    summary = result["summary"]

    # only apply when there is an evidence
    if not isinstance(summary, str) or not summary.strip():
        raise Stage2OutputError(
            f"{category}: summary must be a non-empty string."
        )

    details = result["detailed_explanation"]

    if not isinstance(details, dict):
        raise Stage2OutputError(
            f"{category}: detailed_explanation must be an object."
        )

    expected_fields = CATEGORY_FIELDS[category]

    if set(details) != set(expected_fields):
        raise Stage2OutputError(
            f"{category}: detailed fields do not match the schema."
        )

    for field in expected_fields:
        value = details[field]

        if value is not None and not isinstance(value, str):
            raise Stage2OutputError(
                f"{category}: {field} must be a string or null."
            )

    return {
        "summary": summary.strip(),
        "detailed_explanation": {
            field: details[field]
            for field in expected_fields
        },
    }

def build_stage2_prompt(category, evidence):

    fields = CATEGORY_FIELDS[category]

    evidence_text = format_evidence(evidence)

    detail_template = {
        field: (
            f"<Write the answer for {field} using only the evidence, "
            f"or return null if not supported>"
        )
        for field in fields
    }

    output_template = {
        "summary": (
            "<Write a concise 1-2 sentence user-friendly summary "
            "of the evidence. If evidence exists, do NOT return null.>"
        ),
        "detailed_explanation": detail_template
    }

    prompt = f"""
You are analysing a privacy policy for end users.

Category:
{category}

Use ONLY the evidence below.

STRICT RULES:

1. The summary is REQUIRED whenever relevant evidence is provided.
2. Write the summary in 1-2 concise sentences using simple English.
3. Do NOT return null for summary if the evidence contains information
   relevant to the category.
4. For detailed fields, return null ONLY when that specific information
   is not supported by the evidence.
5. Do not invent missing information.
6. Preserve conditions, exceptions, uncertainty, and negation.
7. "why_this_matters" may explain the practical significance for the user,
   but must not introduce new claims about the organisation.
8. Return valid JSON only.
9. Do not include Markdown or commentary outside the JSON.

IMPORTANT:
When a field is unsupported, output the JSON value null.
Do NOT write phrases such as:
- "Not specified"
- "Not mentioned"
- "No information available"
- "Unknown"

Evidence:

{evidence_text}

Return exactly this JSON structure:

{json.dumps(output_template, indent=2)}
"""

    return prompt.strip()

def generate_category_summary(
    category,
    evidence,
    client,
    max_new_tokens=700,
):
    if not evidence:
        return {
            "summary": None,
            "detailed_explanation": {
                field: None
                for field in CATEGORY_FIELDS[category]
            },
        }

    prompt = build_stage2_prompt(
        category=category,
        evidence=evidence,
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are a grounded privacy-policy summarisation "
                "assistant. Never add facts that are not supported "
                "by the supplied evidence. Return valid JSON only."
            ),
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]

    completion = client.chat.completions.create(
        model="meta/llama-3.3-70b-instruct",
        messages=messages,
        temperature=0,
        max_tokens=max_new_tokens,
    )

    if not completion.choices:
        raise Stage2OutputError(
            f"{category}: the API returned no choices."
        )

    choice = completion.choices[0]

    if choice.finish_reason == "length":
        raise Stage2OutputError(
            f"{category}: the output reached the token limit "
            "and may be incomplete."
        )

    response = choice.message.content

    if not response or not response.strip():
        raise Stage2OutputError(
            f"{category}: the API returned empty content."
        )

    return parse_stage2_response(
        response.strip(),
        category,
    )


def generate_all_summaries(ir, client):
    results = {}

    for category in CATEGORY_FIELDS:
        evidence = ir["categories"][category]["evidence"]

        results[category] = generate_category_summary(
            category=category,
            evidence=evidence,
            client=client,
        )

    return results