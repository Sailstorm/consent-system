import os

import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification
)

CATEGORIES = [
    "data_collection",
    "purpose_of_use",
    "data_sharing",
    "data_retention",
    "user_control"
]

def load_stage1_model(model_path, revision=None, local_dir=None):
    """
    Prefer the verified copy baked into the image (local_dir), loaded with
    local_files_only so a missing file fails loudly instead of quietly
    fetching from the Hub. Otherwise download the pinned revision.
    """

    if local_dir and os.path.isdir(local_dir):
        source = {"pretrained_model_name_or_path": local_dir, "local_files_only": True}
    else:
        if not revision:
            raise ValueError("A pinned model revision is required.")
        source = {"pretrained_model_name_or_path": model_path, "revision": revision}

    tokenizer = AutoTokenizer.from_pretrained(**source)

    model = AutoModelForSequenceClassification.from_pretrained(**source)

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    model.to(device)
    model.eval()

    return model, tokenizer

def predict_segments(
    segments,
    model,
    tokenizer,
    max_length=384
):
    """
    Run Stage 1 DeBERTa inference on all segments.

    Input:
        segments = [
            {
                "segment_id": "...",
                "text": "..."
            },
            ...
        ]

    Output:
        segment_predictions = [
            {
                "segment_id": "...",
                "text": "...",
                "probabilities": {
                    "data_collection": ...,
                    ...
                }
            },
            ...
        ]
    """

    model.eval()

    device = next(model.parameters()).device

    segment_predictions = []

    for segment in segments:

        text = segment["text"]

        # ---------------------------------------------
        # Tokenize
        # ---------------------------------------------
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=max_length
        )

        inputs = {
            key: value.to(device)
            for key, value in inputs.items()
        }

        # ---------------------------------------------
        # DeBERTa inference
        # ---------------------------------------------
        with torch.no_grad():

            outputs = model(**inputs)

            logits = outputs.logits

            probabilities = torch.sigmoid(
                logits
            )[0].cpu().numpy()

        # ---------------------------------------------
        # Convert to dictionary
        # ---------------------------------------------
        probability_dict = {
            category: float(probabilities[i])
            for i, category in enumerate(CATEGORIES)
        }

        segment_predictions.append({
            "segment_id": segment["segment_id"],
            "heading": segment.get("heading"),
            "text": segment["text"],
            "probabilities": probability_dict,
        })

    return segment_predictions