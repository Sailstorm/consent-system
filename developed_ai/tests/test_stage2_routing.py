"""
Tests for Stage 2's key/model fallback on NVIDIA rate limits.

Run from the repository root (no network or torch needed):
    python -m pytest developed_ai/tests
"""

import httpx2  # what openai 3.x builds its errors from
import pytest
from openai import APITimeoutError, RateLimitError

from developed_ai.ai.stage2_summarizer import (
    STAGE2_MODELS,
    Stage2Client,
    create_stage2_client,
)


def rate_limit_error():
    request = httpx2.Request("POST", "https://integrate.api.nvidia.com/v1")
    return RateLimitError(
        "rate limited",
        response=httpx2.Response(429, request=request),
        body=None,
    )


class FakeClient:
    """Stands in for openai.OpenAI; records (key, model, max_retries)."""

    def __init__(self, name, calls, rate_limited_models=(), error=None):
        self.name = name
        self.calls = calls
        self.rate_limited_models = rate_limited_models
        self.error = error
        self.max_retries = 1
        self.chat = self
        self.completions = self

    def with_options(self, max_retries):
        clone = FakeClient(
            self.name,
            self.calls,
            self.rate_limited_models,
            self.error,
        )
        clone.max_retries = max_retries
        return clone

    def create(self, model, **kwargs):
        self.calls.append((self.name, model, self.max_retries))

        if self.error is not None:
            raise self.error

        if model in self.rate_limited_models:
            raise rate_limit_error()

        return f"{self.name}:{model}"


PRIMARY, FALLBACK = STAGE2_MODELS


def test_routes_try_primary_model_on_every_key_first():
    calls = []
    client = Stage2Client([
        FakeClient("key1", calls),
        FakeClient("key2", calls),
    ])

    assert [(c.name, m) for c, m in client.routes] == [
        ("key1", PRIMARY),
        ("key2", PRIMARY),
        ("key1", FALLBACK),
        ("key2", FALLBACK),
    ]


def test_first_route_answers_when_not_rate_limited():
    calls = []
    client = Stage2Client([FakeClient("key1", calls)])

    assert client.create_completion("data_sharing") == f"key1:{PRIMARY}"
    assert calls == [("key1", PRIMARY, 0)]


def test_rate_limit_moves_to_second_key():
    calls = []
    client = Stage2Client([
        FakeClient("key1", calls, rate_limited_models=STAGE2_MODELS),
        FakeClient("key2", calls),
    ])

    assert client.create_completion("data_sharing") == f"key2:{PRIMARY}"
    assert calls == [
        ("key1", PRIMARY, 0),
        ("key2", PRIMARY, 0),
    ]


def test_rate_limit_falls_back_to_second_model():
    calls = []
    client = Stage2Client([
        FakeClient("key1", calls, rate_limited_models=(PRIMARY,)),
    ])

    assert client.create_completion("data_sharing") == f"key1:{FALLBACK}"
    # The last route keeps the client's own retry setting.
    assert calls == [
        ("key1", PRIMARY, 0),
        ("key1", FALLBACK, 1),
    ]


def test_rate_limit_on_every_route_is_raised():
    calls = []
    client = Stage2Client([
        FakeClient("key1", calls, rate_limited_models=STAGE2_MODELS),
    ])

    with pytest.raises(RateLimitError):
        client.create_completion("data_sharing")

    assert len(calls) == len(STAGE2_MODELS)


def test_other_errors_are_not_retried_on_another_route():
    calls = []
    timeout = APITimeoutError(
        request=httpx2.Request("POST", "https://integrate.api.nvidia.com/v1")
    )
    client = Stage2Client([
        FakeClient("key1", calls, error=timeout),
        FakeClient("key2", calls),
    ])

    with pytest.raises(APITimeoutError):
        client.create_completion("data_sharing")

    assert calls == [("key1", PRIMARY, 0)]


def test_second_key_is_optional(monkeypatch):
    monkeypatch.setenv("NVIDIA_API_KEY", "first")
    monkeypatch.delenv("NVIDIA_API_KEY_2", raising=False)
    assert len(create_stage2_client().routes) == len(STAGE2_MODELS)

    # docker compose passes an unset variable through as "".
    monkeypatch.setenv("NVIDIA_API_KEY_2", "")
    assert len(create_stage2_client().routes) == len(STAGE2_MODELS)

    monkeypatch.setenv("NVIDIA_API_KEY_2", "second")
    keys = [client.api_key for client, _ in create_stage2_client().routes]
    assert keys == ["first", "second"] * len(STAGE2_MODELS)


def test_first_key_is_required(monkeypatch):
    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)

    with pytest.raises(RuntimeError):
        create_stage2_client()
