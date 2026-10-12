import re

from .segmenter import segment_policy


# Narrow rules for obvious instructions targeting an AI system.
# These are heuristics, not proof that a passage is malicious.
RULES = (
    (
        "override_instructions",
        re.compile(
            r"\b(?:ignore|disregard|override)\s+"
            r"(?:(?:all|the|any)\s+)?"
            r"(?:previous|prior|above|system|developer)\s+"
            r"(?:instructions?|prompts?|messages?)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "suppress_output",
        re.compile(
            r"\b(?:do\s+not|don't|never)\s+"
            r"(?:mention|include|report|disclose)\b"
            r"[^\n.!?]{0,160}"
            r"\b(?:answer|response|summary|output)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "force_output",
        re.compile(
            r"\b(?:output|respond\s+with|reply\s+with)\s+"
            r"only\b",
            re.IGNORECASE,
        ),
    ),
    (
        "role_impersonation",
        re.compile(
            r"\byou\s+are\s+now\s+"
            r"(?:an?\s+)?"
            r"(?:(?:different|new|helpful|unrestricted)\s+)?"
            r"(?:assistant|chatbot|language\s+model)\b",
            re.IGNORECASE,
        ),
    ),
)

# Simple boundary heuristic. It is not a full sentence parser.
BOUNDARY_PATTERN = re.compile(
    r"\r\n|\r|\n|[.!?。！？](?=\s|$)"
)


def detect_instruction_spans(text):
    """
    Return exact offsets of matched phrases in the supplied text.

    For URL/PDF input, offsets refer to extracted text,
    not HTML positions or PDF page coordinates.
    """
    findings = []

    for rule_name, pattern in RULES:
        for match in pattern.finditer(text):
            findings.append({
                "start": match.start(),
                "end": match.end(),
                "rule": rule_name,
            })

    return sorted(
        findings,
        key=lambda item: (
            item["start"],
            item["end"],
            item["rule"],
        ),
    )


def _isolation_ranges(text, findings):
    """
    Expand each match to nearby sentence/line boundaries.
    Merge overlapping ranges without removing their contents.
    """
    boundaries = [0]

    boundaries.extend(
        match.end()
        for match in BOUNDARY_PATTERN.finditer(text)
    )

    boundaries.append(len(text))
    boundaries = sorted(set(boundaries))

    ranges = []

    for finding in findings:
        start = max(
            position
            for position in boundaries
            if position <= finding["start"]
        )

        end = min(
            position
            for position in boundaries
            if position >= finding["end"]
        )

        ranges.append((start, end))

    merged = []

    for start, end in sorted(ranges):
        if merged and start <= merged[-1][1]:
            previous_start, previous_end = merged[-1]
            merged[-1] = (
                previous_start,
                max(previous_end, end),
            )
        else:
            merged.append((start, end))

    return merged


def segment_policy_with_guard(policy_text, tokenizer):
    findings = detect_instruction_spans(policy_text)

    # Preserve the existing behaviour when no rule matches.
    if not findings:
        return (
            segment_policy(policy_text, tokenizer=tokenizer),
            [],
        )

    ranges = _isolation_ranges(policy_text, findings)
    blocks = []
    cursor = 0

    for start, end in ranges:
        if cursor < start:
            blocks.append((cursor, start, False))

        blocks.append((start, end, True))
        cursor = end

    if cursor < len(policy_text):
        blocks.append((cursor, len(policy_text), False))

    segments = []

    for start, end, flagged in blocks:
        block_text = policy_text[start:end]

        if not block_text.strip():
            continue

        # Process each block separately so pack_sentences cannot
        # recombine flagged passages with neighbouring blocks.
        block_segments = segment_policy(
            block_text,
            tokenizer=tokenizer,
        )

        for segment in block_segments:
            segments.append({
                **segment,
                "segment_id": len(segments),
                "instruction_like": flagged,
                # These offsets describe the enclosing block,
                # not the exact individual segment.
                "source_block_start": start,
                "source_block_end": end,
            })

    warnings = [{
        "code": "INSTRUCTION_LIKE_TEXT",
        "message": (
            "Some source text resembles instructions directed "
            "at an automated analysis system. It was retained "
            "and processed in separate blocks. Please verify "
            "the analysis against the original policy."
        ),
        "match_count": len(findings),
        "findings": findings,
        "segment_ids": [
            segment["segment_id"]
            for segment in segments
            if segment["instruction_like"]
        ],
    }]

    return segments, warnings