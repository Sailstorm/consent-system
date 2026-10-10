"""
Download the pinned Stage 1 model at image build time and verify it.

Run by developed_ai/Dockerfile. Fails the build if the weights' SHA-256
doesn't match config.STAGE1_WEIGHTS_SHA256, so a tampered or changed file
can never reach a running container.
"""

import hashlib
import os
import sys

from huggingface_hub import snapshot_download

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (  # noqa: E402
    STAGE1_LOCAL_DIR,
    STAGE1_MODEL_ID,
    STAGE1_MODEL_REVISION,
    STAGE1_WEIGHTS_SHA256,
)


def sha256_of(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    snapshot_download(
        repo_id=STAGE1_MODEL_ID,
        revision=STAGE1_MODEL_REVISION,
        local_dir=STAGE1_LOCAL_DIR,
        allow_patterns=[
            "config.json",
            "model.safetensors",
            "tokenizer.json",
            "tokenizer_config.json",
        ],
    )

    weights = os.path.join(STAGE1_LOCAL_DIR, "model.safetensors")
    actual = sha256_of(weights)

    if actual != STAGE1_WEIGHTS_SHA256:
        sys.exit(
            f"Stage 1 weights checksum mismatch: expected "
            f"{STAGE1_WEIGHTS_SHA256}, got {actual}"
        )

    print(f"Stage 1 model {STAGE1_MODEL_REVISION[:12]} verified ({actual[:12]}).")


if __name__ == "__main__":
    main()
