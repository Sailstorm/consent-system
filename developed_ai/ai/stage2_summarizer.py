import torch
import json
from transformers import AutoTokenizer, AutoModelForCausalLM

STAGE2_CONTEXT_LIMIT = 8192
STAGE2_SAFETY_MARGIN = 64

class Stage2InputTooLongError(ValueError):
    pass


class Stage2OutputError(RuntimeError):
    pass

def load_stage2_model(model_name):
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True,
    )

    model.eval()

    return model, tokenizer

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
    model,
    tokenizer,
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
                "by the supplied evidence."
            ),
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]

    formatted_prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    
    inputs = tokenizer(
        formatted_prompt,
        return_tensors="pt",
        add_special_tokens=False,
        truncation=False,
    )

    context_limit = STAGE2_CONTEXT_LIMIT


    model_limit = getattr(
        model.config,
        "max_position_embeddings",
        None,
    )

    if isinstance(model_limit, int) and model_limit > 0:
        context_limit = min(context_limit, model_limit)

    tokenizer_limit = getattr(
        tokenizer,
        "model_max_length",
        None,
    )

    if isinstance(tokenizer_limit, int) and tokenizer_limit > 0:
        context_limit = min(context_limit, tokenizer_limit)

    input_budget = (
        context_limit
        - max_new_tokens
        - STAGE2_SAFETY_MARGIN
    )

    if input_budget <= 0:
        raise RuntimeError(
            "Stage 2 context configuration leaves no input budget."
        )

    input_length = inputs["input_ids"].shape[1]

    if input_length > input_budget:
        raise Stage2InputTooLongError(
            f"Evidence for '{category}' is too long: "
            f"{input_length} input tokens; "
            f"the current limit is {input_budget}. "
            "Please submit a shorter policy."
        )

    inputs = inputs.to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id,
        )

    generated_tokens = outputs[
        0,
        inputs["input_ids"].shape[1]:,
    ]

    response = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True,
    ).strip()

    return parse_stage2_response(response, category)

def generate_all_summaries(ir, model, tokenizer):

    results = {}

    for category in CATEGORY_FIELDS:

        evidence = (
            ir["categories"]
            [category]
            ["evidence"]
        )

        results[category] = (
            generate_category_summary(
                category=category,
                evidence=evidence,
                model=model,
                tokenizer=tokenizer
            )
        )

    return results