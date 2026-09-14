import json
from typing import List, Dict, Any

CATEGORIES = [
    "data_collection",
    "purpose_of_use",
    "data_sharing",
    "data_retention",
    "user_control",
]

DEFAULT_THRESHOLDS = {
    "data_collection": 0.10,
    "purpose_of_use": 0.10,
    "data_sharing": 0.10,
    "data_retention": 0.10,
    "user_control": 0.10,
}

def build_intermediate_representation(
    policy_id: str,
    segment_predictions: List[Dict[str, Any]],
    thresholds: Dict[str, float] = None,
) -> Dict[str, Any]:
    """
    Convert Stage 1 segment-level predictions into
    category-wise evidence groups.

    Expected segment_predictions format:

    [
        {
            "segment_id": "1",
            "text": "...",
            "probabilities": {
                "data_collection": 0.91,
                "purpose_of_use": 0.23,
                "data_sharing": 0.07,
                "data_retention": 0.05,
                "user_control": 0.03
            }
        },
        ...
    ]
    """

    if thresholds is None:
        thresholds = DEFAULT_THRESHOLDS

    # --------------------------------------------------------
    # Create empty IR
    # --------------------------------------------------------

    ir = {
        "policy_id": policy_id,
        "categories": {
            category: {
                "evidence": []
            }
            for category in CATEGORIES
        }
    }

    # --------------------------------------------------------
    # Process every segment
    # --------------------------------------------------------

    for segment in segment_predictions:

        segment_id = segment.get("segment_id")
        text = (segment.get("text") or "").strip()
        probabilities = segment.get("probabilities", {})

        if not text:
            continue

        # A single segment may belong to multiple categories.
        for category in CATEGORIES:

            probability = float(
                probabilities.get(category, 0.0)
            )

            threshold = float(
                thresholds[category]
            )

            if probability >= threshold:

                ir["categories"][category]["evidence"].append({
                    "segment_id": segment_id,
                    "heading": segment.get("heading"),
                    "text": text,
                    "confidence": probability,
                })

    return ir

def sort_ir_evidence_by_segment_id(ir):

    for category in CATEGORIES:

        evidence = (
            ir["categories"]
            [category]
            ["evidence"]
        )

        evidence.sort(
            key=lambda x: int(x["segment_id"])
        )

    return ir

def add_ir_metadata(ir):

    for category in CATEGORIES:

        evidence = (
            ir["categories"]
            [category]
            ["evidence"]
        )

        confidences = [
            item["confidence"]
            for item in evidence
        ]

        ir["categories"][category]["metadata"] = {
            "evidence_count": len(evidence),

            "max_confidence": (
                max(confidences)
                if confidences
                else None
            ),

            "mean_confidence": (
                sum(confidences) / len(confidences)
                if confidences
                else None
            )
        }

    return ir