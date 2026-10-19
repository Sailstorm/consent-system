"""
Tests for the Iteration 3 security controls in developed_ai.

Run from the repository root (torch is not needed for these):
    python -m pytest developed_ai/tests
"""

import io

import pytest
from pypdf import PdfWriter

from developed_ai.ai.grounding import enforce_grounding, unsupported_reason
from developed_ai.ai.pdf_extractor import (
    PdfExtractionError,
    extract_policy_from_pdf_isolated,
)
from developed_ai.ai.text_safety import normalise_policy_text
from developed_ai.limits import AnalysisLimiter


class Rejected(Exception):
    pass


EVIDENCE = [
    {
        "segment_id": "1",
        "heading": "Retention",
        "text": "We keep your account information for seven years after closure.",
    },
    {
        "segment_id": "2",
        "heading": "Sharing",
        "text": "We share payment data with Stripe and our cloud provider in Australia.",
    },
]


# --- M-03: input normalisation ---------------------------------------

def test_invisible_characters_are_removed():
    assert normalise_policy_text("we sha​re your d‍ata‮") == "we share your data"


def test_cyrillic_lookalikes_fold_in_english_text():
    # "ѕhаrе" spelled with Cyrillic ѕ, а and е.
    text = "We may ѕhаrе your data with partners for advertising."
    assert normalise_policy_text(text) == "We may share your data with partners for advertising."


def test_genuine_non_latin_text_is_kept():
    text = "Политика конфиденциальности описывает обработку данных."
    assert normalise_policy_text(text) == text


def test_full_width_letters_are_normalised():
    assert normalise_policy_text("ｓｈａｒｅ") == "share"


# --- M-02: grounding ---------------------------------------------------

def test_supported_paraphrase_passes():
    evidence = " ".join(item["text"] for item in EVIDENCE)
    assert unsupported_reason("Account information is kept for 7 years after closure.", evidence) is None


@pytest.mark.parametrize("claim", [
    "Account information is kept for 10 years.",
    "Payment data is shared with Google.",
    "Biometric fingerprints are sold to advertising networks worldwide.",
])
def test_unsupported_claims_are_caught(claim):
    evidence = " ".join(item["text"] for item in EVIDENCE)
    assert unsupported_reason(claim, evidence) is not None


def test_unsupported_detail_field_is_removed_not_shown():
    result = {
        "summary": "Account information is kept for seven years.",
        "detailed_explanation": {
            "how_long_data_is_kept": "Seven years after the account closes.",
            "deletion_condition": "Data is deleted after 90 days on request.",
            "why_this_matters": "Long retention increases exposure.",
        },
    }
    enforce_grounding(result, EVIDENCE, "data_retention", Rejected)
    assert result["detailed_explanation"]["how_long_data_is_kept"] is not None
    assert result["detailed_explanation"]["deletion_condition"] is None


def test_unsupported_summary_is_rejected_for_retry():
    result = {
        "summary": "Data is kept for 25 years and shared with Meta.",
        "detailed_explanation": {"how_long_data_is_kept": "Seven years after closure."},
    }
    with pytest.raises(Rejected):
        enforce_grounding(result, EVIDENCE, "data_retention", Rejected)


def test_null_summary_is_left_alone():
    result = {"summary": None, "detailed_explanation": {"a": None}}
    assert enforce_grounding(result, EVIDENCE, "user_control", Rejected) is result


@pytest.mark.parametrize("claim, evidence", [
    ("Device IDs are collected.", "We collect your device ID and IP address."),
    ("Data is gathered from smart TVs.", "Viewing data is gathered from your smart TV."),
])
def test_pluralised_acronym_matches_singular_in_evidence(claim, evidence):
    assert unsupported_reason(claim, evidence) is None


def test_pluralised_acronym_must_match_a_whole_word():
    # "id" occurs inside "provide" but the evidence never mentions an ID.
    evidence = "We provide the service and collect your email address."
    assert unsupported_reason("Device IDs are collected.", evidence) is not None


# --- A-01 / A-06: rate limits ------------------------------------------

def test_limiter_enforces_minute_and_hour_windows():
    now = [0.0]
    limiter = AnalysisLimiter(per_minute=2, per_hour=3, max_concurrent=1, clock=lambda: now[0])

    assert limiter.retry_after("a") == 0
    assert limiter.retry_after("a") == 0
    assert limiter.retry_after("a") > 0          # third in the same minute
    assert limiter.retry_after("b") == 0          # other clients unaffected

    now[0] = 61
    assert limiter.retry_after("a") == 0          # new minute, third this hour
    now[0] = 130
    assert limiter.retry_after("a") > 0           # fourth this hour

    now[0] = 3700
    assert limiter.retry_after("a") == 0          # hour window has passed


def test_concurrency_slots_are_bounded():
    limiter = AnalysisLimiter(per_minute=10, per_hour=10, max_concurrent=1)
    assert limiter.slots.acquire(blocking=False)
    assert not limiter.slots.acquire(blocking=False)
    limiter.slots.release()


# --- A-07: isolated PDF parsing -----------------------------------------

def _blank_pdf(pages=1):
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def test_isolated_parser_rejects_non_pdf():
    with pytest.raises(PdfExtractionError) as error:
        extract_policy_from_pdf_isolated(b"not a pdf at all")
    assert error.value.status_code == 415


def _text_pdf(lines):
    """Build a minimal one-page PDF whose content stream draws lines of text."""
    content = "BT /F1 11 Tf 40 760 Td 14 TL " + " ".join(
        f"({line}) Tj T*" for line in lines
    ) + " ET"
    objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        f"<< /Length {len(content)} >>\nstream\n{content}\nendstream",
    ]
    out = io.BytesIO()
    out.write(b"%PDF-1.4\n")
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(out.tell())
        out.write(f"{number} 0 obj\n{body}\nendobj\n".encode())
    xref = out.tell()
    out.write(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
    for offset in offsets:
        out.write(f"{offset:010d} 00000 n \n".encode())
    out.write(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref}\n%%EOF\n".encode()
    )
    return out.getvalue()


def test_isolated_parser_returns_text_from_a_real_pdf():
    lines = [
        "We collect your name and email address when you register.",
        "We share payment data with Stripe to process transactions.",
        "We keep account records for seven years after closure.",
    ]
    result = extract_policy_from_pdf_isolated(_text_pdf(lines))
    assert result["page_count"] == 1
    for line in lines:
        assert line in " ".join(result["text"].split())


def test_isolated_parser_passes_errors_through():
    with pytest.raises(PdfExtractionError) as error:
        extract_policy_from_pdf_isolated(_blank_pdf())
    assert "page 1" in str(error.value)


def test_isolated_parser_enforces_page_limit():
    with pytest.raises(PdfExtractionError) as error:
        extract_policy_from_pdf_isolated(_blank_pdf(pages=51))
    assert error.value.status_code == 413


def test_isolated_parser_times_out_and_kills_worker(monkeypatch):
    with pytest.raises(PdfExtractionError) as error:
        extract_policy_from_pdf_isolated(_blank_pdf(), timeout=0.0001)
    assert "too long" in str(error.value)
