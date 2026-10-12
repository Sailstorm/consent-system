import logging
import re
import time
import uuid

from .input_guard import segment_policy_with_guard
from .stage1_classifier import predict_segments
from .intermediate_representation import (
    build_intermediate_representation,
)
from .stage2_summarizer import generate_all_summaries



logger = logging.getLogger("uvicorn.error")

_WHITESPACE = re.compile(r"\s+")


def _collapse(text):
    return _WHITESPACE.sub(" ", text).strip()


def _drop_evidence_not_in_policy(ir, policy_text, policy_id):
    source = _collapse(policy_text)

    for category, entry in ir["categories"].items():
        kept = [
            item for item in entry["evidence"]
            if _collapse(item["text"]) in source
        ]

        dropped = len(entry["evidence"]) - len(kept)
        if dropped:
            logger.warning(
                "[%s] %s: dropped %d evidence item(s) not found verbatim "
                "in the submitted text.",
                policy_id,
                category,
                dropped,
            )

        entry["evidence"] = kept


def analyze_policy(
    policy_text,
    stage1_model,
    stage1_tokenizer,
    stage2_client,
    thresholds,
):
    policy_id = str(uuid.uuid4())
    started_at = time.perf_counter()

    logger.info("[%s] Analysis started.", policy_id)

    # 1. segment
    segments, input_warnings = segment_policy_with_guard(
    policy_text,
    tokenizer=stage1_tokenizer,
)

    if input_warnings:
        logger.warning(
            "[%s] Input guard flagged %d segment(s).",
            policy_id,
            sum(
                bool(segment.get("instruction_like"))
                for segment in segments
            ),
        )

    if not segments:
        raise ValueError(
            "The policy produced no usable segments."
        )

    logger.info(
        "[%s] Segmentation complete: %d segments.",
        policy_id,
        len(segments),
    )

    # 2. use fine-tuned DeBERTa to classify
    stage1_started_at = time.perf_counter()

    segment_predictions = predict_segments(
        segments=segments,
        model=stage1_model,
        tokenizer=stage1_tokenizer,
    )
    
    logger.info(
        "[%s] Stage 1 complete in %.2f seconds.",
        policy_id,
        time.perf_counter() - stage1_started_at,
    )

    # 3. format output 
    ir = build_intermediate_representation(
        policy_id=policy_id,
        segment_predictions=segment_predictions,
        thresholds=thresholds,
    )

    
    # Every excerpt shown to the user as "source text" must be a literal
    # part of what they submitted (security plan M-02, KPI "output
    # grounding"). Evidence comes from our own segmenter, so a mismatch
    # means a bug, and the excerpt is dropped rather than shown.
    _drop_evidence_not_in_policy(ir, policy_text, policy_id)

    # 4. ues NVIDIA API to generate summary
    stage2_started_at = time.perf_counter()

    logger.info(
        "[%s] Stage 2 API summarisation started.",
        policy_id,
    )

    summaries = generate_all_summaries(
        ir=ir,
        client=stage2_client,
    )

    logger.info(
        "[%s] Stage 2 complete in %.2f seconds.",
        policy_id,
        time.perf_counter() - stage2_started_at,
    )

    logger.info(
        "[%s] Analysis complete in %.2f seconds.",
        policy_id,
        time.perf_counter() - started_at,
    )

    results = {
        category: {
            **summary,
            "evidence": ir["categories"][category]["evidence"],
        }
        for category, summary in summaries.items()
    }

    return {
    "policy_id": policy_id,
    "results": results,
    "warnings": input_warnings,
    }