STAGE1_THRESHOLDS = {
    "data_collection": 0.10,
    "purpose_of_use": 0.10,
    "data_sharing": 0.10,
    "data_retention": 0.10,
    "user_control": 0.10,
}

# Stage 1 model, pinned to an exact Hugging Face commit (security plan M-07)
# so an upstream change or a compromised repo can't silently swap the
# classifier. The Docker build downloads this revision once, checks the
# weights' SHA-256, and bakes it into the image (scripts/fetch_stage1_model.py),
# so the running service never contacts Hugging Face (M-08).
# To upgrade: update all three values together, then rebuild.
STAGE1_MODEL_ID = "Meiyao-AI-25379/consent-assistant-deberta-stage1"
STAGE1_MODEL_REVISION = "1d831496dd96ebda1589a203b00794da0f2f9e15"
STAGE1_WEIGHTS_SHA256 = (
    "b8ec3c38514f4c65002794ae19e64874097ba05410818092517469c30a182d5a"
)

# Where the Docker build places the verified model. Local development
# without that directory falls back to downloading the pinned revision.
STAGE1_LOCAL_DIR = "/app/models/stage1"
