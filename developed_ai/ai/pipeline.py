import logging
import time
import uuid

from .segmenter import segment_policy
from .stage1_classifier import predict_segments
from .intermediate_representation import (
    build_intermediate_representation,
)
from .stage2_summarizer import generate_all_summaries


logger = logging.getLogger("uvicorn.error")


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
    segments = segment_policy(
        policy_text,
        tokenizer=stage1_tokenizer,
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

    return {
        "policy_id": policy_id,
        "results": summaries,
    }