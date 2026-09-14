import uuid

from .segmenter import segment_policy
from .stage1_classifier import predict_segments
from .intermediate_representation import (
    build_intermediate_representation
)
from .stage2_summarizer import (
    generate_all_summaries
)


def analyze_policy(
    policy_text,
    stage1_model,
    stage1_tokenizer,
    stage2_model,
    stage2_tokenizer,
    thresholds
):

    policy_id = str(uuid.uuid4())

    # -----------------------------
    # 1. Segmentation
    # -----------------------------

    segments = segment_policy(
    policy_text,
    tokenizer=stage1_tokenizer,
    )

    if not segments:
        raise ValueError(
            "The non-empty policy produced no usable segments."
        )

    # -----------------------------
    # 2. Stage 1
    # -----------------------------

    segment_predictions = predict_segments(
        segments=segments,
        model=stage1_model,
        tokenizer=stage1_tokenizer
    )

    # -----------------------------
    # 3. IR
    # -----------------------------

    ir = build_intermediate_representation(
        policy_id=policy_id,
        segment_predictions=segment_predictions,
        thresholds=thresholds
    )

    # -----------------------------
    # 4. Stage 2
    # -----------------------------

    summaries = generate_all_summaries(
        ir=ir,
        model=stage2_model,
        tokenizer=stage2_tokenizer
    )

    return {
        "policy_id": policy_id,
        "results": summaries
    }